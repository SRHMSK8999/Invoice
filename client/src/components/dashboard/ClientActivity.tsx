import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ClientActivity() {
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Create activity feed from clients and invoices
  const createActivityFeed = () => {
    if (!clients || !invoices) {
      return [];
    }

    const clientMap = new Map();
    clients.forEach((client: any) => {
      clientMap.set(client.id, client);
    });

    // Sort invoices by date (newest first)
    const sortedInvoices = [...invoices].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Take only the 3 most recent activities
    return sortedInvoices.slice(0, 3).map((invoice: any) => {
      const client = clientMap.get(invoice.clientId);
      
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
        clientName: client?.name || "Unknown Client",
        type: invoice.status === "paid" ? "payment" : "invoice",
        amount: invoice.total,
        currency: invoice.currency,
        date: invoice.createdAt || invoice.issueDate,
      };
    });
  };

  const activities = createActivityFeed();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Client Activity</CardTitle>
          <Link href="/clients" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View all clients
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-6 space-y-6">
          {activities.length > 0 ? (
            activities.map((activity: any) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    activity.type === "payment" ? "bg-green-100" : "bg-primary-100"
                  } rounded-full`}>
                    <span className={`${
                      activity.type === "payment" ? "text-green-600" : "text-primary-600"
                    } font-medium text-sm`}>
                      {activity.clientName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    <Link href={`/clients/${activity.clientId}`} className="hover:underline">
                      {activity.clientName}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.type === "payment" ? "Paid invoice " : "New invoice created "}
                    <Link 
                      href={`/invoices/${activity.id}`} 
                      className="font-medium hover:underline"
                    >
                      #{activity.invoiceNumber}
                    </Link> · 
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: activity.currency || "USD",
                    }).format(activity.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No recent client activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
