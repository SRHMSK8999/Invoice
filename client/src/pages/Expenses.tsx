import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { SearchIcon, PlusIcon, XIcon, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery({
    queryKey: [
      "/api/expenses",
      selectedCategory !== "all" ? selectedCategory : undefined,
      selectedBusiness !== "all" ? selectedBusiness : undefined,
      dateRange.from,
      dateRange.to,
    ],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Expense deleted",
        description: "Expense has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAddExpense = () => {
    setIsAddingExpense(true);
    setSelectedExpense(null);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setIsAddingExpense(true);
  };

  const handleDeleteExpense = (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsAddingExpense(false);
    setSelectedExpense(null);
  };

  const handleSaveExpense = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    setIsAddingExpense(false);
    setSelectedExpense(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Button onClick={handleAddExpense}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              {search && (
                <XIcon
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 cursor-pointer"
                  onClick={() => setSearch("")}
                />
              )}
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedBusiness}
                onValueChange={setSelectedBusiness}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {businesses?.map((business: any) => (
                    <SelectItem key={business.id} value={business.id.toString()}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={selectedExpense}
            categories={categories || []}
            businesses={businesses || []}
            onCancel={handleCloseDialog}
            onSave={handleSaveExpense}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
