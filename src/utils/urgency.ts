// utils/urgency.ts
import { isPast, differenceInHours } from 'date-fns';

export const getUrgencyLevel = (deadline: string | Date): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  if (isPast(deadlineDate)) {
    return 3; // Very urgent (overdue)
  }
  
  const hoursRemaining = differenceInHours(deadlineDate, now);
  
  if (hoursRemaining < 24) {
    return 2; // Urgent (due within 24 hours)
  } else if (hoursRemaining < 72) {
    return 1; // Approaching (due within 3 days)
  }
  
  return 0; // Not urgent
};