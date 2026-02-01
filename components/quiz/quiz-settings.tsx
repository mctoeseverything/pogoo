"use client";

import type { QuizConfig } from "@/app/quiz/page";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";

interface QuizSettingsProps {
  config: QuizConfig;
  onConfigChange: (config: QuizConfig) => void;
}

export function QuizSettings({ config, onConfigChange }: QuizSettingsProps) {
  const questionTypes: { id: QuizConfig["types"][number]; label: string }[] = [
    { id: "multiple-choice", label: "Multiple Choice" },
    { id: "true-false", label: "True/False" },
    { id: "short-answer", label: "Short Answer" },
  ];

  const toggleType = (type: QuizConfig["types"][number]) => {
    const newTypes = config.types.includes(type)
      ? config.types.filter((t) => t !== type)
      : [...config.types, type];
    
    if (newTypes.length === 0) return; // Keep at least one type
    
    onConfigChange({ ...config, types: newTypes });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Quiz Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Question Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground">Number of Questions</Label>
            <span className="text-sm font-medium text-primary">{config.questionCount}</span>
          </div>
          <Slider
            value={[config.questionCount]}
            onValueChange={([value]) => onConfigChange({ ...config, questionCount: value })}
            min={5}
            max={30}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-3">
          <Label className="text-sm text-foreground">Question Types</Label>
          <div className="space-y-2">
            {questionTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-3">
                <Checkbox
                  id={type.id}
                  checked={config.types.includes(type.id)}
                  onCheckedChange={() => toggleType(type.id)}
                />
                <label
                  htmlFor={type.id}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <Label className="text-sm text-foreground">Difficulty Level</Label>
          <RadioGroup
            value={config.difficulty}
            onValueChange={(value) =>
              onConfigChange({ ...config, difficulty: value as QuizConfig["difficulty"] })
            }
            className="flex gap-2"
          >
            {(["easy", "medium", "hard"] as const).map((level) => (
              <div key={level} className="flex-1">
                <RadioGroupItem
                  value={level}
                  id={level}
                  className="peer sr-only"
                />
                <label
                  htmlFor={level}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize text-muted-foreground transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:bg-secondary"
                >
                  {level}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
