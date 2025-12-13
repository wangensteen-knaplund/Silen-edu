/**
 * Get color based on intensity (0-4)
 * 0 = very light, 4 = most saturated
 */
export function getHeatmapColor(intensity: number): string {
  const colors = [
    "#e5e7eb", // 0 - very light gray
    "#93c5fd", // 1 - light blue
    "#60a5fa", // 2 - medium blue
    "#3b82f6", // 3 - blue
    "#1d4ed8", // 4 - dark blue
  ];
  
  const clampedIntensity = Math.max(0, Math.min(4, intensity));
  return colors[clampedIntensity];
}
