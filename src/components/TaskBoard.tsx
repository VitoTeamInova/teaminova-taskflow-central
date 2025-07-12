import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

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

function DroppableColumn({ status, children }: { status: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status });
  return <div ref={setNodeRef}>{children}</div>;
}

export function TaskBoard({ tasks, onEditTask, onStatusChange, onCreateTask }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    // Check if the task is being moved to a different column
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
            <p className="text-muted-foreground">Manage your tasks with a visual workflow - drag tasks between columns</p>
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
              <SortableContext
                key={column.id}
                id={column.status}
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  className="flex flex-col"
                  style={{ minHeight: "200px" }}
                >
                  <div 
                    className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg"
                    data-droppable-id={column.status}
                  >
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <DroppableColumn status={column.status}>
                    <div className="flex-1 space-y-3 overflow-y-auto min-h-[150px] p-2 rounded-lg border-2 border-dashed border-muted-foreground/20">
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
                  </DroppableColumn>
                </div>
              </SortableContext>
            );
          })}
        </div>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={onEditTask}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}