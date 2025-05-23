import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { currencies } from "@/lib/currency";

// Define the form schema
const expenseSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be non-negative"),
  currency: z.string().default("USD"),
  description: z.string().min(1, "Description is required"),
  date: z.date({ required_error: "Date is required" }),
  categoryId: z.string().optional().or(z.literal("")),
  businessId: z.string().optional().or(z.literal("")),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: any;
  categories: any[];
  businesses: any[];
  onCancel: () => void;
  onSave: () => void;
}

export default function ExpenseForm({
  expense,
  categories,
  businesses,
  onCancel,
  onSave,
}: ExpenseFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount || 0,
      currency: expense?.currency || "USD",
      description: expense?.description || "",
      date: expense?.date ? new Date(expense.date) : new Date(),
      categoryId: expense?.categoryId ? expense.categoryId.toString() : "",
      businessId: expense?.businessId ? expense.businessId.toString() : "",
    },
  });

  const expenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // Format data
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        businessId: data.businessId ? parseInt(data.businessId) : null,
      };
      
      if (expense) {
        await apiRequest("PUT", `/api/expenses/${expense.id}`, formattedData);
      } else {
        await apiRequest("POST", "/api/expenses", formattedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: expense ? "Expense updated" : "Expense created",
        description: expense
          ? "Expense has been successfully updated."
          : "Expense has been successfully recorded.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${expense ? "update" : "create"} expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    expenseMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
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
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What was this expense for?"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={"w-full pl-3 text-left font-normal"}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
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
            name="businessId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Business</SelectItem>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id.toString()}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={expenseMutation.isPending}>
            {expenseMutation.isPending ? "Saving..." : expense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
