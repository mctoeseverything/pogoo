"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DecorativeShapes } from "@/components/decorative-shapes";
import { FileQuestion, LayoutGrid, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <DecorativeShapes />
      
      {/* Header */}
      <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-bold text-foreground">Pogo</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/quiz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Quiz Generator
          </Link>
          <Link href="/seating" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Seating Chart
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Teacher Tools
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            The complete toolkit for{" "}
            <span className="text-primary">modern teachers</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl"
          >
            Generate quizzes from your materials in seconds and create intelligent 
            seating charts that flex to your classroom rules.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/quiz">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">
              <Link href="/seating">
                Explore Features
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-32 grid gap-6 md:grid-cols-2"
        >
          {/* Quiz Generator Card */}
          <Link href="/quiz" className="group">
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/15" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileQuestion className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-foreground">Quiz Generator</h3>
                <p className="mb-6 text-muted-foreground">
                  Upload your teaching materials and let AI create comprehensive quizzes. 
                  Preview, edit, and export beautiful PDFs ready for class.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    Upload up to 5 files
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    AI-powered
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    PDF export
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Seating Chart Card */}
          <Link href="/seating" className="group">
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/15" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-foreground">Seating Chart</h3>
                <p className="mb-6 text-muted-foreground">
                  Configure your classroom layout, add students, and define rules. 
                  Our algorithm generates optimal seating arrangements automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    Custom layouts
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    Student rules
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    Smart placement
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-24 grid grid-cols-2 gap-8 border-t border-border pt-12 md:grid-cols-4"
        >
          {[
            { value: "5+", label: "File formats supported" },
            { value: "100%", label: "Customizable" },
            { value: "PDF", label: "Export ready" },
            { value: "Free", label: "To use" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background/50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Pogo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for teachers, by developers who care about education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
