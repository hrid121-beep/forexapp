import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Brain, Send, Sparkles, Database, Code, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  options?: {
    type: "platform_type" | "account_type" | "server";
    choices: string[];
  };
}

interface SchemaModification {
  id: number;
  modificationType: string;
  tableName: string;
  columnName?: string;
  sqlQuery: string;
  description?: string;
  status: "pending" | "approved" | "executed" | "failed";
}

interface SelfLearningAIChatProps {
  onAccountExtracted?: (data: any) => void;
}

export function SelfLearningAIChat({ onAccountExtracted }: SelfLearningAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your self-learning AI assistant. I can help you:\n\n✨ **Extract forex account data** from any format\n🔧 **Create custom fields** instantly (e.g., \"Add a notes field for admin comments\")\n🗄️ **Modify database schema** with your approval\n📊 **Manage your forex accounts** and data\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [pendingSchema, setPendingSchema] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = trpc.aiChat.sendMessage.useMutation({
    onSuccess: (response) => {
      const content = response.message;
      
      // Parse AI response to detect if it's asking for choices
      let messageOptions: Message["options"] | undefined;
      
      // Detect platform type question
      if (content.toLowerCase().includes("metatrader 4") && content.toLowerCase().includes("metatrader 5")) {
        messageOptions = {
          type: "platform_type",
          choices: ["MetaTrader 4", "MetaTrader 5", "cTrader", "Other"]
        };
      }
      // Detect account type question
      else if (content.toLowerCase().includes("usd") && content.toLowerCase().includes("cent")) {
        messageOptions = {
          type: "account_type",
          choices: ["USD", "Cent", "Standard", "ECN", "Other"]
        };
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content,
          timestamp: new Date(),
          options: messageOptions,
        },
      ]);

      // Check if AI is proposing actions or extracting data
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          
          // Check for account data extraction
          if (data.accounts || data.account_login || data.investor_password) {
            // This is extracted account data
            if (onAccountExtracted) {
              // Handle both single account and array of accounts
              const accountData = data.accounts ? data.accounts[0] : data;
              onAccountExtracted(accountData);
              toast.success("Account data extracted! Check the form above.");
            }
          }
          // Check for custom field creation
          else if (data.action === "create_custom_field") {
            handleCustomFieldCreation(data);
          }
          // Check for schema modification
          else if (data.action === "schema_modification") {
            setPendingSchema(data);
            setShowSchemaDialog(true);
          }
        }
      } catch (e) {
        // Not a structured response, just a regular message
        console.error("Failed to parse AI response:", e);
      }
    },
    onError: (error: any) => {
      // Extract specific error message from backend
      const errorMessage = error?.message || error?.data?.message || "Failed to send message";
      
      // Show specific error in toast
      toast.error(errorMessage);
      
      // Show helpful error message in chat
      let chatErrorMessage = "Sorry, I encountered an error. Please try again.";
      
      if (errorMessage.includes("API key")) {
        chatErrorMessage = `⚠️ **API Key Issue**\n\n${errorMessage}\n\nPlease go to Settings (gear icon in the header) to configure your Grok API key from https://console.x.ai`;
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        chatErrorMessage = "⚠️ **Invalid API Key**\n\nYour Grok API key is invalid. Please update it in Settings.";
      } else if (errorMessage.includes("rate limit")) {
        chatErrorMessage = "⚠️ **Rate Limit Exceeded**\n\nPlease wait a moment and try again.";
      } else {
        chatErrorMessage = `⚠️ **Error**\n\n${errorMessage}`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: chatErrorMessage,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const createCustomField = trpc.customFields.create.useMutation({
    onSuccess: () => {
      toast.success("Custom field created successfully!");
    },
    onError: () => {
      toast.error("Failed to create custom field");
    },
  });

  const createSchemaModification = trpc.schemaModifications.create.useMutation({
    onSuccess: () => {
      toast.success("Schema modification proposed. Review and execute below.");
    },
    onError: () => {
      toast.error("Failed to create schema modification");
    },
  });

  const approveAndExecuteSchema = trpc.schemaModifications.execute.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Schema modification executed successfully!");
        setShowSchemaDialog(false);
        setPendingSchema(null);
      } else {
        toast.error(`Failed to execute: ${result.error}`);
      }
    },
    onError: () => {
      toast.error("Failed to execute schema modification");
    },
  });

  const handleCustomFieldCreation = async (data: any) => {
    try {
      await createCustomField.mutateAsync({
        entityType: data.entity_type,
        entityId: 0, // Will be set when actually used
        fieldName: data.field_name,
        fieldType: data.field_type || "text",
        fieldValue: "",
      });
    } catch (error) {
      console.error("Failed to create custom field:", error);
    }
  };

  const handleSchemaApproval = async () => {
    if (!pendingSchema) return;

    try {
      // First create the modification record
      const modId = await createSchemaModification.mutateAsync({
        modificationType: pendingSchema.modification_type,
        tableName: pendingSchema.table_name,
        columnName: pendingSchema.column_name,
        sqlQuery: pendingSchema.sql_query,
        description: pendingSchema.description,
      });

      // Then approve and execute it
      // Note: In production, you might want a separate approval step
      // For now, we'll execute immediately after admin confirms
      // await approveAndExecuteSchema.mutateAsync({ id: modId });
      
      toast.info("Schema modification saved. You can execute it from the Schema Management panel.");
      setShowSchemaDialog(false);
      setPendingSchema(null);
    } catch (error) {
      console.error("Failed to handle schema modification:", error);
    }
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    sendMessage.mutate({
      message: textToSend,
      collectionId,
    });
  };

  const handleOptionClick = (option: string) => {
    handleSendMessage(option);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    // ScrollArea uses a viewport div, we need to scroll that
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Self-Learning AI Assistant</h3>
          <p className="text-xs text-gray-400">Powered by Grok with Memory</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                      : "bg-white/5 text-white"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Streamdown>{message.content.replace(/```json[\s\S]*?```/g, '')}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  {message.timestamp && (
                    <p className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Interactive Selection Buttons */}
              {message.options && message.role === "assistant" && (
                <div className="flex justify-start mt-3">
                  <div className="max-w-[80%] space-y-2">
                    <p className="text-xs text-gray-400 mb-2 px-1">Quick Selection:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.options.choices.map((choice, choiceIndex) => (
                        <Button
                          key={choiceIndex}
                          onClick={() => handleOptionClick(choice)}
                          disabled={sendMessage.isPending}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm px-4 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                        >
                          {choice}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse text-cyan-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything or paste account data..."
            className="flex-1 bg-white/5 border-white/10 text-white"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || sendMessage.isPending}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInput("Add a notes field for admin-only comments on each account")}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            💡 Add custom field
          </button>
          <button
            onClick={() => setInput("Show me all accounts with their custom fields")}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            📊 View data
          </button>
          <button
            onClick={() => setInput("Add a risk_level column to forex_accounts table")}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            🗄️ Modify schema
          </button>
        </div>
      </div>

      {/* Schema Modification Dialog */}
      <Dialog open={showSchemaDialog} onOpenChange={setShowSchemaDialog}>
        <DialogContent className="bg-[#1a2332] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Schema Modification Proposal
            </DialogTitle>
          </DialogHeader>
          
          {pendingSchema && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Description:</h4>
                <p className="text-sm text-gray-400">{pendingSchema.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">SQL Query:</h4>
                <Card className="bg-black/50 p-4 border-white/10">
                  <code className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {pendingSchema.sql_query}
                  </code>
                </Card>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">Warning:</p>
                    <p>This will modify your database schema. Make sure you understand the changes before proceeding. This action cannot be easily undone.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSchemaDialog(false);
                setPendingSchema(null);
              }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSchemaApproval}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={createSchemaModification.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
