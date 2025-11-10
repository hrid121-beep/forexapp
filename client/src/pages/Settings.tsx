import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [grokApiKey, setGrokApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Fetch current Grok API key
  const { data: grokSetting, isLoading } = trpc.settings.get.useQuery({ key: "grok_api_key" });

  useEffect(() => {
    if (grokSetting && grokSetting.settingValue) {
      setGrokApiKey(grokSetting.settingValue);
      setIsSaved(true);
    }
  }, [grokSetting]);

  // Save settings mutation
  const saveSetting = trpc.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      setIsSaved(true);
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  // Test API key mutation
  const testApiKey = trpc.settings.testGrokApiKey.useMutation({
    onSuccess: (result) => {
      setTestResult(result);
      if (result.success) {
        toast.success(result.message || "Connection successful!");
      } else {
        toast.error(result.error || "Connection failed");
      }
    },
    onError: () => {
      setTestResult({ success: false, error: "Failed to test connection" });
      toast.error("Failed to test connection");
    },
  });

  const handleSaveGrokKey = () => {
    if (!grokApiKey.trim()) {
      toast.error("Please enter a valid Grok API key");
      return;
    }

    saveSetting.mutate({
      key: "grok_api_key",
      value: grokApiKey,
      type: "api_key",
      description: "Grok API key for AI chat functionality",
    });
  };

  const handleTestConnection = () => {
    if (!grokApiKey.trim()) {
      toast.error("Please enter a Grok API key first");
      return;
    }

    setTestResult(null);
    testApiKey.mutate({ apiKey: grokApiKey });
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return `${key.substring(0, 4)}${"*".repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1729]">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="container">
          <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold gradient-text">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* API Keys Section */}
          <Card className="glass-card border-white/10 p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">API Keys</h2>
                <p className="text-sm text-gray-400">
                  Configure API keys for external services
                </p>
              </div>

              {/* Grok API Key */}
              <div className="space-y-2">
                <Label htmlFor="grok-api-key" className="text-white">
                  Grok API Key
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="grok-api-key"
                        type={showApiKey ? "text" : "password"}
                        value={grokApiKey}
                        onChange={(e) => {
                          setGrokApiKey(e.target.value);
                          setIsSaved(false);
                          setTestResult(null);
                        }}
                        placeholder="xai-..."
                        className="bg-white/5 border-white/10 text-white pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full text-gray-400 hover:text-white hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleTestConnection}
                      disabled={testApiKey.isPending || isLoading || !grokApiKey.trim()}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      {testApiKey.isPending ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSaveGrokKey}
                      disabled={saveSetting.isPending || isLoading || !grokApiKey.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0"
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Test Result */}
                  {testResult && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      testResult.success 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          testResult.success ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {testResult.success ? testResult.message : testResult.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Get your Grok API key from{" "}
                  <a
                    href="https://console.x.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    https://console.x.ai
                  </a>
                </p>
                {isSaved && !showApiKey && grokApiKey && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Current key: {maskApiKey(grokApiKey)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="glass-card border-white/10 p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About API Keys</h3>
              <p className="text-sm text-gray-400">
                API keys are stored securely in the database and are used to authenticate with external services.
                Your Grok API key enables the AI chat assistant to extract forex account credentials and provide
                intelligent suggestions.
              </p>
              <p className="text-sm text-gray-400">
                If you don't have a Grok API key, the system will fall back to the environment variable if configured.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
