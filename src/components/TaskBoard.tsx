import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onCreateTask: () => void;
}

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as TaskStatus },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as TaskStatus },
  { id: 'completed', title: 'Completed', status: 'completed' as TaskStatus },
  { id: 'blocked', title: 'Blocked', status: 'blocked' as TaskStatus },
];

export function TaskBoard({ tasks, onEditTask, onStatusChange, onCreateTask }: TaskBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
          <p className="text-muted-foreground">Manage your tasks with a visual workflow</p>
        </div>
        <Button onClick={onCreateTask} className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="ml-2">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onStatusChange={onStatusChange}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}