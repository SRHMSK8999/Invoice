import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientList from "@/components/clients/ClientList";
import ClientForm from "@/components/clients/ClientForm";
import { SearchIcon, PlusIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients", search],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client deleted",
        description: "Client has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAddClient = () => {
    setIsAddingClient(true);
    setSelectedClient(null);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsAddingClient(true);
  };

  const handleDeleteClient = (id: number) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsAddingClient(false);
    setSelectedClient(null);
  };

  const handleSaveClient = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    setIsAddingClient(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Button onClick={handleAddClient}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative w-full max-w-md mb-6">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            {search && (
              <XIcon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 cursor-pointer"
                onClick={() => setSearch("")}
              />
            )}
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <ClientList
            clients={clients}
            isLoading={isLoading}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={selectedClient}
            onCancel={handleCloseDialog}
            onSave={handleSaveClient}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
