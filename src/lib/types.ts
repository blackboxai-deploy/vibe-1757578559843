// Core interfaces for the class schedule planner

export interface Subject {
  id: string;
  name: string;
  color: string;
  instructor?: string;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string;   // Format: "HH:MM" (24-hour)
  room?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduleData {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  lastModified: Date;
}

// UI and component types
export interface TimeSlotFormData {
  subjectId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  notes?: string;
}

export interface SubjectFormData {
  name: string;
  color: string;
  instructor?: string;
  room?: string;
}

export interface TimetableCell {
  timeSlot: string;
  day: DayOfWeek;
  isEmpty: boolean;
  scheduledClass?: TimeSlot & { subject: Subject };
}

export interface TimeConflict {
  type: 'overlap' | 'duplicate';
  conflictingSlot: TimeSlot;
  message: string;
}

// Utility types
export type ViewMode = 'week' | 'day';
export type ColorPreset = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'pink' | 'teal' | 'indigo';

// Constants
export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];