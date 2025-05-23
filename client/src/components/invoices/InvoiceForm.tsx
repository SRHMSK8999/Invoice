import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import InvoiceTemplates from "./InvoiceTemplates";
import { generatePDF } from "@/lib/pdf";
import { CalendarIcon, PlusIcon, Trash2Icon, ArrowLeftIcon, SaveIcon, DownloadIcon, SendIcon } from "lucide-react";

// Define the form schema
const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  businessId: z.string().min(1, "Business is required"),
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.date({ required_error: "Issue date is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  currency: z.string().default("USD"),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  templateId: z.number().default(1),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unitPrice: z.number().min(0, "Unit price must be non-negative"),
      amount: z.number().min(0, "Amount must be non-negative"),
    })
  ).min(1, "At least one item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoiceId?: number;
}

export default function InvoiceForm({ invoiceId }: InvoiceFormProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get all necessary data
  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products", true],
  });

  // If editing, get the invoice data
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      businessId: "",
      clientId: "",
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
      currency: "USD",
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: "",
      status: "draft",
      templateId: 1,
      items: [
        {
          id: uuidv4(),
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Pre-fill form with invoice data if editing
  useEffect(() => {
    if (invoiceData && invoiceId) {
      const invoice = invoiceData.invoice;
      const items = invoiceData.items.map((item: any) => ({
        id: uuidv4(),
        productId: item.productId?.toString() || "",
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      }));

      form.reset({
        invoiceNumber: invoice.invoiceNumber,
        businessId: invoice.businessId.toString(),
        clientId: invoice.clientId.toString(),
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discount: invoice.discount,
        total: invoice.total,
        notes: invoice.notes || "",
        status: invoice.status,
        templateId: invoice.templateId,
        items,
      });
    }
  }, [invoiceData, invoiceId, form]);

  // Calculate totals whenever items change
  useEffect(() => {
    const values = form.getValues();
    const items = values.items || [];
    
    let subtotal = 0;
    items.forEach((item) => {
      const amount = item.quantity * item.unitPrice;
      form.setValue(`items.${items.indexOf(item)}.amount`, parseFloat(amount.toFixed(2)));
      subtotal += amount;
    });
    
    const taxAmount = (subtotal * values.taxRate) / 100;
    const total = subtotal + taxAmount - values.discount;
    
    form.setValue("subtotal", parseFloat(subtotal.toFixed(2)));
    form.setValue("taxAmount", parseFloat(taxAmount.toFixed(2)));
    form.setValue("total", parseFloat(total.toFixed(2)));
  }, [form.watch("items"), form.watch("taxRate"), form.watch("discount")]);

  // Add a new item row
  const addItem = () => {
    append({
      id: uuidv4(),
      productId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    });
  };

  // Handle product selection
  const handleProductSelection = (productId: string, index: number) => {
    if (productId && products) {
      const product = products.find((p: any) => p.id.toString() === productId);
      if (product) {
        form.setValue(`items.${index}.description`, product.name);
        form.setValue(`items.${index}.unitPrice`, product.price);
        form.setValue(`items.${index}.amount`, product.price * form.getValues(`items.${index}.quantity`));
      }
    }
  };

  // Mutation for creating/updating invoice
  const invoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      // Format the data for the API
      const formattedData = {
        ...data,
        businessId: parseInt(data.businessId),
        clientId: parseInt(data.clientId),
        // Keep dates as Date objects for the API
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          productId: item.productId ? parseInt(item.productId) : undefined,
        })),
      };

      if (invoiceId) {
        // Update existing invoice
        await apiRequest("PUT", `/api/invoices/${invoiceId}`, formattedData);
        return invoiceId;
      } else {
        // Create new invoice
        const response = await apiRequest("POST", "/api/invoices", formattedData);
        return response.invoice.id;
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: invoiceId ? "Invoice updated" : "Invoice created",
        description: invoiceId
          ? "Invoice has been successfully updated."
          : "Invoice has been successfully created.",
      });
      navigate(`/invoices/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${invoiceId ? "update" : "create"} invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating invoice status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PUT", `/api/invoices/${invoiceId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      toast({
        title: "Status updated",
        description: "Invoice status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit form
  const onSubmit = (data: InvoiceFormValues) => {
    invoiceMutation.mutate(data);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const values = form.getValues();
      
      // Fetch additional data needed for the PDF
      const business = businesses?.find((b: any) => b.id.toString() === values.businessId);
      const client = clients?.find((c: any) => c.id.toString() === values.clientId);
      
      if (!business || !client) {
        throw new Error("Business or client information is missing");
      }
      
      // Generate PDF
      await generatePDF({
        invoice: {
          ...values,
          id: invoiceId || 0,
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
      setIsGeneratingPDF(false);
    }
  };

  if (isLoadingInvoice && invoiceId) {
    return (
      <div className="p-8 flex justify-center">
        <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/invoices")}
            className="mr-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">
            {invoiceId ? "Edit Invoice" : "Create New Invoice"}
          </h1>
        </div>
        <div className="flex gap-2">
          {invoiceId && (
            <>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
              
              <Select
                defaultValue={form.getValues("status")}
                onValueChange={(value) => updateStatusMutation.mutate(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Invoice Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Invoice Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-full pl-3 text-left font-normal"
                                }
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-full pl-3 text-left font-normal"
                                }
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Additional information or payment instructions" 
                            className="h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business and Client Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Business & Client</h2>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="businessId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Business</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your business" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businesses?.map((business: any) => (
                              <SelectItem 
                                key={business.id} 
                                value={business.id.toString()}
                              >
                                {business.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client: any) => (
                              <SelectItem 
                                key={client.id} 
                                value={client.id.toString()}
                              >
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Template</FormLabel>
                        <InvoiceTemplates 
                          selectedTemplate={field.value} 
                          onSelectTemplate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Items & Services</h2>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleProductSelection(value, index);
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">Custom Item</SelectItem>
                                    {products?.map((product: any) => (
                                      <SelectItem 
                                        key={product.id} 
                                        value={product.id.toString()}
                                      >
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="w-20 text-right"
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      field.onChange(isNaN(value) ? 0 : value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-24 text-right"
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      field.onChange(isNaN(value) ? 0 : value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <FormField
                            control={form.control}
                            name={`items.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled
                                    type="number"
                                    className="w-24 text-right"
                                    value={field.value.toFixed(2)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (fields.length > 1) {
                                remove(index);
                              }
                            }}
                            disabled={fields.length <= 1}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-6 flex flex-col items-end">
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: form.getValues("currency") || "USD",
                      }).format(form.getValues("subtotal"))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Tax Rate:</span>
                    <div className="flex items-center">
                      <Controller
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 text-right"
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                          />
                        )}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Tax Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: form.getValues("currency") || "USD",
                      }).format(form.getValues("taxAmount"))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Discount:</span>
                    <Controller
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-32 text-right"
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex justify-between border-t py-2 font-medium">
                    <span>Total:</span>
                    <span className="text-lg">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: form.getValues("currency") || "USD",
                      }).format(form.getValues("total"))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/invoices")}
            >
              Cancel
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="default">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {invoiceId ? "Update" : "Save"} Invoice
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm {invoiceId ? "Update" : "Save"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to {invoiceId ? "update" : "save"} this invoice?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                    {invoiceId ? "Update" : "Save"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>
    </div>
  );
}
