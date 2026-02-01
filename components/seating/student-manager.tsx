"use client";

import React from "react"

import { useState } from "react";
import type { Student } from "@/app/seating/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X, Users, Upload } from "lucide-react";

interface StudentManagerProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
}

const COLORS = [
  "#1ee876", // Primary green
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

export function StudentManager({ students, onStudentsChange }: StudentManagerProps) {
  const [newName, setNewName] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const addStudent = () => {
    if (!newName.trim()) return;
    
    const student: Student = {
      id: `student-${Date.now()}`,
      name: newName.trim(),
      color: COLORS[students.length % COLORS.length],
    };
    
    onStudentsChange([...students, student]);
    setNewName("");
  };

  const removeStudent = (id: string) => {
    onStudentsChange(students.filter((s) => s.id !== id));
  };

  const handleBulkAdd = () => {
    const names = bulkInput
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    
    const newStudents = names.map((name, i) => ({
      id: `student-${Date.now()}-${i}`,
      name,
      color: COLORS[(students.length + i) % COLORS.length],
    }));
    
    onStudentsChange([...students, ...newStudents]);
    setBulkInput("");
    setShowBulk(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addStudent();
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Add Students */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Add Students</h3>
        </div>

        {!showBulk ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter student name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={addStudent} disabled={!newName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowBulk(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Add Students
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              className="min-h-[200px] w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter one student name per line..."
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleBulkAdd} disabled={!bulkInput.trim()}>
                Add All
              </Button>
              <Button variant="outline" onClick={() => setShowBulk(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quick add presets */}
        <div className="mt-6 rounded-lg bg-secondary/50 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Add Sample Students</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sampleStudents = [
                "Emma Wilson", "Liam Johnson", "Olivia Brown", "Noah Davis",
                "Ava Martinez", "William Garcia", "Sophia Rodriguez", "James Miller",
                "Isabella Wilson", "Benjamin Moore", "Mia Taylor", "Lucas Anderson"
              ];
              const newStudents = sampleStudents.map((name, i) => ({
                id: `student-${Date.now()}-${i}`,
                name,
                color: COLORS[i % COLORS.length],
              }));
              onStudentsChange([...students, ...newStudents]);
            }}
          >
            Add 12 Sample Students
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Student Roster</h3>
          {students.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStudentsChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No students added yet</p>
            <p className="text-xs text-muted-foreground/70">Add students to create your seating chart</p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {students.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-secondary/50"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${student.color}20`, color: student.color }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm text-foreground">{student.name}</span>
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => removeStudent(student.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {students.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {students.length} student{students.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
}
