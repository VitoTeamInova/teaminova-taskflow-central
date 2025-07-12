import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Calendar } from "lucide-react";
import { mockTasks, mockProjects, mockTeamMembers } from "@/data/mockData";
import { Task } from "@/types/task";

const Dashboard = () => {
  const [tasks] = useState<Task[]>(mockTasks);

  // Calculate dashboard metrics
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  }).length;
  
  const completionRate = totalTasks > 0 ? ((tasks.filter(task => task.status === 'completed').length / totalTasks) * 100) : 0;

  // Recent activity
  const recentActivity = tasks
    .filter(task => task.updateLog.length > 0)
    .sort((a, b) => new Date(b.updateLog[0].timestamp).getTime() - new Date(a.updateLog[0].timestamp).getTime())
    .slice(0, 5);

  // Upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(task => task.dueDate && task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const getCompletionStatusBadge = (task: Task) => {
    if (task.status !== 'completed' || !task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const completionDate = task.completionDate ? new Date(task.completionDate) : new Date();
    const diffTime = completionDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return <Badge variant="secondary">On-Time</Badge>;
    if (diffDays > 0) return <Badge variant="destructive">{diffDays} days late</Badge>;
    return <Badge variant="outline" className="text-green-600">{Math.abs(diffDays)} days early</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-2xl font-bold">Welcome back, John!</h1>
        <p className="text-primary-foreground/80">You have {tasks.filter(task => task.assignee === 'John Smith').length} tasks assigned to you</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Tasks */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Tasks
              <a href="#" className="ml-auto text-sm text-primary hover:underline">View All</a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.filter(task => task.assignee === 'John Smith').slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.projectId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.status.replace('-', ' ')}</Badge>
                    {getCompletionStatusBadge(task)}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{task.percentCompleted}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
              <a href="#" className="ml-auto text-sm text-primary hover:underline">View Calendar</a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title.substring(0, 40)}{task.title.length > 40 ? '...' : ''}</p>
                    <p className="text-xs text-muted-foreground">{task.assignee}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'blocked' ? 'destructive' : 'outline'}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    {task.dueDate && (
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <a href="#" className="text-sm text-primary hover:underline">View All</a>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProjects.map(project => {
              const projectTasks = tasks.filter(task => task.projectId === project.id);
              const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
              const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
              
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {mockTeamMembers.find(m => m.id === project.projectManager)?.name || 'Unassigned'} members
                      </span>
                      <Badge variant="outline" className="text-green-600">On Track</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{project.description}</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${progress}%`, 
                        backgroundColor: project.color 
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% Complete</span>
                    <span>{project.targetCompletionDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <a href="#" className="text-sm text-primary hover:underline">View All</a>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{task.assignee}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.updateLog[0].timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Task created by {task.assignee} on "{task.title}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;