'use client';

import { useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { SubjectManager } from '@/components/schedule/SubjectManager';
import { TimeSlotForm } from '@/components/schedule/TimeSlotForm';
import { WeeklyTimetable } from '@/components/schedule/WeeklyTimetable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  exportScheduleData, 
  importScheduleData, 
  clearScheduleData,
  isLocalStorageAvailable 
} from '@/lib/storage';

export default function Home() {
  const {
    subjects,
    timeSlots,
    isLoading,
    lastModified,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getTimeSlotsBySubject,
    getStats,
  } = useSchedule();

  const [activeTab, setActiveTab] = useState('subjects');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  const stats = getStats();

  const handleExport = () => {
    const data = exportScheduleData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const success = importScheduleData(importData);
      if (success) {
        setShowImportDialog(false);
        setImportData('');
        // Refresh the page to reload data
        window.location.reload();
      } else {
        setImportError('Invalid schedule data format');
      }
    } catch (error) {
      setImportError('Failed to import data. Please check the format.');
    }
  };

   const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all schedule data? This action cannot be undone.')) {
      clearScheduleData();
      window.location.reload();
    }
  };

 

  const handlePrint = () => {
    const printContent = document.getElementById('timetable-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Class Schedule</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; }
            .timetable-grid { width: 100%; border-collapse: collapse; }
            .timetable-grid td, .timetable-grid th { 
              border: 1px solid #ccc; 
              padding: 8px; 
              text-align: center; 
            }
            .timetable-grid th { background-color: #f5f5f5; }
            .class-block { 
              background-color: #e3f2fd; 
              padding: 4px; 
              border-radius: 4px; 
              font-size: 12px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Class Schedule</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Schedule Planner
              </h1>
              <p className="text-gray-600">
                Create, organize, and manage your weekly class schedule with ease
              </p>
              {lastModified && isLocalStorageAvailable() && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {lastModified.toLocaleDateString()} at {lastModified.toLocaleTimeString()}
                </p>
              )}
            </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport} disabled={subjects.length === 0}>
                Export Data
              </Button>
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">Import Data</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Schedule Data</DialogTitle>
                    <DialogDescription>
                      Paste your exported schedule JSON data below to import it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <textarea
                      className="w-full h-48 p-3 border rounded-md resize-none font-mono text-sm"
                      placeholder="Paste your exported JSON data here..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                    />
                    {importError && (
                      <p className="text-sm text-red-600">{importError}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleImport} disabled={!importData.trim()}>
                        Import
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handlePrint} disabled={timeSlots.length === 0}>
                Print Schedule
              </Button>
              <Button variant="destructive" onClick={handleClearData} disabled={subjects.length === 0}>
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {(subjects.length > 0 || timeSlots.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Subjects</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalSubjects}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📚</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Classes</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalTimeSlots}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🗓️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Weekly Hours</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalHours}h</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">⏱️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Completion</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {subjects.length > 0 ? Math.round((stats.totalTimeSlots / (subjects.length * 3)) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects" className="relative">
            Subjects
            {subjects.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {subjects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="relative">
            Schedule
            {timeSlots.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {timeSlots.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="timetable">
            Timetable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <SubjectManager
            subjects={subjects}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            getTimeSlotsBySubject={getTimeSlotsBySubject}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <TimeSlotForm
            subjects={subjects}
            timeSlots={timeSlots}
            onAddTimeSlot={addTimeSlot}
            onUpdateTimeSlot={updateTimeSlot}
            onDeleteTimeSlot={deleteTimeSlot}
            getSubject={getSubject}
          />
        </TabsContent>

        <TabsContent value="timetable" className="space-y-6" id="timetable-content">
          <WeeklyTimetable
            subjects={subjects}
            timeSlots={timeSlots}
            getSubject={getSubject}
            onEditTimeSlot={(timeSlot) => {
              // Switch to schedule tab when editing
              setActiveTab('schedule');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Getting Started Guide */}
      {subjects.length === 0 && (
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              🚀 Getting Started
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-amber-900">Add Your Subjects</p>
                  <p className="text-amber-700">Start by adding the subjects you're taking with custom colors.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-amber-900">Schedule Classes</p>
                  <p className="text-amber-700">Add time slots for each subject across your weekly schedule.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-amber-900">View Your Timetable</p>
                  <p className="text-amber-700">See your beautiful color-coded weekly timetable and stay organized!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}