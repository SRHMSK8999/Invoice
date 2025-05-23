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
import { format } from "date-fns";
import { Pencil, Trash2, MoreHorizontal, Receipt } from "lucide-react";

interface ExpenseListProps {
  expenses: any[] | undefined;
  isLoading: boolean;
  onEdit: (expense: any) => void;
  onDelete: (id: number) => void;
}

export default function ExpenseList({
  expenses,
  isLoading,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[40px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="flex flex-col items-center justify-center">
          <Receipt className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
          <p className="text-gray-500 mb-4">Add your first expense to track your spending.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {format(new Date(expense.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {expense.description}
              </TableCell>
              <TableCell>
                {expense.categoryName ? (
                  <Badge variant="outline">{expense.categoryName}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Uncategorized</span>
                )}
              </TableCell>
              <TableCell>
                {expense.businessName ? (
                  expense.businessName
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(expense.amount, expense.currency)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(expense)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(expense.id)}
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
