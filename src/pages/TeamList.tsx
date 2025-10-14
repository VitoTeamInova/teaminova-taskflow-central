import { useState, useMemo } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Shield, Users, Briefcase, Code, User, Pencil } from "lucide-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { AppRole } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const roleIcons = {
  administrator: Shield,
  project_manager: Briefcase,
  dev_lead: Code,
  developer: Code,
  product_owner: Users,
  team_member: User,
};

const roleLabels = {
  administrator: 'Administrator',
  project_manager: 'Project Manager',
  dev_lead: 'Dev Lead/Architect',
  developer: 'Developer',
  product_owner: 'Product Owner',
  team_member: 'Team Member',
};

export default function TeamList() {
  const { profiles, tasks, loading, refetchProfiles } = useSupabaseData();
  const { getUserPrimaryRole, updateUserRole } = useRoleManagement();
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredProfiles = useMemo(() => {
    if (roleFilter === "all") return profiles;
    return profiles.filter(profile => {
      const userRole = getUserPrimaryRole(profile.user_id);
      return userRole === roleFilter;
    });
  }, [profiles, roleFilter, getUserPrimaryRole]);

  const getTaskCount = (profileId: string) => {
    return tasks.filter(task => task.assignee_id === profileId).length;
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
        await updateUserRole(editingMember.user_id, editingMember.role as any);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team List</h1>
          <p className="text-muted-foreground">View all team members and their assignments</p>
        </div>
        <div className="w-64">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-right py-3 px-4 font-semibold">Tasks Assigned</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const userRole = getUserPrimaryRole(profile.user_id);
                  const RoleIcon = roleIcons[userRole];
                  const taskCount = getTaskCount(profile.id);

                  return (
                    <tr key={profile.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant={userRole === 'administrator' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[userRole]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{profile.name}</td>
                      <td className="py-3 px-4">
                        <a 
                          href={`mailto:${profile.email}`}
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="outline">{taskCount}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingMember({ ...profile, role: userRole });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProfiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found for the selected role.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
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
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditMember} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
