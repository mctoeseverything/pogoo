"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { DecorativeShapes } from "@/components/decorative-shapes";
import { ClassroomEditor } from "@/components/seating/classroom-editor";
import { StudentManager } from "@/components/seating/student-manager";
import { RulesManager } from "@/components/seating/rules-manager";
import { SeatingResult } from "@/components/seating/seating-result";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, LayoutGrid, Users, Shield } from "lucide-react";

export interface Student {
  id: string;
  name: string;
  color: string;
}

export interface SeatingRule {
  id: string;
  type: "keep-apart" | "keep-together" | "front-row" | "back-row";
  students: string[];
  description: string;
}

export interface Desk {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface ClassroomConfig {
  gridRows: number;
  gridCols: number;
  desks: Desk[];
}

export interface SeatAssignment {
  deskId: string;
  studentId: string | null;
  x: number;
  y: number;
}

// Default layout with traditional rows
const createDefaultDesks = (): Desk[] => {
  const desks: Desk[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      desks.push({
        id: `desk-${row}-${col}`,
        x: col * 2,
        y: row + 1,
        rotation: 0,
        width: 1,
        height: 1,
      });
    }
  }
  return desks;
};

export default function SeatingChartPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rules, setRules] = useState<SeatingRule[]>([]);
  const [classroomConfig, setClassroomConfig] = useState<ClassroomConfig>({
    gridRows: 8,
    gridCols: 12,
    desks: createDefaultDesks(),
  });
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("layout");

  const generateSeating = async () => {
    if (students.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate seating generation with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const desks = [...classroomConfig.desks];
    const assignments: SeatAssignment[] = [];
    
    // Sort desks by position (front to back, left to right)
    const sortedDesks = [...desks].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    // Clone students and shuffle
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    // Apply rules-aware placement
    const placedStudents = new Set<string>();
    const deskToStudent = new Map<string, string>();
    
    // Get front row desks (lowest y values)
    const minY = Math.min(...sortedDesks.map((d) => d.y));
    const maxY = Math.max(...sortedDesks.map((d) => d.y));
    const frontDesks = sortedDesks.filter((d) => d.y === minY);
    const backDesks = sortedDesks.filter((d) => d.y === maxY);
    
    // First pass: handle front-row and back-row rules
    for (const rule of rules) {
      if (rule.type === "front-row") {
        for (const studentId of rule.students) {
          const availableDesk = frontDesks.find(
            (d) => !deskToStudent.has(d.id)
          );
          if (availableDesk && !placedStudents.has(studentId)) {
            deskToStudent.set(availableDesk.id, studentId);
            placedStudents.add(studentId);
          }
        }
      } else if (rule.type === "back-row") {
        for (const studentId of rule.students) {
          const availableDesk = backDesks.find(
            (d) => !deskToStudent.has(d.id)
          );
          if (availableDesk && !placedStudents.has(studentId)) {
            deskToStudent.set(availableDesk.id, studentId);
            placedStudents.add(studentId);
          }
        }
      }
    }
    
    // Second pass: handle keep-together rules
    for (const rule of rules) {
      if (rule.type === "keep-together") {
        const unplacedInGroup = rule.students.filter((id) => !placedStudents.has(id));
        if (unplacedInGroup.length < 2) continue;
        
        // Find adjacent desks
        for (let i = 0; i < sortedDesks.length - 1; i++) {
          const desk1 = sortedDesks[i];
          const desk2 = sortedDesks[i + 1];
          
          if (!deskToStudent.has(desk1.id) && !deskToStudent.has(desk2.id)) {
            const distance = Math.abs(desk1.x - desk2.x) + Math.abs(desk1.y - desk2.y);
            if (distance <= 2 && unplacedInGroup.length >= 2) {
              deskToStudent.set(desk1.id, unplacedInGroup[0]);
              deskToStudent.set(desk2.id, unplacedInGroup[1]);
              placedStudents.add(unplacedInGroup[0]);
              placedStudents.add(unplacedInGroup[1]);
              break;
            }
          }
        }
      }
    }
    
    // Third pass: place remaining students considering keep-apart rules
    for (const student of shuffledStudents) {
      if (placedStudents.has(student.id)) continue;
      
      // Find best desk considering keep-apart rules
      let bestDesk: Desk | null = null;
      let bestScore = -1;
      
      for (const desk of sortedDesks) {
        if (deskToStudent.has(desk.id)) continue;
        
        let score = 100;
        
        // Check keep-apart rules
        for (const rule of rules) {
          if (rule.type === "keep-apart" && rule.students.includes(student.id)) {
            const otherStudents = rule.students.filter((s) => s !== student.id);
            for (const otherId of otherStudents) {
              // Find where the other student is seated
              for (const [deskId, seatStudent] of deskToStudent.entries()) {
                if (seatStudent === otherId) {
                  const otherDesk = desks.find((d) => d.id === deskId);
                  if (otherDesk) {
                    const distance = Math.abs(desk.x - otherDesk.x) + Math.abs(desk.y - otherDesk.y);
                    // Penalize proximity, reward distance
                    if (distance <= 2) {
                      score -= (3 - distance) * 30;
                    } else {
                      score += Math.min(distance, 10);
                    }
                  }
                }
              }
            }
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestDesk = desk;
        }
      }
      
      if (bestDesk) {
        deskToStudent.set(bestDesk.id, student.id);
        placedStudents.add(student.id);
      }
    }

    // Convert to assignments array
    for (const desk of sortedDesks) {
      const studentId = deskToStudent.get(desk.id) || null;
      assignments.push({
        deskId: desk.id,
        studentId,
        x: desk.x,
        y: desk.y,
      });
    }

    setSeatAssignments(assignments);
    setIsGenerating(false);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <DecorativeShapes />
      <Navigation />
      
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Seating Chart Generator</h1>
          <p className="mt-2 text-muted-foreground">
            Design your classroom layout, add students and rules, then generate optimal seating.
          </p>
        </div>

        {!seatAssignments ? (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="layout" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  <Users className="h-4 w-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="rules" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Rules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="mt-6">
                <ClassroomEditor
                  config={classroomConfig}
                  onConfigChange={setClassroomConfig}
                />
              </TabsContent>

              <TabsContent value="students" className="mt-6">
                <StudentManager
                  students={students}
                  onStudentsChange={setStudents}
                />
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <RulesManager
                  rules={rules}
                  onRulesChange={setRules}
                  students={students}
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Ready to generate?
                </p>
                <p className="text-xs text-muted-foreground">
                  {students.length} students, {rules.length} rules, {classroomConfig.desks.length} desks
                </p>
              </div>
              <Button
                onClick={generateSeating}
                disabled={students.length === 0 || isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Seating Chart
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <SeatingResult
            assignments={seatAssignments}
            students={students}
            config={classroomConfig}
            rules={rules}
            onRegenerate={() => {
              setSeatAssignments(null);
              generateSeating();
            }}
            onStartOver={() => setSeatAssignments(null)}
          />
        )}
      </main>
    </div>
  );
}
