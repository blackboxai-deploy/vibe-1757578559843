'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject, TimeSlot, TimeConflict, DayOfWeek } from '@/lib/types';
import { 
  loadScheduleData, 
  saveSubject as saveSubjectToStorage, 
  saveTimeSlot as saveTimeSlotToStorage,
  deleteSubject as deleteSubjectFromStorage,
  deleteTimeSlot as deleteTimeSlotFromStorage,
  isLocalStorageAvailable
} from '@/lib/storage';

export function useSchedule() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastModified, setLastModified] = useState<Date>(new Date());

  // Load initial data
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const data = loadScheduleData();
      setSubjects(data.subjects);
      setTimeSlots(data.timeSlots);
      setLastModified(data.lastModified);
    }
    setIsLoading(false);
  }, []);

  // Subject management
  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSubjects(prev => [...prev, newSubject]);
    saveSubjectToStorage(newSubject);
    setLastModified(new Date());
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    const updatedSubject = subjects.find(s => s.id === id);
    if (!updatedSubject) return;

    const updated = { ...updatedSubject, ...updates, updatedAt: new Date() };
    setSubjects(prev => prev.map(s => s.id === id ? updated : s));
    saveSubjectToStorage(updated);
    setLastModified(new Date());
  }, [subjects]);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTimeSlots(prev => prev.filter(ts => ts.subjectId !== id));
    deleteSubjectFromStorage(id);
    setLastModified(new Date());
  }, []);

  // Time slot management
  const addTimeSlot = useCallback((timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check for conflicts before adding
    const conflicts = checkTimeConflicts(timeSlotData);
    if (conflicts.length > 0) {
      throw new Error(`Schedule conflict: ${conflicts[0].message}`);
    }

    const newTimeSlot: TimeSlot = {
      ...timeSlotData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTimeSlots(prev => [...prev, newTimeSlot]);
    saveTimeSlotToStorage(newTimeSlot);
    setLastModified(new Date());
  }, [timeSlots]);

  const updateTimeSlot = useCallback((id: string, updates: Partial<TimeSlot>) => {
    const existingTimeSlot = timeSlots.find(ts => ts.id === id);
    if (!existingTimeSlot) return;

    const updatedData = { ...existingTimeSlot, ...updates };
    
    // Check for conflicts (excluding the current slot)
    const conflicts = checkTimeConflicts(updatedData, id);
    if (conflicts.length > 0) {
      throw new Error(`Schedule conflict: ${conflicts[0].message}`);
    }

    const updated = { ...updatedData, updatedAt: new Date() };
    setTimeSlots(prev => prev.map(ts => ts.id === id ? updated : ts));
    saveTimeSlotToStorage(updated);
    setLastModified(new Date());
  }, [timeSlots]);

  const deleteTimeSlot = useCallback((id: string) => {
    setTimeSlots(prev => prev.filter(ts => ts.id !== id));
    deleteTimeSlotFromStorage(id);
    setLastModified(new Date());
  }, []);

  // Utility functions
  const getSubject = useCallback((id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  }, [subjects]);

  const getTimeSlotsByDay = useCallback((day: DayOfWeek): TimeSlot[] => {
    return timeSlots
      .filter(ts => ts.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeSlots]);

  const getTimeSlotsBySubject = useCallback((subjectId: string): TimeSlot[] => {
    return timeSlots.filter(ts => ts.subjectId === subjectId);
  }, [timeSlots]);

  // Conflict detection
  const checkTimeConflicts = useCallback((
    newSlot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>, 
    excludeId?: string
  ): TimeConflict[] => {
    const conflicts: TimeConflict[] = [];
    const relevantSlots = timeSlots
      .filter(ts => ts.day === newSlot.day && ts.id !== excludeId);

    for (const existingSlot of relevantSlots) {
      // Check for time overlap
      if (timeRangesOverlap(
        newSlot.startTime, 
        newSlot.endTime, 
        existingSlot.startTime, 
        existingSlot.endTime
      )) {
        const subject = getSubject(existingSlot.subjectId);
        conflicts.push({
          type: 'overlap',
          conflictingSlot: existingSlot,
          message: `Time overlaps with existing ${subject?.name || 'class'} from ${existingSlot.startTime} to ${existingSlot.endTime}`
        });
      }
    }

    return conflicts;
  }, [timeSlots, getSubject]);

  // Statistics
  const getStats = useCallback(() => {
    const totalSubjects = subjects.length;
    const totalTimeSlots = timeSlots.length;
    const totalHours = timeSlots.reduce((sum, slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);
      return sum + (end - start) / 60;
    }, 0);

    const subjectDistribution = subjects.map(subject => ({
      subject,
      hoursPerWeek: timeSlots
        .filter(ts => ts.subjectId === subject.id)
        .reduce((sum, slot) => {
          const start = timeToMinutes(slot.startTime);
          const end = timeToMinutes(slot.endTime);
          return sum + (end - start) / 60;
        }, 0)
    }));

    return {
      totalSubjects,
      totalTimeSlots,
      totalHours,
      subjectDistribution,
    };
  }, [subjects, timeSlots]);

  return {
    // Data
    subjects,
    timeSlots,
    isLoading,
    lastModified,
    
    // Subject operations
    addSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    
    // Time slot operations
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getTimeSlotsByDay,
    getTimeSlotsBySubject,
    
    // Utilities
    checkTimeConflicts,
    getStats,
  };
}

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}