// localStorage utilities for persisting schedule data

import { Subject, TimeSlot, ScheduleData } from './types';

const STORAGE_KEY = 'class-schedule-planner';

// Default empty schedule data
const defaultScheduleData: ScheduleData = {
  subjects: [],
  timeSlots: [],
  lastModified: new Date(),
};

// Save schedule data to localStorage
export function saveScheduleData(data: ScheduleData): void {
  try {
    const serializedData = JSON.stringify({
      ...data,
      lastModified: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Failed to save schedule data:', error);
  }
}

// Load schedule data from localStorage
export function loadScheduleData(): ScheduleData {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return defaultScheduleData;
    }
    
    const parsedData = JSON.parse(storedData);
    
    // Convert date strings back to Date objects
    const subjects = parsedData.subjects?.map((subject: any) => ({
      ...subject,
      createdAt: new Date(subject.createdAt),
      updatedAt: new Date(subject.updatedAt),
    })) || [];
    
    const timeSlots = parsedData.timeSlots?.map((slot: any) => ({
      ...slot,
      createdAt: new Date(slot.createdAt),
      updatedAt: new Date(slot.updatedAt),
    })) || [];
    
    return {
      subjects,
      timeSlots,
      lastModified: new Date(parsedData.lastModified),
    };
  } catch (error) {
    console.error('Failed to load schedule data:', error);
    return defaultScheduleData;
  }
}

// Clear all schedule data
export function clearScheduleData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear schedule data:', error);
  }
}

// Export schedule data as JSON
export function exportScheduleData(): string {
  const data = loadScheduleData();
  return JSON.stringify(data, null, 2);
}

// Import schedule data from JSON
export function importScheduleData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as ScheduleData;
    
    // Validate the data structure
    if (!data.subjects || !data.timeSlots) {
      throw new Error('Invalid schedule data format');
    }
    
    saveScheduleData(data);
    return true;
  } catch (error) {
    console.error('Failed to import schedule data:', error);
    return false;
  }
}

// Utility functions for individual operations
export function saveSubject(subject: Subject): void {
  const data = loadScheduleData();
  const existingIndex = data.subjects.findIndex(s => s.id === subject.id);
  
  if (existingIndex >= 0) {
    data.subjects[existingIndex] = { ...subject, updatedAt: new Date() };
  } else {
    data.subjects.push({ ...subject, createdAt: new Date(), updatedAt: new Date() });
  }
  
  saveScheduleData(data);
}

export function deleteSubject(subjectId: string): void {
  const data = loadScheduleData();
  
  // Remove subject and all associated time slots
  data.subjects = data.subjects.filter(s => s.id !== subjectId);
  data.timeSlots = data.timeSlots.filter(ts => ts.subjectId !== subjectId);
  
  saveScheduleData(data);
}

export function saveTimeSlot(timeSlot: TimeSlot): void {
  const data = loadScheduleData();
  const existingIndex = data.timeSlots.findIndex(ts => ts.id === timeSlot.id);
  
  if (existingIndex >= 0) {
    data.timeSlots[existingIndex] = { ...timeSlot, updatedAt: new Date() };
  } else {
    data.timeSlots.push({ ...timeSlot, createdAt: new Date(), updatedAt: new Date() });
  }
  
  saveScheduleData(data);
}

export function deleteTimeSlot(timeSlotId: string): void {
  const data = loadScheduleData();
  data.timeSlots = data.timeSlots.filter(ts => ts.id !== timeSlotId);
  saveScheduleData(data);
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}