"use client";

import { motion } from "framer-motion";

export function DecorativeShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Large circle top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      />
      
      {/* Small circle bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/8 blur-2xl"
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />
      
      {/* Floating shapes */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 h-4 w-4 rotate-45 border border-primary/20"
      />
      
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/3 right-1/4 h-6 w-6 rounded-full border border-primary/15"
      />
      
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/3 h-3 w-3 bg-primary/10"
      />
      
      {/* Gradient line */}
      <div className="absolute top-0 left-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}
