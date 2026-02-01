"use client";

import { useState } from "react";
import type { Quiz, Question } from "@/app/quiz/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FileDown,
  Pencil,
  Check,
  X,
  Trash2,
  Plus,
  GripVertical,
  ListChecks,
  ToggleLeft,
  MessageSquare,
} from "lucide-react";
import { generateQuizPDF } from "@/lib/pdf-generator";

interface QuizPreviewProps {
  quiz: Quiz;
  onQuizChange: (quiz: Quiz) => void;
}

const getTypeIcon = (type: Question["type"]) => {
  switch (type) {
    case "multiple-choice":
      return ListChecks;
    case "true-false":
      return ToggleLeft;
    case "short-answer":
      return MessageSquare;
  }
};

export function QuizPreview({ quiz, onQuizChange }: QuizPreviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setEditedQuestion({ ...question });
  };

  const saveEdit = () => {
    if (!editedQuestion) return;
    
    const newQuestions = quiz.questions.map((q) =>
      q.id === editedQuestion.id ? editedQuestion : q
    );
    onQuizChange({ ...quiz, questions: newQuestions });
    setEditingId(null);
    setEditedQuestion(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    const newQuestions = quiz.questions.filter((q) => q.id !== id);
    onQuizChange({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: "multiple-choice",
      question: "New question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
    };
    onQuizChange({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const handleExportPDF = () => {
    generateQuizPDF(quiz);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Button
          variant={showAnswers ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? "Hide Answers" : "Show Answers"}
        </Button>
        <Button variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
        <div className="flex-1" />
        <Button onClick={handleExportPDF} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, index) => {
          const isEditing = editingId === question.id;
          const Icon = getTypeIcon(question.type);

          return (
            <div
              key={question.id}
              className={cn(
                "group rounded-xl border border-border bg-card p-6 transition-all",
                isEditing && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing && editedQuestion ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedQuestion.question}
                        onChange={(e) =>
                          setEditedQuestion({ ...editedQuestion, question: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                      
                      {editedQuestion.options && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Options</p>
                          {editedQuestion.options.map((option, i) => (
                            <Input
                              key={i}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...editedQuestion.options!];
                                newOptions[i] = e.target.value;
                                setEditedQuestion({ ...editedQuestion, options: newOptions });
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Check className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" />
                          {question.type.replace("-", " ")}
                        </span>
                      </div>
                      <p className="text-foreground">{question.question}</p>

                      {question.options && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              className={cn(
                                "rounded-lg border border-border bg-background px-4 py-2 text-sm",
                                showAnswers && option === question.correctAnswer &&
                                  "border-primary bg-primary/10 text-primary"
                              )}
                            >
                              <span className="mr-2 font-medium text-muted-foreground">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}

                      {showAnswers && !question.options && (
                        <div className="mt-4 rounded-lg border border-primary/50 bg-primary/5 px-4 py-3">
                          <p className="text-xs font-medium text-primary mb-1">Answer Key:</p>
                          <p className="text-sm text-foreground">{question.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(question)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
