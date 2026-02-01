"use client";

import { useState } from "react";
import type { Student, SeatingRule } from "@/app/seating/page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, X, Shield, UserMinus, UserPlus, ArrowUp, ArrowDown } from "lucide-react";

interface RulesManagerProps {
  rules: SeatingRule[];
  onRulesChange: (rules: SeatingRule[]) => void;
  students: Student[];
}

const RULE_TYPES = [
  { id: "keep-apart", label: "Keep Apart", icon: UserMinus, description: "These students should not sit next to each other" },
  { id: "keep-together", label: "Keep Together", icon: UserPlus, description: "These students should sit near each other" },
  { id: "front-row", label: "Front Row", icon: ArrowUp, description: "Student should sit in the front row" },
  { id: "back-row", label: "Back Row", icon: ArrowDown, description: "Student should sit in the back row" },
] as const;

export function RulesManager({ rules, onRulesChange, students }: RulesManagerProps) {
  const [selectedType, setSelectedType] = useState<SeatingRule["type"]>("keep-apart");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const addRule = () => {
    if (selectedStudents.length === 0) return;
    if ((selectedType === "keep-apart" || selectedType === "keep-together") && selectedStudents.length < 2) return;

    const ruleType = RULE_TYPES.find((t) => t.id === selectedType)!;
    const studentNames = selectedStudents
      .map((id) => students.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(" & ");

    const rule: SeatingRule = {
      id: `rule-${Date.now()}`,
      type: selectedType,
      students: selectedStudents,
      description: `${ruleType.label}: ${studentNames}`,
    };

    onRulesChange([...rules, rule]);
    setSelectedStudents([]);
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      // For front-row and back-row, only allow one student
      if (selectedType === "front-row" || selectedType === "back-row") {
        setSelectedStudents([studentId]);
      } else {
        setSelectedStudents([...selectedStudents, studentId]);
      }
    }
  };

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name || "Unknown";
  const getStudentColor = (id: string) => students.find((s) => s.id === id)?.color || "#888";

  const getRuleIcon = (type: SeatingRule["type"]) => {
    const ruleType = RULE_TYPES.find((t) => t.id === type);
    return ruleType?.icon || Shield;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Add Rules */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Add Rule</h3>
        </div>

        <div className="space-y-4">
          {/* Rule Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Rule Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {RULE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedStudents([]);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-border p-3 text-left text-sm transition-all",
                      selectedType === type.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {RULE_TYPES.find((t) => t.id === selectedType)?.description}
            </p>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-foreground">
              Select Student{(selectedType === "keep-apart" || selectedType === "keep-together") ? "s" : ""}
            </Label>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add students first to create rules.
              </p>
            ) : (
              <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      selectedStudents.includes(student.id)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: student.color }}
                    />
                    {student.name}
                    {selectedStudents.includes(student.id) && (
                      <span className="ml-auto text-xs">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={addRule}
            disabled={
              selectedStudents.length === 0 ||
              ((selectedType === "keep-apart" || selectedType === "keep-together") &&
                selectedStudents.length < 2)
            }
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Active Rules</h3>
          {rules.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRulesChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {rules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No rules added yet</p>
            <p className="text-xs text-muted-foreground/70">Rules help optimize your seating arrangement</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => {
              const Icon = getRuleIcon(rule.type);
              return (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {rule.type.replace("-", " ")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {rule.students.map((studentId) => (
                        <span
                          key={studentId}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: `${getStudentColor(studentId)}20`,
                            color: getStudentColor(studentId),
                          }}
                        >
                          {getStudentName(studentId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => removeRule(rule.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {rules.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {rules.length} rule{rules.length !== 1 ? "s" : ""} will be applied
          </p>
        )}
      </div>
    </div>
  );
}
