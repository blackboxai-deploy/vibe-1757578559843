'use client';

import { useState } from 'react';
import { Subject, SubjectFormData } from '@/lib/types';
import { COLOR_PRESETS, getColorClasses, generateColorStyle } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
  getTimeSlotsBySubject: (subjectId: string) => any[];
}

export function SubjectManager({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  getTimeSlotsBySubject,
}: SubjectManagerProps) {
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    color: 'blue',
    instructor: '',
    room: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: 'blue',
      instructor: '',
      room: '',
    });
    setEditingSubject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

     if (editingSubject) {
      onUpdateSubject(editingSubject.id, formData);
      setEditingSubject(null);
      setIsEditDialogOpen(false);
    } else {
      onAddSubject(formData);
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };

   const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      color: subject.color,
      instructor: subject.instructor || '',
      room: subject.room || '',
    });
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    onDeleteSubject(subject.id);
  };

  const SubjectForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Subject Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Mathematics, Physics, History"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructor">Instructor</Label>
        <Input
          id="instructor"
          value={formData.instructor}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          placeholder="e.g., Dr. Smith, Prof. Johnson"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="room">Room</Label>
        <Input
          id="room"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          placeholder="e.g., Room 101, Lab A, Online"
        />
      </div>

      <div className="space-y-3">
        <Label>Color</Label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setFormData({ ...formData, color: colorOption.value })}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                ${colorOption.bg} ${colorOption.text} ${colorOption.border}
                ${formData.color === colorOption.value 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:scale-105'
                }
              `}
            >
              {colorOption.label}
            </button>
          ))}
        </div>
        
        <div className="mt-3">
          <Label htmlFor="customColor">Custom Color</Label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="color"
              id="customColor"
              value={formData.color.startsWith('#') ? formData.color : '#3b82f6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={formData.color.startsWith('#') ? formData.color : ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
         <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name.trim()}>
          {editingSubject ? 'Update Subject' : 'Add Subject'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
          <p className="text-gray-600">Manage your course subjects and their details</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Subject</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject with its details and color coding.
              </DialogDescription>
            </DialogHeader>
            <SubjectForm />
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-8">
          <CardHeader>
            <CardTitle className="text-gray-500">No subjects yet</CardTitle>
            <CardDescription>
              Add your first subject to start building your schedule
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const colorClasses = getColorClasses(subject.color);
            const timeSlots = getTimeSlotsBySubject(subject.id);
            const customStyle = subject.color.startsWith('#') 
              ? generateColorStyle(subject.color) 
              : undefined;

            return (
              <Card 
                key={subject.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  customStyle ? '' : colorClasses.bg
                }`}
                style={customStyle}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${customStyle ? '' : colorClasses.text}`}>
                        {subject.name}
                      </CardTitle>
                      {subject.instructor && (
                        <p className={`text-sm mt-1 ${customStyle ? 'opacity-80' : colorClasses.text + ' opacity-75'}`}>
                          {subject.instructor}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {timeSlots.length} classes
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {subject.room && (
                    <p className={`text-sm mb-3 ${customStyle ? 'opacity-80' : colorClasses.text + ' opacity-75'}`}>
                      📍 {subject.room}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Subject</DialogTitle>
                            <DialogDescription>
                              Update the subject details and color.
                            </DialogDescription>
                          </DialogHeader>
                          <SubjectForm />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{subject.name}"? 
                              This will also remove all associated time slots. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(subject)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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