"use client";

import { getHeatmapColor } from "@/utils/heatmap";

interface StudyHeatmapStripProps {
  intensities: number[]; // Array of 7 values (0-4)
}

export default function StudyHeatmapStrip({ intensities }: StudyHeatmapStripProps) {
  const days = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

  return (
    <div className="flex gap-2">
      {intensities.map((intensity, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-md"
            style={{ backgroundColor: getHeatmapColor(intensity) }}
            title={`${days[index]}: ${intensity} aktiviteter`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {days[index]}
          </span>
        </div>
      ))}
    </div>
  );
}
