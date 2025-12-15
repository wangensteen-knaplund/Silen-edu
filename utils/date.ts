/**
 * Calculate days until a given date
 */
export function daysUntil(dateString: string): number {
  const targetDate = new Date(dateString);
  const today = new Date();
  
  // Return 0 if date is invalid
  if (isNaN(targetDate.getTime())) {
    return 0;
  }
  
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format date to readable Norwegian format
 */
export function formatDateNO(dateString: string): string {
  const date = new Date(dateString);
  
  // Return empty string if date is invalid
  if (isNaN(date.getTime())) {
    return "";
  }
  
  return date.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/**
 * Get ISO date string for today
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get date range for current week (Monday to Sunday)
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0]
  };
}

/**
 * Format "last worked" text based on date
 * Returns Norwegian text: "i dag", "i går", "for X dager siden"
 */
export function formatLastWorked(dateString: string | undefined): string {
  if (!dateString) {
    return "Ikke jobbet med ennå";
  }
  
  // dateString is guaranteed to be a string here
  const days = daysUntil(dateString as string);
  
  if (days === 0) {
    return "Sist jobbet: i dag";
  } else if (days === -1) {
    return "Sist jobbet: i går";
  } else if (days < -1) {
    return `Sist jobbet: for ${Math.abs(days)} dager siden`;
  } else {
    // Future date - shouldn't happen, but handle gracefully
    return "Ikke jobbet med ennå";
  }
}
