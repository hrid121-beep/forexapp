import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle, Clock, Database, Play, XCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SchemaManagement() {
  const [, setLocation] = useLocation();
  const [selectedMod, setSelectedMod] = useState<any>(null);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);

  const { data: modifications, refetch } = trpc.schemaModifications.getAll.useQuery();
  const executeMod = trpc.schemaModifications.execute.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Schema modification executed successfully!");
        refetch();
        setShowExecuteDialog(false);
        setSelectedMod(null);
      } else {
        toast.error(`Execution failed: ${result.error}`);
      }
    },
    onError: () => {
      toast.error("Failed to execute schema modification");
    },
  });

  const approveMod = trpc.schemaModifications.approve.useMutation({
    onSuccess: () => {
      toast.success("Schema modification approved!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to approve schema modification");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "executed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      case "approved":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "executed":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    }
  };

  const handleExecute = async () => {
    if (!selectedMod) return;

    // If not approved yet, approve first
    if (selectedMod.status === "pending") {
      await approveMod.mutateAsync({ id: selectedMod.id });
    }

    // Then execute
    executeMod.mutate({ id: selectedMod.id });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2332] to-[#0f1c2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-cyan-400" />
                Schema Management
              </h1>
              <p className="text-gray-400 mt-1">Review and execute database schema modifications</p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <Card className="bg-yellow-500/10 border-yellow-500/20 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-1">Important:</p>
              <p>Schema modifications directly alter your database structure. Always review the SQL carefully before executing. Back up your data if needed.</p>
            </div>
          </div>
        </Card>

        {/* Modifications List */}
        <div className="space-y-4">
          {modifications && modifications.length > 0 ? (
            modifications.map((mod: any) => (
              <Card
                key={mod.id}
                className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedMod(mod);
                  if (mod.status === "pending" || mod.status === "approved") {
                    setShowExecuteDialog(true);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(mod.status)}
                      <h3 className="text-lg font-semibold text-white">
                        {mod.modificationType.replace(/_/g, " ").toUpperCase()} - {mod.tableName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mod.status)}`}>
                        {mod.status}
                      </span>
                    </div>

                    {mod.description && (
                      <p className="text-gray-400 mb-3">{mod.description}</p>
                    )}

                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <code className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {mod.sqlQuery}
                      </code>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Created: {new Date(mod.createdAt).toLocaleString()}</span>
                      {mod.executedAt && (
                        <span>Executed: {new Date(mod.executedAt).toLocaleString()}</span>
                      )}
                    </div>

                    {mod.errorMessage && (
                      <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-sm text-red-400">
                          <strong>Error:</strong> {mod.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  {(mod.status === "pending" || mod.status === "approved") && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMod(mod);
                        setShowExecuteDialog(true);
                      }}
                      className="ml-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-white/5 border-white/10 p-12 text-center">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Schema Modifications</h3>
              <p className="text-gray-400">
                Ask the AI assistant to create custom fields or propose schema changes
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Execute Confirmation Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent className="bg-[#1a2332] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Schema Modification
            </DialogTitle>
          </DialogHeader>

          {selectedMod && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Description:</h4>
                <p className="text-sm text-gray-400">{selectedMod.description || "No description provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">SQL Query:</h4>
                <Card className="bg-black/50 p-4 border-white/10">
                  <code className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {selectedMod.sqlQuery}
                  </code>
                </Card>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Modification Type:</h4>
                <p className="text-sm text-gray-400">
                  {selectedMod.modificationType.replace(/_/g, " ").toUpperCase()} on table <code className="text-cyan-400">{selectedMod.tableName}</code>
                  {selectedMod.columnName && <> (column: <code className="text-cyan-400">{selectedMod.columnName}</code>)</>}
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-200">
                    <p className="font-semibold mb-1">Warning:</p>
                    <p>This action will immediately execute the SQL query and modify your database. This cannot be easily undone. Make sure you understand the changes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowExecuteDialog(false);
                setSelectedMod(null);
              }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={executeMod.isPending || approveMod.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              {executeMod.isPending || approveMod.isPending ? "Executing..." : "Execute Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
