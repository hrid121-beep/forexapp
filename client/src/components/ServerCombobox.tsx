import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ServerComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ServerCombobox({ value, onChange, placeholder = "Select server..." }: ServerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: servers = [], refetch } = trpc.servers.list.useQuery();
  const createServer = trpc.servers.create.useMutation({
    onSuccess: () => {
      toast.success("Server added successfully!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to add server");
    },
  });

  // Get unique server names from forex accounts
  const { data: accounts = [] } = trpc.forexAccounts.list.useQuery();
  const accountServers = Array.from(
    new Set(
      accounts
        .map((acc: any) => acc.platformNameServer)
        .filter((s: string) => s && s.trim() !== "")
    )
  ).sort();

  // Combine servers from both sources
  const allServers = Array.from(
    new Set([
      ...servers.map((s: any) => s.name),
      ...accountServers,
    ])
  ).sort();

  const handleAddNew = async () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a server name");
      return;
    }

    // Check if server already exists
    if (allServers.some(s => s.toLowerCase() === searchValue.toLowerCase())) {
      onChange(searchValue);
      setOpen(false);
      return;
    }

    // Add new server
    try {
      await createServer.mutateAsync({ name: searchValue.trim() });
      onChange(searchValue.trim());
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create server:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-900 border-white/10" align="start">
        <Command className="bg-gray-900">
          <CommandInput
            placeholder="Search or type new server..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400 mb-3">No server found</p>
                <Button
                  size="sm"
                  onClick={handleAddNew}
                  disabled={!searchValue.trim() || createServer.isPending}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add "{searchValue}"
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {allServers.map((server) => (
                <CommandItem
                  key={server}
                  value={server}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === server ? "opacity-100 text-cyan-400" : "opacity-0"
                    )}
                  />
                  {server}
                </CommandItem>
              ))}
            </CommandGroup>
            {searchValue && !allServers.some(s => s.toLowerCase() === searchValue.toLowerCase()) && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNew}
                  className="text-cyan-400 hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add "{searchValue}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
