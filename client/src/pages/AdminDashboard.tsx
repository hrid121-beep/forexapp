import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Copy, Eye, EyeOff, LogOut, Plus, Trash2, Edit, Users as UsersIcon, MessageSquare, Database, Settings as SettingsIcon, Upload, UserPlus } from "lucide-react";
import { ServerCombobox } from "@/components/ServerCombobox";
import { BulkImportDialog } from "@/components/BulkImportDialog";
import { ManageAccessDialog } from "@/components/ManageAccessDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { SelfLearningAIChat } from "@/components/SelfLearningAIChat";

function AIChatDialog({ onClose, onAccountExtracted }: { onClose: () => void; onAccountExtracted: (data: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are an AI assistant helping users input forex account credentials. Extract structured data from unorganized text. When user provides account information, extract: account_login, investor_password, platform_type (meta4 or meta5), account_type (usd or cent), platform_name_server, bot_running, account_balance. Respond in JSON format with the extracted fields."
    },
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. You can paste your forex account credentials here in any format, and I'll help organize them. Just paste the information and I'll extract the details for you."
    }
  ]);
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (response) => {
      const assistantMessage = response.message;
      const messageContent = typeof assistantMessage === 'string' ? assistantMessage : JSON.stringify(assistantMessage);
      setMessages(prev => [...prev, { role: "assistant", content: messageContent }]);
      
      // Try to parse JSON response for account data
      try {
        const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const accountData = JSON.parse(jsonMatch[0]);
          if (accountData.account_login) {
            toast.success("Account details extracted! Review and save.");
            onAccountExtracted({
              accountLogin: accountData.account_login || "",
              investorPassword: accountData.investor_password || "",
              masterPassword: accountData.master_password || "",
              platformType: accountData.platform_type === "meta4" ? "meta4" : "meta5",
              accountType: accountData.account_type === "cent" ? "cent" : "usd",
              platformNameServer: accountData.platform_name_server || "",
              botRunning: accountData.bot_running || "",
              accountBalance: accountData.account_balance || "0.00",
              linkedUserEmail: "",
            });
          }
        }
      } catch (e) {
        // Not JSON, just a regular message
      }
    },
    onError: () => {
      toast.error("Failed to send message");
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    }
  });

  const handleSendMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
    sendMessage.mutate({
      message: content,
      userId: 1,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">AI Chat Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <MessageSquare className="w-5 h-5" />
        </Button>
      </div>
      <AIChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={sendMessage.isPending}
        placeholder="Paste your account credentials here..."
        height="500px"
        suggestedPrompts={[
          "Login: 12345678\nPassword: MyPass123\nServer: Exness-Real1\nMT5 USD account",
          "Account 87654321, investor pass: SecurePass456, MetaTrader 4, Cent account, IC Markets server"
        ]}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showManageAccess, setShowManageAccess] = useState(false);
  const [managingAccount, setManagingAccount] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are an AI assistant helping users input forex account credentials. Extract structured data from unorganized text. When user provides account information, extract: account_login, investor_password, platform_type (meta4 or meta5), account_type (usd or cent), platform_name_server, bot_running, account_balance. Respond in JSON format with the extracted fields."
    },
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. You can paste your forex account credentials here in any format, and I'll help organize them. Just paste the information and I'll extract the details for you."
    }
  ]);
  
  const [formData, setFormData] = useState({
    accountLogin: "",
    investorPassword: "",
    masterPassword: "",
    platformType: "meta5" as "meta4" | "meta5",
    accountType: "usd" as "usd" | "cent",
    platformNameServer: "",
    botRunning: "",
    accountBalance: "0.00",
    linkedUserEmail: "",
  });

  const { user } = useAuth();
  console.log('[AdminDashboard] User object:', user);
  console.log('[AdminDashboard] User role:', user?.role);
  const isAdmin = user?.role === "admin";
  console.log('[AdminDashboard] isAdmin:', isAdmin);
  
  // Admins see all accounts, clients see only their owned + linked accounts
  const { data: allAccounts = [], refetch: refetchAllAccounts } = trpc.forexAccounts.list.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const { data: userAccounts = [], refetch: refetchUserAccounts } = trpc.userAccountAccess.getUserAccounts.useQuery(
    undefined,
    { enabled: !isAdmin && !!user }
  );
  
  const accounts = isAdmin ? allAccounts : userAccounts;
  const refetchAccounts = isAdmin ? refetchAllAccounts : refetchUserAccounts;
  
  const { data: users = [] } = trpc.users.list.useQuery();
  const createAccount = trpc.forexAccounts.create.useMutation();
  const updateAccount = trpc.forexAccounts.update.useMutation();
  const deleteAccount = trpc.forexAccounts.delete.useMutation();
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (response) => {
      const assistantMessage = response.message;
      const messageContent = typeof assistantMessage === 'string' ? assistantMessage : JSON.stringify(assistantMessage);
      setMessages(prev => [...prev, { role: "assistant", content: messageContent }]);
      
      // Try to parse JSON response for account data
      try {
        const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const accountData = JSON.parse(jsonMatch[0]);
          if (accountData.account_login) {
            toast.success("Account details extracted! Review and save.");
            setFormData({
              accountLogin: accountData.account_login || "",
              investorPassword: accountData.investor_password || "",
              masterPassword: accountData.master_password || "",
              platformType: accountData.platform_type === "meta4" ? "meta4" : "meta5",
              accountType: accountData.account_type === "cent" ? "cent" : "usd",
              platformNameServer: accountData.platform_name_server || "",
              botRunning: accountData.bot_running || "",
              accountBalance: accountData.account_balance || "0.00",
              linkedUserEmail: "",
            });
            setShowChat(false);
            setShowAddAccount(true);
          }
        }
      } catch (e) {
        // Not JSON, just a regular message
      }
    },
    onError: () => {
      toast.error("Failed to send message");
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    }
  });

  const handleSendMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
    sendMessage.mutate({
      message: content,
      userId: 1,
    });
  };

  const generateAccountName = (login: string, platform: string) => {
    const last4 = login.slice(-4);
    const first4 = platform.slice(0, 4).toUpperCase();
    return `${last4}${first4}`;
  };

  const generateOwnerName = (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user || !user.name) return "";
    const parts = user.name.split(" ");
    if (parts.length < 2) return user.name;
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const lastTwo = lastName.slice(-2);
    return `${firstName}, ${lastTwo}x`;
  };

  const handleSubmit = async () => {
    try {
      const accountName = generateAccountName(formData.accountLogin, formData.platformNameServer);
      const linkedEmail = formData.linkedUserEmail === "__none__" ? "" : formData.linkedUserEmail;
      const ownerName = linkedEmail ? generateOwnerName(linkedEmail) : "";
      
      await createAccount.mutateAsync({
        ...formData,
        linkedUserEmail: linkedEmail,
        accountName,
        ownerName,
      });
      
      toast.success("Account created successfully");
      setShowAddAccount(false);
      refetchAccounts();
      setFormData({
        accountLogin: "",
        investorPassword: "",
        masterPassword: "",
        platformType: "meta5",
        accountType: "usd",
        platformNameServer: "",
        botRunning: "",
        accountBalance: "0.00",
        linkedUserEmail: "",
      });
    } catch (error) {
      toast.error("Failed to create account");
    }
  };

  const handleUpdate = async () => {
    if (!editingAccount) return;
    try {
      const accountName = generateAccountName(formData.accountLogin, formData.platformNameServer);
      const linkedEmail = formData.linkedUserEmail === "__none__" ? "" : formData.linkedUserEmail;
      const ownerName = linkedEmail ? generateOwnerName(linkedEmail) : "";
      
      await updateAccount.mutateAsync({
        id: editingAccount.id,
        ...formData,
        linkedUserEmail: linkedEmail,
        accountName,
        ownerName,
      });
      
      toast.success("Account updated successfully");
      setShowEditAccount(false);
      setEditingAccount(null);
      refetchAccounts();
    } catch (error) {
      toast.error("Failed to update account");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await deleteAccount.mutateAsync({ id });
      toast.success("Account deleted successfully");
      refetchAccounts();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const canEditAccount = (account: any) => {
    if (isAdmin) return true;
    if (account.ownerId === user?.id) return true;
    // For linked accounts, we'd need to check the permission
    // For now, assume clients can't edit linked accounts unless they own them
    return false;
  };

  const canDeleteAccount = (account: any) => {
    if (isAdmin) return true;
    if (account.ownerId === user?.id) return true;
    return false;
  };

  const togglePasswordVisibility = (accountId: number) => {
    setShowPasswords(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const handleAccountExtracted = async (data: any) => {
    // Map AI extracted data to form format
    const mappedData = {
      accountLogin: data.account_login || "",
      investorPassword: data.investor_password || "",
      masterPassword: data.master_password || "",
      platformType: (data.platform_type || "meta5") as "meta4" | "meta5",
      accountType: (data.account_type || "usd") as "usd" | "cent",
      platformNameServer: data.platform_name_server || "",
      botRunning: data.bot_running || "",
      accountBalance: data.account_balance?.toString() || "0.00",
      linkedUserEmail: data.linked_user_email || "__none__",
    };
    
    // Auto-save the account to database
    try {
      await createAccount.mutateAsync({
        accountName: `Account ${mappedData.accountLogin}`,
        ...mappedData,
      });
      
      toast.success("✅ Account saved successfully!");
      refetchAccounts();
      setShowChat(false);
    } catch (error: any) {
      // If auto-save fails, fall back to manual form entry
      console.error("Auto-save failed:", error);
      toast.error("Could not auto-save. Please review and save manually.");
      
      setFormData(mappedData);
      setShowAddAccount(true);
      setShowChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2332] to-[#0f1922] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="container py-6">
          <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setShowChat(true)}
                    title="AI Chat Assistant"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setLocation("/schema-management")}
                    title="Schema Management"
                  >
                    <Database className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setLocation("/users")}
                    title="User Management"
                  >
                    <UsersIcon className="w-5 h-5" />
                  </Button>
                </>
              )}
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setLocation("/settings")}
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setLocation("/")}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Forex Accounts</h2>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowBulkImport(true)}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          )}
          <Button
            onClick={() => setShowAddAccount(true)}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account: any) => (
              <Card key={account.id} className="glass-card border-white/10 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Account Name</div>
                    <div className="text-xl font-bold gradient-text">{account.accountName}</div>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => {
                          setManagingAccount(account);
                          setShowManageAccess(true);
                        }}
                        title="Manage User Access"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    )}
                    {canEditAccount(account) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10"
                        onClick={() => {
                          setEditingAccount(account);
                          setFormData({
                            accountLogin: account.accountLogin,
                            investorPassword: account.investorPassword || "",
                            masterPassword: account.masterPassword || "",
                            platformType: account.platformType,
                            accountType: account.accountType,
                            platformNameServer: account.platformNameServer || "",
                            botRunning: account.botRunning || "",
                            accountBalance: account.accountBalance || "0.00",
                            linkedUserEmail: account.linkedUserEmail || "__none__",
                          });
                          setShowEditAccount(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canDeleteAccount(account) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {account.ownerName && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-400">Owner</div>
                    <div className="text-white">{account.ownerName}</div>
                  </div>
                )}

                <div className="mb-3">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-2xl font-bold gradient-text">${account.accountBalance}</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between glass rounded-lg p-2">
                    <div className="text-sm">
                      <div className="text-gray-400">Login</div>
                      <div>{account.accountLogin}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => copyToClipboard(account.accountLogin, "Login")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  {account.investorPassword && (
                    <div className="flex items-center justify-between glass rounded-lg p-2">
                      <div className="text-sm flex-1">
                        <div className="text-gray-400">Investor Password</div>
                        <div className="flex items-center gap-2">
                          <span>{showPasswords[account.id] ? account.investorPassword : "••••••••"}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:bg-white/10"
                            onClick={() => togglePasswordVisibility(account.id)}
                          >
                            {showPasswords[account.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => copyToClipboard(account.investorPassword, "Password")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {account.platformNameServer && (
                    <div className="flex items-center justify-between glass rounded-lg p-2">
                      <div className="flex items-center gap-2 text-sm flex-1">
                        {account.brokerLogoUrl && (
                          <img
                            src={account.brokerLogoUrl}
                            alt="Broker logo"
                            className="w-6 h-6 rounded object-contain bg-white/10 p-0.5"
                            onError={(e) => {
                              // Fallback to generic icon if logo fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-gray-400">Platform / Server</div>
                          <div>{account.platformNameServer}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => copyToClipboard(account.platformNameServer, "Platform")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="glass rounded-full px-3 py-1">{account.platformType.toUpperCase()}</span>
                  <span className="glass rounded-full px-3 py-1">{account.accountType.toUpperCase()}</span>
                  {account.botRunning && (
                    <span className="glass rounded-full px-3 py-1 text-green-400">Bot: {account.botRunning}</span>
                  )}
                  {!isAdmin && account.ownerId === user?.id && (
                    <span className="glass rounded-full px-3 py-1 text-cyan-400">Owned</span>
                  )}
                  {!isAdmin && account.ownerId !== user?.id && (
                    <span className="glass rounded-full px-3 py-1 text-yellow-400">Linked</span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg mb-4">No forex accounts yet</div>
              <Button
                onClick={() => setShowAddAccount(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Account
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="bg-[#1a2332] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Add Forex Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountLogin" className="text-white">Account Login *</Label>
                <Input
                  id="accountLogin"
                  value={formData.accountLogin}
                  onChange={(e) => setFormData({ ...formData, accountLogin: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="accountBalance" className="text-white">Account Balance</Label>
                <Input
                  id="accountBalance"
                  value={formData.accountBalance}
                  onChange={(e) => setFormData({ ...formData, accountBalance: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investorPassword" className="text-white">Investor Password</Label>
                <Input
                  id="investorPassword"
                  type="text"
                  value={formData.investorPassword}
                  onChange={(e) => setFormData({ ...formData, investorPassword: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="masterPassword" className="text-white">Master Password</Label>
                <Input
                  id="masterPassword"
                  type="text"
                  value={formData.masterPassword}
                  onChange={(e) => setFormData({ ...formData, masterPassword: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformType" className="text-white">Platform Type *</Label>
                <Select value={formData.platformType} onValueChange={(value: any) => setFormData({ ...formData, platformType: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    <SelectItem value="meta4" className="text-white">MetaTrader 4</SelectItem>
                    <SelectItem value="meta5" className="text-white">MetaTrader 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accountType" className="text-white">Account Type *</Label>
                <Select value={formData.accountType} onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    <SelectItem value="usd" className="text-white">USD</SelectItem>
                    <SelectItem value="cent" className="text-white">Cent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="platformNameServer" className="text-white">Platform Name / Server</Label>
              <ServerCombobox
                value={formData.platformNameServer}
                onChange={(value) => setFormData({ ...formData, platformNameServer: value })}
                placeholder="Select or type server name..."
              />
            </div>

            <div>
              <Label htmlFor="botRunning" className="text-white">Bot Running</Label>
              <Input
                id="botRunning"
                value={formData.botRunning}
                onChange={(e) => setFormData({ ...formData, botRunning: e.target.value })}
                placeholder="e.g., Smart EA"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="linkedUserEmail" className="text-white">Link to User</Label>
              <Select value={formData.linkedUserEmail} onValueChange={(value) => setFormData({ ...formData, linkedUserEmail: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-white/10">
                  <SelectItem value="__none__" className="text-white">None</SelectItem>
                  {users.filter((user: any) => user.email).map((user: any) => (
                    <SelectItem key={user.id} value={user.email} className="text-white">
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              disabled={!formData.accountLogin}
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditAccount} onOpenChange={setShowEditAccount}>
        <DialogContent className="bg-[#1a2332] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Edit Forex Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-accountLogin" className="text-white">Account Login *</Label>
                <Input
                  id="edit-accountLogin"
                  value={formData.accountLogin}
                  onChange={(e) => setFormData({ ...formData, accountLogin: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-accountBalance" className="text-white">Account Balance</Label>
                <Input
                  id="edit-accountBalance"
                  value={formData.accountBalance}
                  onChange={(e) => setFormData({ ...formData, accountBalance: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-investorPassword" className="text-white">Investor Password</Label>
                <Input
                  id="edit-investorPassword"
                  type="text"
                  value={formData.investorPassword}
                  onChange={(e) => setFormData({ ...formData, investorPassword: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-masterPassword" className="text-white">Master Password</Label>
                <Input
                  id="edit-masterPassword"
                  type="text"
                  value={formData.masterPassword}
                  onChange={(e) => setFormData({ ...formData, masterPassword: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-platformType" className="text-white">Platform Type *</Label>
                <Select value={formData.platformType} onValueChange={(value: any) => setFormData({ ...formData, platformType: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    <SelectItem value="meta4" className="text-white">MetaTrader 4</SelectItem>
                    <SelectItem value="meta5" className="text-white">MetaTrader 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-accountType" className="text-white">Account Type *</Label>
                <Select value={formData.accountType} onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    <SelectItem value="usd" className="text-white">USD</SelectItem>
                    <SelectItem value="cent" className="text-white">Cent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-platformNameServer" className="text-white">Platform Name / Server</Label>
              <ServerCombobox
                value={formData.platformNameServer}
                onChange={(value) => setFormData({ ...formData, platformNameServer: value })}
                placeholder="Select or type server name..."
              />
            </div>

            <div>
              <Label htmlFor="edit-botRunning" className="text-white">Bot Running</Label>
              <Input
                id="edit-botRunning"
                value={formData.botRunning}
                onChange={(e) => setFormData({ ...formData, botRunning: e.target.value })}
                placeholder="e.g., Smart EA"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-linkedUserEmail" className="text-white">Link to User</Label>
              <Select value={formData.linkedUserEmail} onValueChange={(value) => setFormData({ ...formData, linkedUserEmail: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-white/10">
                  <SelectItem value="__none__" className="text-white">None</SelectItem>
                  {users.filter((user: any) => user.email).map((user: any) => (
                    <SelectItem key={user.id} value={user.email} className="text-white">
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleUpdate}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
              disabled={!formData.accountLogin}
            >
              Update Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog - Self-Learning */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="bg-[#1a2332] border-white/10 max-w-5xl h-[85vh]">
          <DialogHeader className="sr-only">
            <DialogTitle>Self-Learning AI Assistant</DialogTitle>
          </DialogHeader>
          <SelfLearningAIChat onAccountExtracted={handleAccountExtracted} />
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={() => {
          refetchAccounts();
          setShowBulkImport(false);
        }}
      />

      {/* Manage Access Dialog */}
      <ManageAccessDialog
        account={managingAccount}
        open={showManageAccess}
        onClose={() => {
          setShowManageAccess(false);
          setManagingAccount(null);
        }}
      />
    </div>
  );
}
