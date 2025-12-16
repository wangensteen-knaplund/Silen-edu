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

/**
 * Map activity data to 7-day rolling heatmap intensities
 * Returns array of 7 intensities for the last 7 days (today - 6 days to today)
 * 0 = no activity, 1+ = active day
 */
export function mapActivityToHeatmap(
  activityData: { activity_date: string; activity_count: number }[]
): number[] {
  // Create array for last 7 days
  const intensities: number[] = [];
  const today = new Date();
  
  // Generate last 7 days (today - 6 to today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Format date in YYYY-MM-DD using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Find activity for this date
    const activity = activityData.find(a => a.activity_date === dateStr);
    
    // Simple intensity logic: 0 = no activity, 1+ = active day
    const intensity = (activity?.activity_count ?? 0) > 0 ? 1 : 0;
    intensities.push(intensity);
  }
  
  return intensities;
}
