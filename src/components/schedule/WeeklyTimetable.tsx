'use client';

import { useState, useMemo } from 'react';
import { Subject, TimeSlot, DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/types';
import { getColorClasses, generateColorStyle } from '@/lib/colors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeeklyTimetableProps {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  getSubject: (id: string) => Subject | undefined;
  onEditTimeSlot?: (timeSlot: TimeSlot) => void;
}

interface TimetableCell {
  timeSlot: string;
  day: string;
  isEmpty: boolean;
  scheduledClass?: TimeSlot & { subject: Subject };
  rowSpan?: number;
}

export function WeeklyTimetable({
  subjects,
  timeSlots,
  getSubject,
  onEditTimeSlot,
}: WeeklyTimetableProps) {
  const [currentView, setCurrentView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState('monday');

  // Create a grid representation of the timetable
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<string, TimetableCell>> = {};
    
    // Initialize empty grid
    TIME_SLOTS.forEach(time => {
      grid[time] = {};
      DAYS_OF_WEEK.forEach(day => {
        grid[time][day.value] = {
          timeSlot: time,
          day: day.value,
          isEmpty: true,
        };
      });
    });

    // Fill in scheduled classes
    timeSlots.forEach(timeSlot => {
      const subject = getSubject(timeSlot.subjectId);
      if (!subject) return;

      const startIdx = TIME_SLOTS.indexOf(timeSlot.startTime);
      const endIdx = TIME_SLOTS.indexOf(timeSlot.endTime);
      
      if (startIdx === -1 || endIdx === -1) return;

      // Calculate row span (how many 30-minute slots this class spans)
      const rowSpan = endIdx - startIdx;

      // Mark the starting cell
      grid[timeSlot.startTime][timeSlot.day] = {
        timeSlot: timeSlot.startTime,
        day: timeSlot.day,
        isEmpty: false,
        scheduledClass: { ...timeSlot, subject },
        rowSpan,
      };

      // Mark intermediate cells as occupied (but don't render)
      for (let i = startIdx + 1; i < endIdx; i++) {
        const time = TIME_SLOTS[i];
        grid[time][timeSlot.day] = {
          timeSlot: time,
          day: timeSlot.day,
          isEmpty: false,
          // No scheduledClass - this prevents rendering
        };
      }
    });

    return grid;
  }, [timeSlots, getSubject]);

  // Get statistics
  const stats = useMemo(() => {
    const totalClasses = timeSlots.length;
    const totalHours = timeSlots.reduce((sum, slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);
      return sum + (end - start) / 60;
    }, 0);

    const classesByDay = DAYS_OF_WEEK.map(day => ({
      day: day.label,
      count: timeSlots.filter(ts => ts.day === day.value).length,
    }));

    const busiestDay = classesByDay.reduce((max, day) => 
      day.count > max.count ? day : max, 
      classesByDay[0]
    );

    return {
      totalClasses,
      totalHours: Math.round(totalHours * 10) / 10,
      busiestDay: busiestDay.count > 0 ? busiestDay : null,
      classesByDay,
    };
  }, [timeSlots]);

  const handleCellClick = (cell: TimetableCell) => {
    if (cell.scheduledClass && onEditTimeSlot) {
      onEditTimeSlot(cell.scheduledClass);
    }
  };

  const TimetableCell = ({ cell }: { cell: TimetableCell }) => {
    if (!cell.scheduledClass) return null;

    const { scheduledClass, rowSpan = 1 } = cell;
    const { subject } = scheduledClass;
    const colorClasses = getColorClasses(subject.color);
    const customStyle = subject.color.startsWith('#') 
      ? generateColorStyle(subject.color) 
      : undefined;

    return (
      <div
        className={`
          p-2 rounded-md border cursor-pointer transition-all duration-200 hover:shadow-md
          ${customStyle ? 'border-gray-300' : colorClasses.border + ' ' + colorClasses.bg}
        `}
        style={{
          ...customStyle,
          gridRowEnd: `span ${rowSpan}`,
          minHeight: `${rowSpan * 3}rem`,
        }}
        onClick={() => handleCellClick(cell)}
        title={`${subject.name} - ${formatTime(scheduledClass.startTime)} to ${formatTime(scheduledClass.endTime)}`}
      >
        <div className={`font-semibold text-sm ${customStyle ? '' : colorClasses.text}`}>
          {subject.name}
        </div>
        <div className={`text-xs mt-1 ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
          {formatTime(scheduledClass.startTime)} - {formatTime(scheduledClass.endTime)}
        </div>
        {scheduledClass.room && (
          <div className={`text-xs mt-1 ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
            📍 {scheduledClass.room}
          </div>
        )}
      </div>
    );
  };

  const WeekView = () => (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalHours}h</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{subjects.length}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.busiestDay ? stats.busiestDay.day : 'None'}
            </div>
            <div className="text-sm text-gray-600">Busiest Day</div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-8 border-collapse">
              {/* Header */}
              <div className="p-3 border-b border-r bg-gray-50 font-semibold text-center">
                Time
              </div>
              {DAYS_OF_WEEK.map(day => (
                <div key={day.value} className="p-3 border-b border-r bg-gray-50 font-semibold text-center">
                  {day.label}
                </div>
              ))}

              {/* Time slots */}
              {TIME_SLOTS.map(time => (
                <div key={time} className="contents">
                  {/* Time label */}
                  <div className="p-3 border-b border-r bg-gray-50 text-sm font-medium text-center">
                    {formatTime(time)}
                  </div>
                  
                  {/* Day cells */}
                  {DAYS_OF_WEEK.map(day => {
                    const cell = timetableGrid[time][day.value];
                    return (
                      <div 
                        key={`${time}-${day.value}`} 
                        className="p-1 border-b border-r min-h-[3rem] relative"
                      >
                        <TimetableCell cell={cell} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DayView = () => {
    const selectedDayData = DAYS_OF_WEEK.find(d => d.value === selectedDay);
    const dayTimeSlots = timeSlots
      .filter(ts => ts.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{selectedDayData?.label} Schedule</h3>
          <Badge variant="secondary">
            {dayTimeSlots.length} classes
          </Badge>
        </div>

        {dayTimeSlots.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-gray-500">No classes scheduled for {selectedDayData?.label}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayTimeSlots.map(timeSlot => {
              const subject = getSubject(timeSlot.subjectId);
              if (!subject) return null;

              const colorClasses = getColorClasses(subject.color);
              const customStyle = subject.color.startsWith('#') 
                ? generateColorStyle(subject.color) 
                : undefined;

              return (
                <Card 
                  key={timeSlot.id}
                  className={`
                    cursor-pointer transition-all duration-200 hover:shadow-md
                    ${customStyle ? '' : colorClasses.bg}
                  `}
                  style={customStyle}
                  onClick={() => handleCellClick({ 
                    timeSlot: timeSlot.startTime, 
                    day: selectedDay, 
                    isEmpty: false, 
                    scheduledClass: { ...timeSlot, subject } 
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${customStyle ? '' : colorClasses.text}`}>
                          {subject.name}
                        </h4>
                        <p className={`text-sm mt-1 ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                        </p>
                        {timeSlot.room && (
                          <p className={`text-sm ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                            📍 {timeSlot.room}
                          </p>
                        )}
                      </div>
                      <div className={`text-right ${customStyle ? 'opacity-75' : colorClasses.text + ' opacity-75'}`}>
                        <div className="text-sm">
                          {Math.round((timeToMinutes(timeSlot.endTime) - timeToMinutes(timeSlot.startTime)) / 60 * 10) / 10}h
                        </div>
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
  };

  if (subjects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Timetable Available</h3>
          <p className="text-gray-500">Add some subjects and schedule classes to see your timetable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timetable</h2>
          <p className="text-gray-600">Your weekly class schedule overview</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={currentView === 'week' ? 'default' : 'outline'}
            onClick={() => setCurrentView('week')}
          >
            Week View
          </Button>
          <Button
            variant={currentView === 'day' ? 'default' : 'outline'}
            onClick={() => setCurrentView('day')}
          >
            Day View
          </Button>
        </div>
      </div>

      {currentView === 'week' ? (
        <WeekView />
      ) : (
        <div className="space-y-4">
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="grid w-full grid-cols-7">
              {DAYS_OF_WEEK.map(day => (
                <TabsTrigger key={day.value} value={day.value} className="text-xs">
                  {day.label.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedDay} className="mt-4">
              <DayView />
            </TabsContent>
          </Tabs>
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