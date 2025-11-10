import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ManageAccessDialogProps {
  account: any;
  open: boolean;
  onClose: () => void;
}

export function ManageAccessDialog({ account, open, onClose }: ManageAccessDialogProps) {
  const [userAccess, setUserAccess] = useState<Record<number, { hasAccess: boolean; canEdit: boolean }>>({});
  const [loading, setLoading] = useState(false);

  const { data: users } = trpc.users.list.useQuery();
  const { data: linkedUsers, refetch: refetchLinkedUsers } = trpc.userAccountAccess.getAccountUsers.useQuery(
    { accountId: account?.id },
    { enabled: !!account }
  );

  const linkAccount = trpc.userAccountAccess.linkAccount.useMutation({
    onSuccess: () => {
      toast.success("Access updated successfully");
      refetchLinkedUsers();
    },
    onError: (error) => {
      toast.error(`Failed to update access: ${error.message}`);
    },
  });

  const unlinkAccount = trpc.userAccountAccess.unlinkAccount.useMutation({
    onSuccess: () => {
      toast.success("Access removed successfully");
      refetchLinkedUsers();
    },
    onError: (error) => {
      toast.error(`Failed to remove access: ${error.message}`);
    },
  });

  // Initialize user access state from linked users
  useEffect(() => {
    if (linkedUsers && users) {
      const accessMap: Record<number, { hasAccess: boolean; canEdit: boolean }> = {};
      
      users.forEach((user: any) => {
        const linkedAccess = linkedUsers.find((link: any) => link.userId === user.id);
        accessMap[user.id] = {
          hasAccess: !!linkedAccess,
          canEdit: linkedAccess?.canEdit === "yes",
        };
      });
      
      setUserAccess(accessMap);
    }
  }, [linkedUsers, users]);

  const handleAccessChange = async (userId: number, hasAccess: boolean) => {
    setLoading(true);
    try {
      if (hasAccess) {
        // Link the account
        await linkAccount.mutateAsync({
          accountId: account.id,
          userId,
          canEdit: userAccess[userId]?.canEdit || false,
        });
      } else {
        // Unlink the account
        await unlinkAccount.mutateAsync({
          accountId: account.id,
          userId,
        });
      }
      
      setUserAccess(prev => ({
        ...prev,
        [userId]: { ...prev[userId], hasAccess },
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissionChange = async (userId: number, canEdit: boolean) => {
    setLoading(true);
    try {
      await linkAccount.mutateAsync({
        accountId: account.id,
        userId,
        canEdit,
      });
      
      setUserAccess(prev => ({
        ...prev,
        [userId]: { ...prev[userId], canEdit },
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            Manage Access: {account.accountName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {users && users.length > 0 ? (
            users.map((user: any) => (
              <div
                key={user.id}
                className="glass rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold">{user.name || "Unnamed User"}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Role: {user.role === "admin" ? "Admin" : "Client"}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`access-${user.id}`}
                      checked={userAccess[user.id]?.hasAccess || false}
                      onCheckedChange={(checked) =>
                        handleAccessChange(user.id, checked as boolean)
                      }
                      disabled={loading}
                    />
                    <label
                      htmlFor={`access-${user.id}`}
                      className="text-sm cursor-pointer"
                    >
                      Has Access
                    </label>
                  </div>

                  {userAccess[user.id]?.hasAccess && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-${user.id}`}
                        checked={userAccess[user.id]?.canEdit || false}
                        onCheckedChange={(checked) =>
                          handleEditPermissionChange(user.id, checked as boolean)
                        }
                        disabled={loading}
                      />
                      <label
                        htmlFor={`edit-${user.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Can Edit
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No users found
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            Close
          </Button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
