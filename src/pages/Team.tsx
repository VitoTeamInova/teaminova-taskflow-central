import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, User, Mail, Briefcase, EyeOff } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SecureEmail } from "@/components/SecureEmail";
import { useRoleManagement } from "@/hooks/useRoleManagement";

const roleLabels = {
  administrator: 'Administrator',
  project_manager: 'Project Manager',
  dev_lead: 'Dev Lead/Architect',
  developer: 'Developer',
  product_owner: 'Product Owner',
  team_member: 'Team Member',
} as const;

const Team = () => {
  const { profiles, tasks, loading, refetchProfiles } = useSupabaseData();
  const { getUserPrimaryRole } = useRoleManagement();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, we'll create a basic auth user - in a real app you'd send an invitation
      const { data, error } = await supabase.auth.signUp({
        email: newMember.email,
        password: 'TempPassword123!', // In production, send invitation email instead
        options: {
          data: {
            name: newMember.name
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add team member: " + error.message,
          variant: "destructive"
        });
        return;
      }

      // The profile will be created automatically by the trigger
      // Now add the role to user_roles table
      if (data.user && newMember.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: data.user.id,
            role: newMember.role as any
          }]);

        if (roleError) {
          console.error('Error adding role:', roleError);
        }
      }

      await refetchProfiles();
      setNewMember({ name: '', email: '', role: '', photo: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: `${newMember.name} has been added to the team.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive"
      });
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      // Update profile info
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingMember.name,
          email: editingMember.email,
          avatar: editingMember.avatar
        })
        .eq('id', editingMember.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update team member: " + error.message,
          variant: "destructive"
        });
        return;
      }

      // Update role in user_roles table if changed
      if (editingMember.role) {
        // First delete existing roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editingMember.user_id);

        // Then insert the new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: editingMember.user_id,
            role: editingMember.role as any
          }]);

        if (roleError) {
          console.error('Error updating role:', roleError);
        }
      }

      await refetchProfiles();
      setIsEditDialogOpen(false);
      setEditingMember(null);
      
      toast({
        title: "Success",
        description: "Team member updated successfully.",
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const member = profiles.find(m => m.id === memberId);
    
    try {
      // Note: In production, you might want to deactivate instead of delete
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove team member: " + error.message,
          variant: "destructive"
        });
        return;
      }

      await refetchProfiles();
      
      toast({
        title: "Success",
        description: `${member?.name} has been removed from the team.`,
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive"
      });
    }
  };

  const getMemberTasks = (memberId: string) => {
    return tasks.filter(task => task.assignee_id === memberId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-6 overflow-y-auto">
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
                <select
                  id="role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Select a role</option>
                  <option value="administrator">Administrator</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="dev_lead">Dev Lead/Architect</option>
                  <option value="developer">Developer</option>
                  <option value="product_owner">Product Owner</option>
                  <option value="team_member">Team Member</option>
                </select>
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
        {profiles.map(member => {
          const memberTasks = getMemberTasks(member.id);
          const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
          const userRole = getUserPrimaryRole(member.user_id);
          
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
                  {roleLabels[userRole] || 'Team Member'}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <SecureEmail email={member.email} userId={member.user_id} />
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
                      const currentRole = getUserPrimaryRole(member.user_id);
                      setEditingMember({ ...member, role: currentRole });
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
                    <span className="font-medium">Email:</span>{" "}
                    <SecureEmail email={selectedMember.email} userId={selectedMember.user_id} showIcon={false} />
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {roleLabels[getUserPrimaryRole(selectedMember.user_id)]}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Assigned Tasks ({getMemberTasks(selectedMember.id).length})</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                     {getMemberTasks(selectedMember.id).map(task => (
                       <div 
                         key={task.id} 
                         className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            // Close member detail dialog and open task detail
                            setIsMemberDetailOpen(false);
                            // Convert database task format to frontend format for the event
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
                          }}
                       >
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
                             <span>{task.percent_completed}% complete</span>
                             {task.due_date && (
                               <span className="text-muted-foreground">
                                 Due: {new Date(task.due_date).toLocaleDateString()}
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
                <select
                  id="edit-role"
                  value={editingMember.role || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm mt-1"
                >
                  <option value="">Select a role</option>
                  <option value="administrator">Administrator</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="dev_lead">Dev Lead/Architect</option>
                  <option value="developer">Developer</option>
                  <option value="product_owner">Product Owner</option>
                  <option value="team_member">Team Member</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-photo">Photo URL</Label>
                <Input
                  id="edit-photo"
                  value={editingMember.avatar || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, avatar: e.target.value })}
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