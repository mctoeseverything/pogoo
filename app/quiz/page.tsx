"use client";

import React from "react"

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { DecorativeShapes } from "@/components/decorative-shapes";
import { FileUploader } from "@/components/quiz/file-uploader";
import { QuizPreview } from "@/components/quiz/quiz-preview";
import { QuizSettings } from "@/components/quiz/quiz-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, RefreshCw, Pencil, Check } from "lucide-react";

export interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface QuizConfig {
  questionCount: number;
  types: ("multiple-choice" | "true-false" | "short-answer")[];
  difficulty: "easy" | "medium" | "hard";
}

export default function QuizGeneratorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<QuizConfig>({
    questionCount: 10,
    types: ["multiple-choice", "true-false", "short-answer"],
    difficulty: "medium",
  });

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 data after the data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const generateQuiz = async () => {
    if (files.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare files for the API
      const fileData = await Promise.all(
        files.map(async (file) => {
          const isTextFile = file.type.startsWith("text/") || 
            file.name.endsWith(".txt") || 
            file.name.endsWith(".md");
          
          if (isTextFile) {
            const textContent = await readFileAsText(file);
            return {
              name: file.name,
              type: "text/plain",
              textContent,
              content: null,
            };
          } else {
            const content = await readFileAsBase64(file);
            return {
              name: file.name,
              type: file.type || "application/octet-stream",
              content,
              textContent: null,
            };
          }
        })
      );

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: fileData,
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      
      // Ensure options arrays exist for multiple-choice and true-false
      const processedQuiz = {
        ...data.quiz,
        questions: data.quiz.questions.map((q: Question) => ({
          ...q,
          options: q.options || (q.type === "true-false" ? ["True", "False"] : undefined),
        })),
      };
      
      setQuiz(processedQuiz);
      setEditedTitle(processedQuiz.title);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuiz = () => {
    setQuiz(null);
    setError(null);
    generateQuiz();
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditedTitle(quiz?.title || "");
  };

  const handleTitleSave = () => {
    if (quiz && editedTitle.trim()) {
      setQuiz({ ...quiz, title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(quiz?.title || "");
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <DecorativeShapes />
      <Navigation />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quiz Generator</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your teaching materials and generate comprehensive quizzes instantly using AI.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {!quiz ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FileUploader files={files} onFilesChange={setFiles} />
            </div>
            <div className="space-y-6">
              <QuizSettings config={config} onConfigChange={setConfig} />
              <Button
                onClick={generateQuiz}
                disabled={files.length === 0 || isGenerating}
                className="w-full h-12"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
              {isGenerating && (
                <p className="text-sm text-muted-foreground text-center">
                  AI is analyzing your materials and creating questions...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        className="text-2xl font-semibold h-auto py-1 px-2 w-80"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleTitleSave}
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {quiz.title}
                      </h2>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleTitleEdit}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {quiz.questions.length} questions
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={regenerateQuiz}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuiz(null);
                    setFiles([]);
                    setError(null);
                  }}
                >
                  Start Over
                </Button>
              </div>
            </div>
            <QuizPreview quiz={quiz} onQuizChange={setQuiz} />
          </div>
        )}
      </main>
    </div>
  );
}
