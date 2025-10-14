import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar } from "lucide-react";
import { useSupabaseData, DatabaseTask } from "@/hooks/useSupabaseData";

export default function OverdueTasks() {
  const { tasks, loading } = useSupabaseData();

  const overdueTasksByPriority = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdue = tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      if (!task.due_date) return false;
      
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });

    return {
      critical: overdue.filter(t => t.priority === 'critical'),
      high: overdue.filter(t => t.priority === 'high'),
      medium: overdue.filter(t => t.priority === 'medium'),
      low: overdue.filter(t => t.priority === 'low'),
    };
  }, [tasks]);

  const handleTaskClick = (task: DatabaseTask) => {
    const frontendTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.name || '',
      assigneeId: task.assignee_id || '',
      projectId: task.project_id,
      dueDate: task.due_date || '',
      startDate: task.start_date || '',
      completionDate: task.completion_date || '',
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      actualHours: task.actual_hours,
      estimatedHours: task.estimated_hours,
      percentCompleted: task.percent_completed,
      project: task.project,
      updateLog: (task.update_logs || []).map((log: any) => ({
        timestamp: log.created_at,
        text: log.text
      })),
      updateLogs: task.update_logs || [],
      relatedTasks: task.related_tasks?.map((rt: any) => rt.related_task_id) || []
    };
    window.dispatchEvent(new CustomEvent('openTaskDetail', { detail: frontendTask }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  const totalOverdue = Object.values(overdueTasksByPriority).flat().length;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          Critical Overdue Tasks
        </h1>
        <p className="text-muted-foreground mt-2">
          {totalOverdue} task{totalOverdue !== 1 ? 's' : ''} overdue and requiring attention
        </p>
      </div>

      <div className="space-y-6">
        {(['critical', 'high', 'medium', 'low'] as const).map(priority => {
          const tasksForPriority = overdueTasksByPriority[priority];
          if (tasksForPriority.length === 0) return null;

          return (
            <div key={priority}>
              <h2 className="text-xl font-semibold mb-3 capitalize flex items-center gap-2">
                <Badge variant={priority === 'critical' ? 'destructive' : priority === 'high' ? 'default' : 'secondary'}>
                  {priority}
                </Badge>
                <span className="text-muted-foreground text-sm">({tasksForPriority.length})</span>
              </h2>
              <div className="grid gap-3">
                {tasksForPriority.map(task => {
                  const dueDate = new Date(task.due_date!);
                  const daysOverdue = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <Card 
                      key={task.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge variant="destructive" className="ml-2">
                            {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {dueDate.toLocaleDateString()}
                            </div>
                            {task.assignee && (
                              <div>Assigned to: {task.assignee.name}</div>
                            )}
                            {task.project && (
                              <div>Project: {task.project.name}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {totalOverdue === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No overdue tasks! Great work! 🎉</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
