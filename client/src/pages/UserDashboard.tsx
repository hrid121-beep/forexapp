import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Copy, Eye, EyeOff, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  
  const { data: accounts = [] } = trpc.forexAccounts.list.useQuery();
  
  // Filter accounts linked to current user
  const userAccounts = accounts.filter((account: any) => 
    account.linkedUserEmail === user?.email
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const togglePasswordVisibility = (accountId: number) => {
    setShowPasswords(prev => ({ ...prev, [accountId]: !prev[accountId] }));
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
            <div>
              <h1 className="text-2xl font-bold gradient-text">My Accounts</h1>
              {user && <p className="text-sm text-gray-400 mt-1">Welcome, {user.name}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setLocation("/")}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          {userAccounts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userAccounts.map((account: any) => (
                <Card key={account.id} className="glass-card border-white/10 p-6 text-white">
                  <div className="mb-4">
                    <div className="text-sm text-gray-400">Account Name</div>
                    <div className="text-xl font-bold gradient-text">{account.accountName}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-3xl font-bold gradient-text">${account.accountBalance}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between glass rounded-lg p-3">
                      <div className="text-sm">
                        <div className="text-gray-400 mb-1">Login</div>
                        <div className="font-mono">{account.accountLogin}</div>
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
                      <div className="flex items-center justify-between glass rounded-lg p-3">
                        <div className="text-sm flex-1">
                          <div className="text-gray-400 mb-1">Investor Password</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {showPasswords[account.id] ? account.investorPassword : "••••••••"}
                            </span>
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
                      <div className="flex items-center justify-between glass rounded-lg p-3">
                        <div className="text-sm">
                          <div className="text-gray-400 mb-1">Platform / Server</div>
                          <div>{account.platformNameServer}</div>
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
                      <span className="glass rounded-full px-3 py-1 text-green-400">
                        Bot: {account.botRunning}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold mb-2">No Accounts Yet</h2>
                <p className="text-gray-400">
                  You don't have any forex accounts linked to your profile yet. 
                  Contact your administrator to link accounts to your email.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
