"use client";

import type { SeatAssignment, Student, ClassroomConfig, SeatingRule } from "@/app/seating/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw, ArrowLeft, FileDown, Check, AlertTriangle } from "lucide-react";
import { generateSeatingPDF } from "@/lib/seating-pdf-generator";

interface SeatingResultProps {
  assignments: SeatAssignment[];
  students: Student[];
  config: ClassroomConfig;
  rules: SeatingRule[];
  onRegenerate: () => void;
  onStartOver: () => void;
}

const CELL_SIZE = 56;

export function SeatingResult({
  assignments,
  students,
  config,
  rules,
  onRegenerate,
  onStartOver,
}: SeatingResultProps) {
  const getStudent = (studentId: string | null) => {
    if (!studentId) return null;
    return students.find((s) => s.id === studentId);
  };

  // Check rule compliance
  const checkRuleCompliance = () => {
    const violations: string[] = [];
    const satisfied: string[] = [];

    for (const rule of rules) {
      if (rule.type === "keep-apart") {
        const studentAssignments = rule.students
          .map((id) => assignments.find((a) => a.studentId === id))
          .filter(Boolean);

        let hasViolation = false;
        for (let i = 0; i < studentAssignments.length; i++) {
          for (let j = i + 1; j < studentAssignments.length; j++) {
            const a1 = studentAssignments[i]!;
            const a2 = studentAssignments[j]!;
            const distance = Math.abs(a1.x - a2.x) + Math.abs(a1.y - a2.y);
            if (distance <= 2) {
              hasViolation = true;
            }
          }
        }
        if (hasViolation) {
          violations.push(rule.description);
        } else {
          satisfied.push(rule.description);
        }
      } else if (rule.type === "keep-together") {
        const studentAssignments = rule.students
          .map((id) => assignments.find((a) => a.studentId === id))
          .filter(Boolean);

        let areClose = true;
        for (let i = 0; i < studentAssignments.length; i++) {
          for (let j = i + 1; j < studentAssignments.length; j++) {
            const a1 = studentAssignments[i]!;
            const a2 = studentAssignments[j]!;
            const distance = Math.abs(a1.x - a2.x) + Math.abs(a1.y - a2.y);
            if (distance > 3) {
              areClose = false;
            }
          }
        }
        if (areClose) {
          satisfied.push(rule.description);
        } else {
          violations.push(rule.description);
        }
      } else if (rule.type === "front-row") {
        const minY = Math.min(...assignments.map((a) => a.y));
        const studentAssignment = assignments.find(
          (a) => rule.students.includes(a.studentId || "")
        );
        if (studentAssignment && studentAssignment.y === minY) {
          satisfied.push(rule.description);
        } else if (studentAssignment) {
          violations.push(rule.description);
        }
      } else if (rule.type === "back-row") {
        const maxY = Math.max(...assignments.map((a) => a.y));
        const studentAssignment = assignments.find(
          (a) => rule.students.includes(a.studentId || "")
        );
        if (studentAssignment && studentAssignment.y === maxY) {
          satisfied.push(rule.description);
        } else if (studentAssignment) {
          violations.push(rule.description);
        }
      }
    }

    return { violations, satisfied };
  };

  const { violations, satisfied } = checkRuleCompliance();

  const handleExportPDF = () => {
    generateSeatingPDF(assignments, students, config);
  };

  // Calculate grid bounds from assignments
  const minX = Math.min(...assignments.map((a) => a.x), 0);
  const maxX = Math.max(...assignments.map((a) => a.x), config.gridCols - 1);
  const minY = Math.min(...assignments.map((a) => a.y), 0);
  const maxY = Math.max(...assignments.map((a) => a.y), config.gridRows - 1);
  
  const gridWidth = (maxX - minX + 1) * CELL_SIZE;
  const gridHeight = (maxY - minY + 1) * CELL_SIZE;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={onStartOver}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Setup
        </Button>
        <Button variant="outline" onClick={onRegenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        <div className="flex-1" />
        <Button onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seating Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-6 text-lg font-semibold text-foreground">Generated Seating Chart</h3>
          
          {/* Teacher's desk */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-lg bg-primary/20 px-12 py-3 text-sm font-medium text-primary">
              Front of Classroom
            </div>
          </div>

          {/* Dynamic Grid Layout */}
          <div className="overflow-auto">
            <div
              className="relative mx-auto"
              style={{
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border) / 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border) / 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                }}
              />

              {/* Desks with students */}
              {assignments.map((assignment) => {
                const student = getStudent(assignment.studentId);
                const desk = config.desks.find((d) => d.id === assignment.deskId);
                
                return (
                  <div
                    key={assignment.deskId}
                    className={cn(
                      "absolute rounded-xl border-2 p-1 transition-all flex items-center justify-center",
                      student
                        ? "border-border bg-secondary"
                        : "border-dashed border-border/50 bg-secondary/30"
                    )}
                    style={{
                      left: (assignment.x - minX) * CELL_SIZE + 4,
                      top: (assignment.y - minY) * CELL_SIZE + 4,
                      width: CELL_SIZE - 8,
                      height: CELL_SIZE - 8,
                      transform: desk ? `rotate(${desk.rotation}deg)` : undefined,
                    }}
                  >
                    {student && (
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="mb-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${student.color}30`,
                            color: student.color,
                          }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-[9px] leading-tight text-foreground line-clamp-1 max-w-full px-0.5">
                          {student.name.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            {students.slice(0, 8).map((student) => (
              <div key={student.id} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: student.color }}
                />
                <span>{student.name.split(" ")[0]}</span>
              </div>
            ))}
            {students.length > 8 && (
              <span className="text-muted-foreground">+{students.length - 8} more</span>
            )}
          </div>
        </div>

        {/* Rule Compliance */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Rule Compliance</h3>
            
            {rules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rules were applied to this seating chart.
              </p>
            ) : (
              <div className="space-y-3">
                {satisfied.map((rule, i) => (
                  <div
                    key={`satisfied-${i}`}
                    className="flex items-start gap-2 rounded-lg bg-primary/10 p-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{rule}</span>
                  </div>
                ))}
                {violations.map((rule, i) => (
                  <div
                    key={`violation-${i}`}
                    className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span className="text-sm text-foreground">{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Students</span>
                <span className="text-sm font-medium text-foreground">{students.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Desks</span>
                <span className="text-sm font-medium text-foreground">
                  {config.desks.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Empty Desks</span>
                <span className="text-sm font-medium text-foreground">
                  {config.desks.length - students.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rules Applied</span>
                <span className="text-sm font-medium text-foreground">{rules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rules Satisfied</span>
                <span className="text-sm font-medium text-primary">{satisfied.length}/{rules.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
