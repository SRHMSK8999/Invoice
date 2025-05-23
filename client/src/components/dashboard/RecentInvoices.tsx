import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

interface InvoiceProps {
  id: number;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: string;
  issueDate: string;
  currency: string;
}

interface RecentInvoicesProps {
  invoices: InvoiceProps[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          <Link href="/invoices" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden -mx-4">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500">INVOICE</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500">CLIENT</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500">AMOUNT</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500">STATUS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices && invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <Link href={`/invoices/${invoice.id}`} className="hover:text-primary-600">
                            #{invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{invoice.clientName}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <Badge variant="outline" className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        No recent invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
