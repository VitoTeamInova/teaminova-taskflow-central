import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "@/types/task";
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useAppData } from "@/hooks/useAppData";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { tasks, loading } = useAppData();

  // Get tasks for selected date
  const getTasksForDate = (selectedDate: Date) => {
    return tasks.filter(task => {
      if (task.status === 'completed' && task.completionDate) {
        return isSameDay(new Date(task.completionDate), selectedDate);
      } else if (task.dueDate) {
        return isSameDay(new Date(task.dueDate), selectedDate);
      }
      return false;
    });
  };

  const selectedDateTasks = date ? getTasksForDate(date) : [];

  // Get all dates that have tasks
  const getTaskDates = () => {
    const dates = new Set<string>();
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completionDate) {
        dates.add(new Date(task.completionDate).toDateString());
      } else if (task.dueDate && task.status !== 'completed') {
        dates.add(new Date(task.dueDate).toDateString());
      }
    });
    return Array.from(dates).map(dateStr => new Date(dateStr));
  };

  const taskDates = getTaskDates();

  const formatTaskForCalendar = (task: Task) => {
    const title = task.title.length > 40 ? task.title.substring(0, 40) + '...' : task.title;
    
    if (task.status === 'completed') {
      return {
        title,
        date: task.completionDate ? new Date(task.completionDate) : new Date(),
        status: task.status,
        isCompleted: true
      };
    } else {
      return {
        title,
        date: task.dueDate ? new Date(task.dueDate) : new Date(),
        status: task.status,
        isCompleted: false
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Calendar View</h1>
          <p className="text-muted-foreground">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  const previousMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? previousMonth : nextMonth);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendar View</h1>
        <p className="text-muted-foreground">View tasks by their due dates and completion dates</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Three Month Calendar View */}
        <div className="xl:col-span-3">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {/* Previous Month */}
                <div className="flex-shrink-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">
                    {format(previousMonth, 'MMMM yyyy')}
                  </h3>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={previousMonth}
                    className="rounded-md border bg-background/50 p-3 pointer-events-auto"
                    modifiers={{
                      hasTask: taskDates,
                    }}
                    modifiersStyles={{
                      hasTask: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        borderRadius: '6px',
                      },
                    }}
                  />
                </div>

                {/* Current Month */}
                <div className="flex-shrink-0">
                  <h3 className="text-sm font-medium mb-2 text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={currentMonth}
                    className="rounded-md border bg-background/50 p-3 pointer-events-auto"
                    modifiers={{
                      hasTask: taskDates,
                    }}
                    modifiersStyles={{
                      hasTask: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        borderRadius: '6px',
                      },
                    }}
                  />
                </div>

                {/* Next Month */}
                <div className="flex-shrink-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">
                    {format(nextMonth, 'MMMM yyyy')}
                  </h3>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={nextMonth}
                    className="rounded-md border bg-background/50 p-3 pointer-events-auto"
                    modifiers={{
                      hasTask: taskDates,
                    }}
                    modifiersStyles={{
                      hasTask: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        borderRadius: '6px',
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks for Selected Date */}
        <div>
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>
                {date ? format(date, 'MMMM d, yyyy') : 'Select a Date'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} on this date
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDateTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks scheduled for this date
                  </p>
                ) : (
                  selectedDateTasks.map(task => {
                    const formattedTask = formatTaskForCalendar(task);
                    return (
                      <div key={task.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{formattedTask.title}</h4>
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 'outline'}
                            className="ml-2"
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.assignee}</span>
                          <span>
                            {formattedTask.isCompleted 
                              ? `Completed: ${task.completionDate ? format(new Date(task.completionDate), 'MMM d') : 'Unknown'}` 
                              : `Due: ${task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date'}`
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.percentCompleted}% complete
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Legend */}
          <Card className="bg-card/50 backdrop-blur mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-primary rounded" />
                <span>Has tasks</span>
              </div>
              <div className="text-xs text-muted-foreground">
                • Completed tasks show completion date<br/>
                • Incomplete tasks show due date<br/>
                • Click a date to view tasks
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <Card className="bg-card/50 backdrop-blur mt-6">
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks
              .filter(task => task.dueDate && task.status !== 'completed')
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .slice(0, 6)
              .map(task => (
                <div key={task.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <h4 className="font-medium text-sm">
                    {task.title.length > 40 ? task.title.substring(0, 40) + '...' : task.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline">{task.status.replace('-', ' ')}</Badge>
                    <span className="text-muted-foreground">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{task.assignee}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;