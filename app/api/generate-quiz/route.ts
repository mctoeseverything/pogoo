import { type NextRequest } from "next/server";

interface FileData {
  name: string;
  type: string;
  content: string | null;
  textContent: string | null;
}

interface QuizConfig {
  questionCount: number;
  types: ("multiple-choice" | "true-false" | "short-answer")[];
  difficulty: "easy" | "medium" | "hard";
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Extract meaningful sentences from text
function extractSentences(text: string): string[] {
  const sentences = text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 300)
    .filter((s) => !s.startsWith("http") && !s.includes("@"));
  return sentences;
}

// Extract key terms/concepts from text
function extractKeyTerms(text: string): string[] {
  // Look for capitalized terms, quoted terms, or terms after "is", "are", "means"
  const patterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, // Capitalized phrases
    /"([^"]+)"/g, // Quoted terms
    /\b(?:is|are|means?|refers?\s+to)\s+(?:a|an|the)?\s*([^,.]+)/gi, // Definitions
  ];

  const terms = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const term = match[1]?.trim();
      if (term && term.length > 3 && term.length < 50) {
        terms.add(term);
      }
    }
  }
  return Array.from(terms);
}

// Extract facts (sentences with specific keywords)
function extractFacts(text: string): string[] {
  const factPatterns = [
    /[^.]*\b(?:is|are|was|were|has|have|can|will|must|should)\b[^.]*\./gi,
    /[^.]*\b(?:important|significant|essential|key|main|primary|crucial)\b[^.]*\./gi,
    /[^.]*\b(?:first|second|third|finally|however|therefore|because)\b[^.]*\./gi,
  ];

  const facts = new Set<string>();
  for (const pattern of factPatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      const fact = match.trim();
      if (fact.length > 40 && fact.length < 250) {
        facts.add(fact);
      }
    }
  }
  return Array.from(facts);
}

// Generate wrong answers based on correct answer
function generateWrongAnswers(
  correctAnswer: string,
  allTerms: string[],
  count: number = 3
): string[] {
  const wrongAnswers: string[] = [];

  // Try to use related terms from the content
  const filteredTerms = allTerms.filter(
    (t) => t.toLowerCase() !== correctAnswer.toLowerCase() && t.length > 3
  );

  if (filteredTerms.length >= count) {
    wrongAnswers.push(...shuffle(filteredTerms).slice(0, count));
  } else {
    wrongAnswers.push(...filteredTerms);

    // Generate plausible wrong answers
    const genericWrong = [
      "An unrelated concept from a different field",
      "A common misconception about the topic",
      "The opposite of the correct interpretation",
      "A partially correct but incomplete answer",
      "A term that sounds similar but means something different",
      "An outdated understanding of the concept",
    ];

    while (wrongAnswers.length < count) {
      const wrong = genericWrong[wrongAnswers.length % genericWrong.length];
      if (!wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }
  }

  return wrongAnswers.slice(0, count);
}

// Generate a multiple choice question
function generateMultipleChoice(
  sentences: string[],
  terms: string[],
  facts: string[],
  usedIndices: Set<number>,
  difficulty: string
): {
  question: string;
  options: string[];
  correctAnswer: string;
} | null {
  const availableFacts = facts.filter((_, i) => !usedIndices.has(i));
  if (availableFacts.length === 0) return null;

  const factIndex = Math.floor(Math.random() * availableFacts.length);
  const fact = availableFacts[factIndex];
  usedIndices.add(facts.indexOf(fact));

  // Extract the key part of the fact to ask about
  const words = fact.split(" ");
  let keyPart = "";
  let questionPart = "";

  // Find a good split point
  const splitWords = ["is", "are", "was", "were", "means", "refers", "includes", "contains"];
  for (const split of splitWords) {
    const idx = words.findIndex((w) => w.toLowerCase() === split);
    if (idx > 2 && idx < words.length - 3) {
      questionPart = words.slice(0, idx + 1).join(" ");
      keyPart = words.slice(idx + 1).join(" ").replace(/[.!?]$/, "");
      break;
    }
  }

  if (!keyPart) {
    // Fallback: use the whole fact
    const templates =
      difficulty === "easy"
        ? [
            `According to the materials, which statement is correct?`,
            `What does the text say about this topic?`,
          ]
        : difficulty === "hard"
          ? [
              `Based on your understanding of the material, which of the following best describes the concept?`,
              `Synthesizing the information provided, which statement is most accurate?`,
            ]
          : [
              `Which of the following is true based on the materials?`,
              `The materials indicate that:`,
            ];

    return {
      question: templates[Math.floor(Math.random() * templates.length)],
      options: shuffle([
        fact.replace(/[.!?]$/, ""),
        ...generateWrongAnswers(fact, terms, 3),
      ]),
      correctAnswer: fact.replace(/[.!?]$/, ""),
    };
  }

  const question = `${questionPart}...?`.replace(/\s+/g, " ");
  const correctAnswer = keyPart.trim();
  const wrongAnswers = generateWrongAnswers(correctAnswer, terms, 3);

  return {
    question,
    options: shuffle([correctAnswer, ...wrongAnswers]),
    correctAnswer,
  };
}

// Generate a true/false question
function generateTrueFalse(
  facts: string[],
  usedIndices: Set<number>,
  difficulty: string
): {
  question: string;
  options: string[];
  correctAnswer: string;
} | null {
  const availableFacts = facts.filter((_, i) => !usedIndices.has(i));
  if (availableFacts.length === 0) return null;

  const factIndex = Math.floor(Math.random() * availableFacts.length);
  const fact = availableFacts[factIndex];
  usedIndices.add(facts.indexOf(fact));

  const isTrue = Math.random() > 0.5;

  let statement = fact.replace(/[.!?]$/, "");

  if (!isTrue) {
    // Negate or alter the statement to make it false
    const negations = [
      { find: /\bis\b/i, replace: "is not" },
      { find: /\bare\b/i, replace: "are not" },
      { find: /\bcan\b/i, replace: "cannot" },
      { find: /\bwill\b/i, replace: "will not" },
      { find: /\balways\b/i, replace: "never" },
      { find: /\bnever\b/i, replace: "always" },
      { find: /\bimportant\b/i, replace: "unimportant" },
      { find: /\bessential\b/i, replace: "optional" },
    ];

    let negated = false;
    for (const neg of negations) {
      if (neg.find.test(statement)) {
        statement = statement.replace(neg.find, neg.replace);
        negated = true;
        break;
      }
    }

    if (!negated) {
      statement = `It is false that ${statement.charAt(0).toLowerCase()}${statement.slice(1)}`;
    }
  }

  const prefix =
    difficulty === "easy"
      ? "True or False:"
      : difficulty === "hard"
        ? "Evaluate this statement:"
        : "Is this statement true or false?";

  return {
    question: `${prefix} ${statement}`,
    options: ["True", "False"],
    correctAnswer: isTrue ? "True" : "False",
  };
}

// Generate a short answer question
function generateShortAnswer(
  sentences: string[],
  terms: string[],
  usedIndices: Set<number>,
  difficulty: string
): {
  question: string;
  correctAnswer: string;
} | null {
  const availableSentences = sentences.filter((_, i) => !usedIndices.has(i));
  if (availableSentences.length === 0 && terms.length === 0) return null;

  const templates = {
    easy: [
      `Define the term or concept mentioned in the materials.`,
      `In your own words, explain what the text says about the main topic.`,
      `Summarize the key point from the reading.`,
    ],
    medium: [
      `Explain the significance of the concepts discussed in the materials.`,
      `How does the text describe the relationship between the main ideas?`,
      `What are the main arguments or points presented in the materials?`,
    ],
    hard: [
      `Critically analyze the main argument presented in the materials.`,
      `Compare and contrast the different perspectives mentioned in the text.`,
      `What implications can be drawn from the information provided?`,
    ],
  };

  const questionTemplates = templates[difficulty as keyof typeof templates] || templates.medium;
  const question = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];

  // Use a sentence or term as the basis for the sample answer
  let sampleAnswer = "Answers will vary based on student understanding of the material.";
  if (availableSentences.length > 0) {
    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    sampleAnswer = `Sample answer: ${sentence}`;
    usedIndices.add(sentences.indexOf(sentence));
  } else if (terms.length > 0) {
    sampleAnswer = `Key concepts to mention: ${terms.slice(0, 3).join(", ")}`;
  }

  return {
    question,
    correctAnswer: sampleAnswer,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { files, config } = (await req.json()) as {
      files: FileData[];
      config: QuizConfig;
    };

    const { questionCount, types, difficulty } = config;

    // Extract text content from all files
    let combinedText = "";
    for (const file of files) {
      if (file.textContent) {
        combinedText += file.textContent + "\n\n";
      } else if (file.content) {
        // Handle text-based file types
        if (file.type.startsWith("text/") || 
            file.name.match(/\.(txt|md|csv|json|xml|html)$/i)) {
          // Decode base64 text content
          try {
            const decoded = atob(file.content);
            combinedText += decoded + "\n\n";
          } catch {
            // Skip if decoding fails
          }
        }
        // Note: PDF support requires text files for now
        // Upload .txt or .md files for best results
      }
    }

    if (!combinedText.trim()) {
      return Response.json(
        {
          error:
            "Could not extract text from the uploaded files. Please upload text-based files (.txt, .md) for best results.",
        },
        { status: 400 }
      );
    }

    // Analyze the content
    const sentences = extractSentences(combinedText);
    const terms = extractKeyTerms(combinedText);
    const facts = extractFacts(combinedText);

    if (facts.length < 3 && sentences.length < 5) {
      return Response.json(
        {
          error:
            "The uploaded content doesn't contain enough information to generate a quiz. Please provide more detailed materials.",
        },
        { status: 400 }
      );
    }

    // Generate quiz title from filename or content
    const title = files[0]?.name
      ? `Quiz: ${files[0].name.replace(/\.[^/.]+$/, "")}`
      : `Quiz on ${terms.slice(0, 2).join(" and ") || "Uploaded Materials"}`;

    // Generate questions
    const questions: Array<{
      id: string;
      type: "multiple-choice" | "true-false" | "short-answer";
      question: string;
      options?: string[];
      correctAnswer: string;
    }> = [];

    const usedFactIndices = new Set<number>();
    const usedSentenceIndices = new Set<number>();

    // Distribute question types
    const typeDistribution: ("multiple-choice" | "true-false" | "short-answer")[] = [];
    for (let i = 0; i < questionCount; i++) {
      typeDistribution.push(types[i % types.length]);
    }
    const shuffledTypes = shuffle(typeDistribution);

    for (let i = 0; i < questionCount; i++) {
      const type = shuffledTypes[i];
      const id = `q-${i + 1}`;

      let questionData: {
        question: string;
        options?: string[];
        correctAnswer: string;
      } | null = null;

      if (type === "multiple-choice") {
        questionData = generateMultipleChoice(
          sentences,
          terms,
          facts,
          usedFactIndices,
          difficulty
        );
      } else if (type === "true-false") {
        questionData = generateTrueFalse(facts, usedFactIndices, difficulty);
      } else {
        questionData = generateShortAnswer(
          sentences,
          terms,
          usedSentenceIndices,
          difficulty
        );
      }

      if (questionData) {
        questions.push({
          id,
          type,
          ...questionData,
        });
      } else {
        // Fallback question
        questions.push({
          id,
          type: "short-answer",
          question: `Based on the materials, explain a key concept you learned.`,
          correctAnswer:
            "Answers will vary. Look for understanding of main concepts from the text.",
        });
      }
    }

    return Response.json({
      quiz: {
        title,
        questions,
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return Response.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
