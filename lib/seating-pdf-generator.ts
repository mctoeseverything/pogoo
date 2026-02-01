import type { SeatAssignment, Student, ClassroomConfig } from "@/app/seating/page";
import jsPDF from "jspdf";

export function generateSeatingPDF(
  assignments: SeatAssignment[],
  students: Student[],
  config: ClassroomConfig
) {
  const doc = new jsPDF("landscape");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Colors
  const primaryColor = [30, 232, 118] as const;
  const textColor = [30, 30, 30] as const;
  const mutedColor = [100, 100, 100] as const;
  const lightGray = [240, 240, 240] as const;

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Pogo", margin, 16);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Seating Chart", pageWidth - margin, 16, { align: "right" });

  // Date
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35);

  // Calculate grid bounds from assignments
  const minX = Math.min(...assignments.map((a) => a.x), 0);
  const maxX = Math.max(...assignments.map((a) => a.x), config.gridCols - 1);
  const minY = Math.min(...assignments.map((a) => a.y), 0);
  const maxY = Math.max(...assignments.map((a) => a.y), config.gridRows - 1);
  
  const gridCols = maxX - minX + 1;
  const gridRows = maxY - minY + 1;

  // Calculate grid dimensions
  const gridStartY = 50;
  const gridStartX = margin + 20;
  const availableWidth = pageWidth - gridStartX - margin - 60; // Leave space for legend
  const availableHeight = pageHeight - gridStartY - 30;

  const cellWidth = Math.min(availableWidth / gridCols, 35);
  const cellHeight = Math.min(availableHeight / gridRows, 30);
  const gridWidth = cellWidth * gridCols;

  // Teacher's desk / Front of classroom
  const deskWidth = Math.min(gridWidth * 0.6, 100);
  const deskX = gridStartX + (gridWidth - deskWidth) / 2;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(deskX, gridStartY - 15, deskWidth, 12, 3, 3, "F");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FRONT OF CLASSROOM", deskX + deskWidth / 2, gridStartY - 7, { align: "center" });

  // Draw grid background pattern
  doc.setDrawColor(230, 230, 230);
  for (let row = 0; row <= gridRows; row++) {
    const y = gridStartY + row * cellHeight;
    doc.line(gridStartX, y, gridStartX + gridWidth, y);
  }
  for (let col = 0; col <= gridCols; col++) {
    const x = gridStartX + col * cellWidth;
    doc.line(x, gridStartY, x, gridStartY + gridRows * cellHeight);
  }

  // Helper to get student
  const getStudent = (studentId: string | null) => {
    if (!studentId) return null;
    return students.find((s) => s.id === studentId);
  };

  // Draw desks with students
  for (const assignment of assignments) {
    const x = gridStartX + (assignment.x - minX) * cellWidth;
    const y = gridStartY + (assignment.y - minY) * cellHeight;
    const student = getStudent(assignment.studentId);

    // Draw desk
    doc.setFillColor(...lightGray);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4, 3, 3, "FD");

    if (student) {
      // Parse color
      const color = student.color;
      const r = Number.parseInt(color.slice(1, 3), 16);
      const g = Number.parseInt(color.slice(3, 5), 16);
      const b = Number.parseInt(color.slice(5, 7), 16);

      // Draw colored circle
      const circleX = x + cellWidth / 2;
      const circleY = y + cellHeight / 2 - 3;
      doc.setFillColor(r, g, b);
      doc.circle(circleX, circleY, 6, "F");

      // Draw initial
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(student.name.charAt(0).toUpperCase(), circleX, circleY + 3, {
        align: "center",
      });

      // Draw name
      doc.setTextColor(...textColor);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      const name = student.name.split(" ")[0];
      const truncatedName = name.length > 8 ? `${name.slice(0, 7)}...` : name;
      doc.text(truncatedName, circleX, y + cellHeight - 5, { align: "center" });
    }
  }

  // Legend
  const legendX = gridStartX + gridWidth + 20;
  let legendY = gridStartY;

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Student Legend", legendX, legendY);
  legendY += 10;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  for (let i = 0; i < students.length && legendY < pageHeight - 20; i++) {
    const student = students[i];
    const color = student.color;
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);

    doc.setFillColor(r, g, b);
    doc.circle(legendX + 3, legendY - 1.5, 3, "F");

    doc.setTextColor(...textColor);
    const displayName =
      student.name.length > 15 ? `${student.name.slice(0, 14)}...` : student.name;
    doc.text(displayName, legendX + 10, legendY);

    legendY += 7;
  }

  if (students.length > 20) {
    doc.setTextColor(...mutedColor);
    doc.text(`+ ${students.length - 20} more students`, legendX, legendY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text("Generated by Pogo", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  // Summary stats
  doc.text(
    `${students.length} students | ${config.desks.length} desks`,
    margin,
    pageHeight - 10
  );

  // Save
  doc.save(`seating_chart_${new Date().toISOString().split("T")[0]}.pdf`);
}
