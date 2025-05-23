import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { PlusIcon, SearchIcon } from "lucide-react";

export default function Invoices() {
  const [location, setLocation] = useLocation();
  const isCreating = location.includes("/new");
  const isViewing = location.match(/\/invoices\/\d+$/);
  const invoiceId = isViewing ? parseInt(location.split("/").pop() || "0") : null;
  
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
    client: "all",
    business: "all",
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices", filter.status !== "all" ? filter.status : undefined],
  });
  
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  // Handle tab view (all, paid, pending, overdue)
  const handleTabChange = (status: string) => {
    setFilter({ ...filter, status });
  };

  // Handle search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  if (isCreating) {
    return <InvoiceForm />;
  }

  if (isViewing && invoiceId) {
    return <InvoiceForm invoiceId={invoiceId} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/invoices/new">
          <Button>
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full lg:w-80">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={filter.search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filter.client}
                onValueChange={(value) => setFilter({ ...filter, client: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filter.business}
                onValueChange={(value) => setFilter({ ...filter, business: value })}
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
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="sent">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InvoiceList invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="paid">
              <InvoiceList invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="draft">
              <InvoiceList invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="sent">
              <InvoiceList invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="overdue">
              <InvoiceList invoices={invoices} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
