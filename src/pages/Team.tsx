import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, User, Mail, Briefcase } from "lucide-react";
import { mockTeamMembers, mockTasks } from "@/data/mockData";
import { TeamMember, Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [tasks] = useState<Task[]>(mockTasks);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    photo: ''
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      avatar: newMember.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format`,
      photo: newMember.photo
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', email: '', role: '', photo: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: `${member.name} has been added to the team.`,
    });
  };

  const handleEditMember = () => {
    if (!editingMember) return;

    setTeamMembers(members => 
      members.map(member => 
        member.id === editingMember.id ? editingMember : member
      )
    );
    setIsEditDialogOpen(false);
    setEditingMember(null);
    
    toast({
      title: "Success",
      description: "Team member updated successfully.",
    });
  };

  const handleDeleteMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setTeamMembers(members => members.filter(m => m.id !== memberId));
    
    toast({
      title: "Success",
      description: `${member?.name} has been removed from the team.`,
    });
  };

  const getMemberTasks = (memberName: string) => {
    return tasks.filter(task => task.assignee === memberName);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and view their assigned tasks</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Team Member Information</h4>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="Enter role (e.g., Developer, Designer)"
                />
              </div>
              <div>
                <Label htmlFor="photo">Photo URL</Label>
                <Input
                  id="photo"
                  value={newMember.photo || ''}
                  onChange={(e) => setNewMember({ ...newMember, photo: e.target.value })}
                  placeholder="Enter photo URL (optional)"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddMember} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">Add Member</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {teamMembers.map(member => {
          const memberTasks = getMemberTasks(member.name);
          const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
          
          return (
            <Card key={member.id} className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  {member.role}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {memberTasks.length} tasks assigned
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Task Progress</span>
                    <span>{memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsMemberDetailOpen(true);
                    }}
                  >
                    <User className="h-4 w-4 mr-1" />
                    View Tasks
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingMember({ ...member });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Member Detail Dialog */}
      <Dialog open={isMemberDetailOpen} onOpenChange={setIsMemberDetailOpen}>
        <DialogContent className="bg-card/95 backdrop-blur max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedMember && (
                <>
                  <Avatar>
                    <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                    <AvatarFallback>{getInitials(selectedMember.name)}</AvatarFallback>
                  </Avatar>
                  {selectedMember.name} - Tasks
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {selectedMember.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {selectedMember.role}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Assigned Tasks ({getMemberTasks(selectedMember.name).length})</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {getMemberTasks(selectedMember.name).map(task => (
                      <div key={task.id} className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{task.title}</h5>
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 'outline'}
                            className="ml-2"
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <Badge 
                            variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}
                          >
                            {task.priority}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span>{task.percentCompleted}% complete</span>
                            {task.dueDate && (
                              <span className="text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Edit Team Member</h4>
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-photo">Photo URL</Label>
                <Input
                  id="edit-photo"
                  value={editingMember.photo || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                  placeholder="Enter photo URL (optional)"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditMember} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;