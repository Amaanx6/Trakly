import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks, Task } from '../hooks/useTasks';
import Button from '../components/Common/Button';
import GlassContainer from '../components/Common/GlassContainer';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks } = useTasks();
  
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTasksForDay = (date: Date): Task[] => {
    return tasks.filter(task => 
      isSameDay(new Date(task.deadline), date)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar View</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <h2 className="text-xl font-semibold px-4">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>

      <GlassContainer className="rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center font-semibold bg-dark-900/50">
              {day}
            </div>
          ))}
          
          {days.map(day => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toString()}
                className={`
                  min-h-[120px] p-2 relative
                  ${!isCurrentMonth ? 'bg-dark-900/30 text-dark-400' : 'glass'}
                  ${isToday(day) ? 'ring-2 ring-primary-500' : ''}
                `}
              >
                <span className={`
                  inline-block w-6 h-6 text-center rounded-full
                  ${isToday(day) ? 'bg-primary-500 text-white' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                
                <div className="mt-2 space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task._id}
                      className={`
                        text-xs p-1 rounded truncate
                        ${task.priority === 'high' ? 'bg-error-900/50 text-error-300' :
                          task.priority === 'medium' ? 'bg-warning-900/50 text-warning-300' :
                          'bg-success-900/50 text-success-300'}
                      `}
                      title={`${task.title} - ${format(new Date(task.deadline), 'h:mm a')}`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassContainer>
    </div>
  );
};

export default CalendarPage;



