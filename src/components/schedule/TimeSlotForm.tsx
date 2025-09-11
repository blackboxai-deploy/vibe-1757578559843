'use client';

import { useState } from 'react';
import { Subject, TimeSlot, TimeSlotFormData, DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/types';
import { getColorClasses, generateColorStyle } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TimeSlotFormProps {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  onAddTimeSlot: (timeSlot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTimeSlot: (id: string, updates: Partial<TimeSlot>) => void;
  onDeleteTimeSlot: (id: string) => void;
  getSubject: (id: string) => Subject | undefined;
}

export function TimeSlotForm({
  subjects,
  timeSlots,
  onAddTimeSlot,
  onUpdateTimeSlot,
  onDeleteTimeSlot,
  getSubject,
}: TimeSlotFormProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<TimeSlotFormData>({
    subjectId: '',
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    notes: '',
  });
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setFormData({
      subjectId: '',
      day: 'monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      notes: '',
    });
    setEditingTimeSlot(null);
    setError('');
  };

  const validateTimeSlot = (data: TimeSlotFormData): string | null => {
    if (!data.subjectId) return 'Please select a subject';
    if (!data.startTime || !data.endTime) return 'Please select start and end times';
    
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    
    if (startMinutes >= endMinutes) {
      return 'End time must be after start time';
    }
    
    if (endMinutes - startMinutes < 30) {
      return 'Class duration must be at least 30 minutes';
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateTimeSlot(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingTimeSlot) {
        onUpdateTimeSlot(editingTimeSlot.id, formData);
        setEditingTimeSlot(null);
      } else {
        onAddTimeSlot(formData);
        setIsAddDialogOpen(false);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (timeSlot: TimeSlot) => {
    setFormData({
      subjectId: timeSlot.subjectId,
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      room: timeSlot.room || '',
      notes: timeSlot.notes || '',
    });
    setEditingTimeSlot(timeSlot);
    setError('');
  };

  const handleDelete = (timeSlot: TimeSlot) => {
    onDeleteTimeSlot(timeSlot.id);
  };

  const TimeSlotFormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Select
          value={formData.subjectId}
          onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => {
              const colorClasses = getColorClasses(subject.color);
              return (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${colorClasses.bg} ${colorClasses.border} border`}
                      style={subject.color.startsWith('#') ? { backgroundColor: subject.color } : undefined}
                    />
                    <span>{subject.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="day">Day *</Label>
          <Select
            value={formData.day}
            onValueChange={(value: any) => setFormData({ ...formData, day: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Input
            id="room"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="e.g., Room 101, Lab A"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Select
            value={formData.startTime}
            onValueChange={(value) => {
              const newFormData = { ...formData, startTime: value };
              // Auto-adjust end time if it's not after start time
              if (timeToMinutes(value) >= timeToMinutes(formData.endTime)) {
                const nextSlotIndex = TIME_SLOTS.indexOf(value) + 2; // Add 1 hour
                if (nextSlotIndex < TIME_SLOTS.length) {
                  newFormData.endTime = TIME_SLOTS[nextSlotIndex];
                }
              }
              setFormData(newFormData);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {formatTime(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Select
            value={formData.endTime}
            onValueChange={(value) => setFormData({ ...formData, endTime: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.filter(time => timeToMinutes(time) > timeToMinutes(formData.startTime)).map((time) => (
                <SelectItem key={time} value={time}>
                  {formatTime(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or instructions..."
          rows={3}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingTimeSlot ? 'Update Class' : 'Add Class'}
        </Button>
      </DialogFooter>
    </form>
  );

  // Group time slots by day for display
  const timeSlotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.value] = timeSlots
      .filter(ts => ts.day === day.value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-gray-600">Add and manage your class time slots</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={subjects.length === 0}>
              {subjects.length === 0 ? 'Add subjects first' : 'Add Class'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Schedule a new class session for one of your subjects.
              </DialogDescription>
            </DialogHeader>
            <TimeSlotFormContent />
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-8">
          <CardHeader>
            <CardTitle className="text-gray-500">No subjects available</CardTitle>
            <CardDescription>
              Add some subjects first to start scheduling your classes
            </CardDescription>
          </CardHeader>
        </Card>
      ) : timeSlots.length === 0 ? (
        <Card className="text-center py-8">
          <CardHeader>
            <CardTitle className="text-gray-500">No classes scheduled</CardTitle>
            <CardDescription>
              Add your first class to start building your timetable
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = timeSlotsByDay[day.value];
            if (daySlots.length === 0) return null;

            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{day.label}</span>
                    <Badge variant="secondary">{daySlots.length} classes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySlots.map((timeSlot) => {
                      const subject = getSubject(timeSlot.subjectId);
                      if (!subject) return null;

                      const colorClasses = getColorClasses(subject.color);
                      const customStyle = subject.color.startsWith('#') 
                        ? generateColorStyle(subject.color) 
                        : undefined;

                      return (
                        <div
                          key={timeSlot.id}
                          className={`
                            p-4 rounded-lg border transition-all duration-200 
                            ${customStyle ? 'border-gray-300' : colorClasses.border + ' ' + colorClasses.bg}
                          `}
                          style={customStyle}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className={`font-semibold ${customStyle ? '' : colorClasses.text}`}>
                                  {subject.name}
                                </h4>
                                <span className={`text-sm ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                                  {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                                </span>
                              </div>
                              {timeSlot.room && (
                                <p className={`text-sm mt-1 ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                                  📍 {timeSlot.room}
                                </p>
                              )}
                              {timeSlot.notes && (
                                <p className={`text-sm mt-1 ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                                  💬 {timeSlot.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(timeSlot)}
                                  >
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Class</DialogTitle>
                                    <DialogDescription>
                                      Update the class details and schedule.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <TimeSlotFormContent />
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(timeSlot)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}