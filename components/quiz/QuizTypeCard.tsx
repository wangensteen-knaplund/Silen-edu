"use client";

interface QuizTypeCardProps {
  title: string;
  description: string;
  isFree: boolean;
  isPro: boolean;
  isAI: boolean;
  onClick: () => void;
}

export default function QuizTypeCard({
  title,
  description,
  isFree,
  isPro,
  isAI,
  onClick,
}: QuizTypeCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex gap-2">
          {isFree && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
              Gratis
            </span>
          )}
          {isPro && (
            <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
              Pro
            </span>
          )}
          {isAI && (
            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded">
              AI
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      {(isPro || isAI) && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">
          (Ikke implementert ennå)
        </p>
      )}
    </div>
  );
}
