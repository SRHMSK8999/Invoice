import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";

interface ClientListProps {
  clients: any[] | undefined;
  isLoading: boolean;
  onEdit: (client: any) => void;
  onDelete: (id: number) => void;
}

export default function ClientList({ clients, isLoading, onEdit, onDelete }: ClientListProps) {
  const [expandedClient, setExpandedClient] = useState<number | null>(null);

  const toggleClientExpand = (id: number) => {
    setExpandedClient(expandedClient === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
        <p className="text-gray-500 mb-4">Add your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Tax Number</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => toggleClientExpand(client.id)}
            >
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                {client.email ? (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {client.email}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Not provided</span>
                )}
              </TableCell>
              <TableCell>
                {client.phone ? (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {client.phone}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Not provided</span>
                )}
              </TableCell>
              <TableCell>
                {client.taxNumber ? (
                  client.taxNumber
                ) : (
                  <span className="text-muted-foreground text-sm">Not provided</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit(client);
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(client.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
