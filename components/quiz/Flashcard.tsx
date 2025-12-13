"use client";

import { useState } from "react";

interface FlashcardProps {
  frontText: string;
  backText: string;
}

export default function Flashcard({ frontText, backText }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-transform hover:scale-105"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isFlipped ? "Baksiden" : "Forsiden"}
          </div>
          <div className="text-xl text-center text-gray-900 dark:text-white">
            {isFlipped ? backText : frontText}
          </div>
        </div>
        <div className="absolute bottom-4 right-4 text-sm text-gray-400">
          Klikk for å snu
        </div>
      </div>
    </div>
  );
}
