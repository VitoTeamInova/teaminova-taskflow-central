import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Upload, Link as LinkIcon, Check } from "lucide-react";
import { Task, TaskStatus, Project } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { useAppData } from "@/hooks/useAppData";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onCreateTask: () => void;
}

export default function TaskList({ tasks, projects, onEditTask, onCreateTask }: TaskListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { createTask, profiles } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeStatus = (s: string): TaskStatus | null => {
    const v = (s || "").toLowerCase().trim();
    if (["todo", "to do"].includes(v)) return "todo";
    if (["in-progress", "in progress"].includes(v)) return "in-progress";
    if (["completed", "done"].includes(v)) return "completed";
    if (["blocked"].includes(v)) return "blocked";
    if (["cancelled", "canceled"].includes(v)) return "cancelled";
    return null;
  };

  const normalizePriority = (p: string): string | null => {
    const v = (p || "").toLowerCase().trim();
    if (["low", "medium", "high", "critical"].includes(v)) return v;
    return null;
  };

  const toDateISO = (val: any): string | undefined => {
    if (!val) return undefined;
    try {
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
      return undefined;
    } catch {
      return undefined;
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      let success = 0, skipped = 0;
      for (const row of rows) {
        const title = row['Task Title'] || row['Title'] || row['task_title'] || row['task'];
        const description = row['Description'] || row['description'] || '';
        const projectName = row['Project'] || row['project'] || '';
        const statusRaw = row['Status'] || row['status'] || '';
        const priorityRaw = row['Priority'] || row['priority'] || '';
        const assigneeRaw = row['Assignee'] || row['assignee'] || '';
        const dueDateRaw = row['Due Date'] || row['due_date'] || '';
        const startDateRaw = row['Start Date'] || row['start_date'] || '';
        const progressRaw = row['Progress'] || row['percentCompleted'] || row['percent_completed'] || '';
        const estHours = row['Estimated Hours'] ?? row['estimated_hours'] ?? 0;
        const actHours = row['Actual Hours'] ?? row['actual_hours'] ?? 0;
        const referenceUrl = row['Reference URL'] || row['reference_url'] || '';

        if (!title || !projectName) { skipped++; continue; }

        const project = projects.find(p => p.name.toLowerCase().trim() === String(projectName).toLowerCase().trim());
        if (!project) { skipped++; continue; }

        const status = normalizeStatus(String(statusRaw)) ?? 'todo';
        const priority = normalizePriority(String(priorityRaw)) ?? 'medium';

        const assigneeProfile = profiles.find(p =>
          p.email?.toLowerCase() === String(assigneeRaw).toLowerCase() ||
          p.name?.toLowerCase() === String(assigneeRaw).toLowerCase()
        );

        const percent_completed = typeof progressRaw === 'string' ? Number(String(progressRaw).replace('%','')) : Number(progressRaw || 0);

        try {
          await createTask({
            title,
            description,
            status,
            priority,
            assignee_id: assigneeProfile?.id ?? null,
            project_id: project.id,
            due_date: toDateISO(dueDateRaw),
            start_date: toDateISO(startDateRaw),
            percent_completed: isNaN(percent_completed) ? 0 : percent_completed,
            estimated_hours: Number(estHours) || 0,
            actual_hours: Number(actHours) || 0,
            reference_url: referenceUrl || null,
          });
          success++;
        } catch {
          skipped++;
        }
      }

      toast({
        title: "Import finished",
        description: `Imported ${success} task(s). Skipped ${skipped}.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: 'Could not parse the file. Ensure it is a valid Excel/CSV with correct columns.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.dueDate) < new Date();
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = filterProject === "all" || task.projectId === filterProject;
      
      let matchesStatus = true;
      if (filterStatus === "overdue") {
        matchesStatus = isOverdue(task);
      } else if (filterStatus === "blocked") {
        matchesStatus = task.status === "blocked";
      } else if (filterStatus === "todo") {
        matchesStatus = task.status === "todo";
      } else if (filterStatus === "in-progress") {
        matchesStatus = task.status === "in-progress";
      } else if (filterStatus !== "all") {
        matchesStatus = task.status === filterStatus;
      }
      
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [tasks, searchQuery, filterProject, filterStatus]);

  const exportToExcel = () => {
    const exportData = filteredTasks.map(task => ({
      'Task Title': task.title,
      'Description': task.description,
      'Project': task.project?.name || 'N/A',
      'Status': task.status,
      'Priority': task.priority,
      'Assignee': task.assignee || 'Unassigned',
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
      'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A',
      'Progress': `${task.percentCompleted}%`,
      'Estimated Hours': task.estimatedHours,
      'Actual Hours': task.actualHours,
      'Reference URL': task.reference_url || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    XLSX.writeFile(wb, `tasks_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export successful",
      description: `Exported ${filteredTasks.length} task(s) to Excel`,
    });
  };

  const copyTaskUrl = (taskId: string) => {
    const url = `${window.location.origin}/?taskId=${taskId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Task URL copied to clipboard",
    });
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'default';
      case 'blocked': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-600 font-semibold';
      case 'medium': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task List</h2>
          <p className="text-muted-foreground">View and manage all tasks in table format</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Tasks
          </Button>
          <Button onClick={onCreateTask} className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overdue">Tasks Overdue</SelectItem>
            <SelectItem value="blocked">Tasks Blocked</SelectItem>
            <SelectItem value="todo">Tasks To Do</SelectItem>
            <SelectItem value="in-progress">Tasks In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => (
              <TableRow 
                key={task.id}
                className={`cursor-pointer hover:bg-muted/50 ${isOverdue(task) ? 'bg-red-50' : ''}`}
                onClick={() => onEditTask(task)}
              >
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {task.project && (
                      <>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: task.project.color }}
                        />
                        <span>{task.project.name}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className={getPriorityColor(task.priority)}>
                  {task.priority}
                </TableCell>
                <TableCell>{task.assignee || 'Unassigned'}</TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span className={isOverdue(task) ? 'text-red-600 font-semibold' : ''}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${task.percentCompleted}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{task.percentCompleted}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyTaskUrl(task.id);
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found matching the filters
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
