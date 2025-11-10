import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedAccount {
  accountLogin: string;
  investorPassword: string;
  masterPassword?: string;
  platformType: "meta4" | "meta5";
  accountType: "usd" | "cent";
  platformNameServer: string;
  botRunning?: string;
  accountBalance?: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

export function BulkImportDialog({ open, onClose, onSuccess }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedAccounts, setParsedAccounts] = useState<ParsedAccount[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseWithAI = trpc.aiChat.sendMessage.useMutation();
  const createAccount = trpc.forexAccounts.create.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsingFile(true);

    try {
      // Read file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Convert to text format for AI
      const textData = jsonData
        .map((row: any) => row.join(" | "))
        .join("\n");

      // Send to AI for parsing
      const response = await parseWithAI.mutateAsync({
        message: `Parse this forex account data from a spreadsheet. Extract all accounts and return them as a JSON array. Each account should have: account_login, investor_password, master_password (optional), platform_type (meta4 or meta5), account_type (usd or cent), platform_name_server, bot_running (optional), account_balance (optional, default 0).\n\nData:\n${textData}`,
      });

      // Extract JSON from AI response
      const jsonMatch = response.message.match(/```json\n([\s\S]*?)\n```/) || 
                       response.message.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const accounts = JSON.parse(jsonStr);
        
        const parsed: ParsedAccount[] = (Array.isArray(accounts) ? accounts : [accounts]).map((acc: any) => ({
          accountLogin: acc.account_login || "",
          investorPassword: acc.investor_password || "",
          masterPassword: acc.master_password || "",
          platformType: acc.platform_type === "meta4" ? "meta4" : "meta5",
          accountType: acc.account_type === "cent" ? "cent" : "usd",
          platformNameServer: acc.platform_name_server || "",
          botRunning: acc.bot_running || "",
          accountBalance: acc.account_balance?.toString() || "0.00",
          status: "pending" as const,
        }));

        setParsedAccounts(parsed);
        toast.success(`Parsed ${parsed.length} accounts from file`);
      } else {
        throw new Error("Could not parse accounts from AI response");
      }
    } catch (error: any) {
      console.error("Failed to parse file:", error);
      toast.error(`Failed to parse file: ${error.message}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleImport = async () => {
    if (parsedAccounts.length === 0) return;

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    // Import accounts one by one
    for (let i = 0; i < parsedAccounts.length; i++) {
      const account = parsedAccounts[i];
      
      try {
        await createAccount.mutateAsync({
          ...account,
          linkedUserEmail: "",
        });
        
        setParsedAccounts(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "success" };
          return updated;
        });
        successCount++;
      } catch (error: any) {
        setParsedAccounts(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "error", error: error.message };
          return updated;
        });
        errorCount++;
      }
    }

    setIsImporting(false);
    
    if (errorCount === 0) {
      toast.success(`Successfully imported ${successCount} accounts!`);
      onSuccess();
      handleClose();
    } else {
      toast.warning(`Imported ${successCount} accounts, ${errorCount} failed`);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedAccounts([]);
    setIsParsingFile(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            Bulk Import Accounts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          {parsedAccounts.length === 0 && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bulk-import-file"
                />
                <label
                  htmlFor="bulk-import-file"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">
                      {isParsingFile ? "Parsing file..." : "Click to upload CSV or Excel file"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supported formats: .csv, .xlsx, .xls
                    </p>
                  </div>
                  {file && (
                    <div className="text-sm text-cyan-400">
                      Selected: {file.name}
                    </div>
                  )}
                </label>
              </div>

              <div className="glass rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Expected Format:</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Your spreadsheet should contain columns with account information:
                </p>
                <div className="text-xs font-mono bg-black/30 rounded p-3 text-gray-300">
                  Account | Password | Platform | Type | Server | Bot | Balance<br/>
                  12345678 | Pass123 | MT5 | USD | Exness-Real1 | Bot1 | 1000<br/>
                  87654321 | Pass456 | MT4 | Cent | IC Markets | | 500
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedAccounts.length > 0 && !isImporting && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">
                  Preview ({parsedAccounts.length} accounts)
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setParsedAccounts([])}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Import All
                  </Button>
                </div>
              </div>

              <div className="glass rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Account</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Platform</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Server</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Bot</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedAccounts.map((account, index) => (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm text-white">{account.accountLogin}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{account.platformType.toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{account.accountType.toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{account.platformNameServer}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{account.botRunning || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">${account.accountBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <p className="text-white">Importing accounts...</p>
              </div>

              <div className="glass rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {parsedAccounts.map((account, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-white">{account.accountLogin}</span>
                      {account.status === "pending" && (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      )}
                      {account.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {account.status === "error" && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">{account.error}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isParsingFile && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <p className="text-white">Parsing file with AI...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
