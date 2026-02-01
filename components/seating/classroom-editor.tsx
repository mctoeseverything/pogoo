"use client";

import React from "react"

import { useState, useCallback } from "react";
import type { ClassroomConfig, Desk } from "@/app/seating/page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Plus,
  Trash2,
  RotateCw,
  Grid3X3,
  CircleDot,
  AlignHorizontalJustifyCenter,
  Copy,
  Move,
} from "lucide-react";

interface ClassroomEditorProps {
  config: ClassroomConfig;
  onConfigChange: (config: ClassroomConfig) => void;
}

const GRID_SIZE = 12;
const CELL_SIZE = 48;

const PRESET_LAYOUTS: { name: string; icon: React.ReactNode; desks: Desk[] }[] = [
  {
    name: "Traditional Rows",
    icon: <Grid3X3 className="h-4 w-4" />,
    desks: Array.from({ length: 30 }, (_, i) => ({
      id: `desk-${i}`,
      x: (i % 6) * 2,
      y: Math.floor(i / 6) * 2 + 1,
      rotation: 0,
      width: 1,
      height: 1,
    })),
  },
  {
    name: "Groups of 4",
    icon: <Copy className="h-4 w-4" />,
    desks: [
      // Group 1
      { id: "d1", x: 0, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d2", x: 1, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d3", x: 0, y: 2, rotation: 0, width: 1, height: 1 },
      { id: "d4", x: 1, y: 2, rotation: 0, width: 1, height: 1 },
      // Group 2
      { id: "d5", x: 3, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d6", x: 4, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d7", x: 3, y: 2, rotation: 0, width: 1, height: 1 },
      { id: "d8", x: 4, y: 2, rotation: 0, width: 1, height: 1 },
      // Group 3
      { id: "d9", x: 6, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d10", x: 7, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "d11", x: 6, y: 2, rotation: 0, width: 1, height: 1 },
      { id: "d12", x: 7, y: 2, rotation: 0, width: 1, height: 1 },
      // Group 4
      { id: "d13", x: 0, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d14", x: 1, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d15", x: 0, y: 5, rotation: 0, width: 1, height: 1 },
      { id: "d16", x: 1, y: 5, rotation: 0, width: 1, height: 1 },
      // Group 5
      { id: "d17", x: 3, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d18", x: 4, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d19", x: 3, y: 5, rotation: 0, width: 1, height: 1 },
      { id: "d20", x: 4, y: 5, rotation: 0, width: 1, height: 1 },
      // Group 6
      { id: "d21", x: 6, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d22", x: 7, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "d23", x: 6, y: 5, rotation: 0, width: 1, height: 1 },
      { id: "d24", x: 7, y: 5, rotation: 0, width: 1, height: 1 },
    ],
  },
  {
    name: "U-Shape",
    icon: <AlignHorizontalJustifyCenter className="h-4 w-4" />,
    desks: [
      // Left side
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `left-${i}`,
        x: 0,
        y: i + 1,
        rotation: 0,
        width: 1,
        height: 1,
      })),
      // Right side
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `right-${i}`,
        x: 7,
        y: i + 1,
        rotation: 0,
        width: 1,
        height: 1,
      })),
      // Bottom
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `bottom-${i}`,
        x: i + 1,
        y: 5,
        rotation: 0,
        width: 1,
        height: 1,
      })),
    ],
  },
  {
    name: "Circle/Oval",
    icon: <CircleDot className="h-4 w-4" />,
    desks: [
      // Top row
      { id: "c1", x: 3, y: 0, rotation: 0, width: 1, height: 1 },
      { id: "c2", x: 4, y: 0, rotation: 0, width: 1, height: 1 },
      { id: "c3", x: 5, y: 0, rotation: 0, width: 1, height: 1 },
      // Right side
      { id: "c4", x: 6, y: 1, rotation: 0, width: 1, height: 1 },
      { id: "c5", x: 7, y: 2, rotation: 0, width: 1, height: 1 },
      { id: "c6", x: 7, y: 3, rotation: 0, width: 1, height: 1 },
      { id: "c7", x: 6, y: 4, rotation: 0, width: 1, height: 1 },
      // Bottom row
      { id: "c8", x: 5, y: 5, rotation: 0, width: 1, height: 1 },
      { id: "c9", x: 4, y: 5, rotation: 0, width: 1, height: 1 },
      { id: "c10", x: 3, y: 5, rotation: 0, width: 1, height: 1 },
      // Left side
      { id: "c11", x: 2, y: 4, rotation: 0, width: 1, height: 1 },
      { id: "c12", x: 1, y: 3, rotation: 0, width: 1, height: 1 },
      { id: "c13", x: 1, y: 2, rotation: 0, width: 1, height: 1 },
      { id: "c14", x: 2, y: 1, rotation: 0, width: 1, height: 1 },
    ],
  },
];

export function ClassroomEditor({ config, onConfigChange }: ClassroomEditorProps) {
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addDesk = useCallback(() => {
    const newDesk: Desk = {
      id: `desk-${Date.now()}`,
      x: Math.floor(config.gridCols / 2),
      y: Math.floor(config.gridRows / 2),
      rotation: 0,
      width: 1,
      height: 1,
    };
    onConfigChange({
      ...config,
      desks: [...config.desks, newDesk],
    });
    setSelectedDesk(newDesk.id);
  }, [config, onConfigChange]);

  const deleteDesk = useCallback((deskId: string) => {
    onConfigChange({
      ...config,
      desks: config.desks.filter((d) => d.id !== deskId),
    });
    if (selectedDesk === deskId) {
      setSelectedDesk(null);
    }
  }, [config, onConfigChange, selectedDesk]);

  const rotateDesk = useCallback((deskId: string) => {
    onConfigChange({
      ...config,
      desks: config.desks.map((d) =>
        d.id === deskId ? { ...d, rotation: (d.rotation + 90) % 360 } : d
      ),
    });
  }, [config, onConfigChange]);

  const applyPreset = useCallback((desks: Desk[]) => {
    onConfigChange({
      ...config,
      desks: desks.map((d, i) => ({ ...d, id: `desk-${Date.now()}-${i}` })),
    });
    setSelectedDesk(null);
  }, [config, onConfigChange]);

  const clearAll = useCallback(() => {
    onConfigChange({ ...config, desks: [] });
    setSelectedDesk(null);
  }, [config, onConfigChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent, deskId: string) => {
    e.preventDefault();
    const desk = config.desks.find((d) => d.id === deskId);
    if (!desk) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const cellX = (e.clientX - rect.left) / CELL_SIZE;
    const cellY = (e.clientY - rect.top) / CELL_SIZE;

    setDragOffset({
      x: cellX - desk.x,
      y: cellY - desk.y,
    });
    setSelectedDesk(deskId);
    setIsDragging(true);
  }, [config.desks]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedDesk) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const cellX = Math.round((e.clientX - rect.left) / CELL_SIZE - dragOffset.x);
    const cellY = Math.round((e.clientY - rect.top) / CELL_SIZE - dragOffset.y);

    const clampedX = Math.max(0, Math.min(config.gridCols - 1, cellX));
    const clampedY = Math.max(0, Math.min(config.gridRows - 1, cellY));

    onConfigChange({
      ...config,
      desks: config.desks.map((d) =>
        d.id === selectedDesk ? { ...d, x: clampedX, y: clampedY } : d
      ),
    });
  }, [isDragging, selectedDesk, dragOffset, config, onConfigChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleGridClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const cellX = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const cellY = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    // Check if clicked on empty space
    const clickedDesk = config.desks.find(
      (d) => d.x === cellX && d.y === cellY
    );

    if (!clickedDesk) {
      setSelectedDesk(null);
    }
  }, [isDragging, config.desks]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
      {/* Editor Canvas */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Classroom Layout</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addDesk}>
              <Plus className="mr-1 h-3 w-3" />
              Add Desk
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive bg-transparent">
              <Trash2 className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>

        {/* Teacher's desk indicator */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-lg bg-primary/20 px-8 py-2 text-sm font-medium text-primary">
            Front of Classroom
          </div>
        </div>

        {/* Grid Editor */}
        <div className="overflow-auto">
          <div
            className="relative mx-auto border border-border/50 rounded-lg bg-secondary/20"
            style={{
              width: config.gridCols * CELL_SIZE,
              height: config.gridRows * CELL_SIZE,
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleGridClick}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
              }}
            />

            {/* Desks */}
            {config.desks.map((desk) => (
              <div
                key={desk.id}
                className={cn(
                  "absolute cursor-move rounded-lg border-2 transition-colors flex items-center justify-center",
                  selectedDesk === desk.id
                    ? "border-primary bg-primary/30 shadow-lg shadow-primary/20 z-10"
                    : "border-border bg-secondary hover:border-primary/50"
                )}
                style={{
                  left: desk.x * CELL_SIZE + 4,
                  top: desk.y * CELL_SIZE + 4,
                  width: desk.width * CELL_SIZE - 8,
                  height: desk.height * CELL_SIZE - 8,
                  transform: `rotate(${desk.rotation}deg)`,
                }}
                onMouseDown={(e) => handleMouseDown(e, desk.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDesk(desk.id);
                }}
              >
                <Move className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-border bg-secondary" />
            <span>Desk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-primary bg-primary/30" />
            <span>Selected</span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Click and drag desks to reposition. Total desks: {config.desks.length}
        </p>
      </div>

      {/* Sidebar Controls */}
      <div className="space-y-4">
        {/* Selected Desk Controls */}
        {selectedDesk && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="mb-4 font-semibold text-foreground">Selected Desk</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotateDesk(selectedDesk)}
                className="flex-1"
              >
                <RotateCw className="mr-1 h-3 w-3" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteDesk(selectedDesk)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Grid Settings */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Grid Size</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Columns</Label>
                <span className="text-sm font-medium text-primary">{config.gridCols}</span>
              </div>
              <input
                type="range"
                min={6}
                max={16}
                value={config.gridCols}
                onChange={(e) =>
                  onConfigChange({ ...config, gridCols: Number(e.target.value) })
                }
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Rows</Label>
                <span className="text-sm font-medium text-primary">{config.gridRows}</span>
              </div>
              <input
                type="range"
                min={4}
                max={12}
                value={config.gridRows}
                onChange={(e) =>
                  onConfigChange({ ...config, gridRows: Number(e.target.value) })
                }
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Preset Layouts */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="mb-4 font-semibold text-foreground">Quick Layouts</h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_LAYOUTS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.desks)}
                className="justify-start gap-2"
              >
                {preset.icon}
                <span className="truncate text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-secondary/50 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tips:</span>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>- Drag desks to reposition them</li>
            <li>- Click a desk to select it</li>
            <li>- Use presets for quick layouts</li>
            <li>- Adjust grid size as needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
