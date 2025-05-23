import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  Send,
  AlertTriangle,
} from "lucide-react";
import { generatePDF } from "@/lib/pdf";

interface InvoiceListProps {
  invoices: any[] | undefined;
  isLoading: boolean;
}

export default function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
  const { toast } = useToast();
  const [generatingPDF, setGeneratingPDF] = useState<Record<number, boolean>>({});

  // Get clients and businesses for display
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  // Get client and business name
  const getClientName = (clientId: number) => {
    const client = clients?.find((c: any) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const getBusinessName = (businessId: number) => {
    const business = businesses?.find((b: any) => b.id === businessId);
    return business ? business.name : "Unknown Business";
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="outline" className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "Invoice has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate PDF
  const handleGeneratePDF = async (invoice: any) => {
    try {
      setGeneratingPDF(prev => ({ ...prev, [invoice.id]: true }));
      
      // Fetch additional data needed for the PDF
      const business = businesses?.find((b: any) => b.id === invoice.businessId);
      const client = clients?.find((c: any) => c.id === invoice.clientId);
      
      if (!business || !client) {
        throw new Error("Business or client information is missing");
      }
      
      // Generate PDF
      await generatePDF({
        invoice: {
          ...invoice,
          business,
          client,
        },
      });
      
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(prev => ({ ...prev, [invoice.id]: false }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Empty state
  if (!invoices || invoices.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
          <p className="text-gray-500 mb-4">Start creating invoices to see them here.</p>
          <Link href="/invoices/new">
            <Button>Create New Invoice</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="text-primary-600 hover:underline"
                >
                  #{invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{getClientName(invoice.clientId)}</TableCell>
              <TableCell>{getBusinessName(invoice.businessId)}</TableCell>
              <TableCell>
                {format(new Date(invoice.issueDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(invoice.dueDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: invoice.currency || "USD",
                }).format(invoice.total)}
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGeneratePDF(invoice)}
                      disabled={generatingPDF[invoice.id]}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {generatingPDF[invoice.id] ? "Generating..." : "Download PDF"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete invoice #{invoice.invoiceNumber}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
