import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Shield, User } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function UserManagement() {
  const [, setLocation] = useLocation();

  const { data: users, refetch: refetchUsers } = trpc.users.list.useQuery();

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleRoleChange = (userId: number, newRole: "admin" | "user") => {
    updateRole.mutate({ userId, role: newRole });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Users</h2>
          
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Last Signed In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Shield className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                      {user.name || "Unnamed User"}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{user.email || "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "user")}
                    >
                      <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Client</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Linking</h2>
          <p className="text-slate-300">
            To link accounts to users, use the "Linked User Email" field when creating or editing a forex account.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Enter the user's email address in the "Linked User Email" field to grant them access to that account.
          </p>
        </Card>
      </div>
    </div>
  );
}
