import { useState, useMemo } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Shield, Users, Briefcase, Code, User } from "lucide-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { AppRole } from "@/types/user";

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
  const { profiles, tasks, loading } = useSupabaseData();
  const { getUserPrimaryRole } = useRoleManagement();
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
    </div>
  );
}
