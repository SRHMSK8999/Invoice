import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BusinessList from "@/components/settings/BusinessList";
import BusinessForm from "@/components/settings/BusinessForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("business");
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const { toast } = useToast();

  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  const { data: invoiceTemplates } = useQuery({
    queryKey: ["/api/invoice-templates"],
  });

  const handleAddBusiness = () => {
    setIsAddingBusiness(true);
    setSelectedBusiness(null);
  };

  const handleEditBusiness = (business: any) => {
    setSelectedBusiness(business);
    setIsAddingBusiness(true);
  };

  const handleCloseDialog = () => {
    setIsAddingBusiness(false);
    setSelectedBusiness(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="business" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">Business Profiles</TabsTrigger>
          <TabsTrigger value="templates">Invoice Templates</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Business Profiles</h2>
            <Button onClick={handleAddBusiness}>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Business
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <BusinessList businesses={businesses || []} onEdit={handleEditBusiness} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>
                Select and customize your invoice templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Default Template
                  </label>
                  <Select defaultValue="1">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceTemplates?.map((template: any) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {invoiceTemplates?.map((template: any) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                      <div className="aspect-[8.5/11] bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <span className="text-sm text-gray-500">Template Preview</span>
                      </div>
                      <div className="text-sm font-medium">{template.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details and profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xl font-bold text-primary">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {user?.firstName && user?.lastName ? 
                        `${user.firstName} ${user.lastName}` : 
                        user?.email || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <p className="text-sm text-muted-foreground">
                    Account management is handled through Replit authentication.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a href="/api/logout">Sign Out</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Default Currency
                  </label>
                  <Select defaultValue="USD">
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Date Format
                  </label>
                  <Select defaultValue="MM/DD/YYYY">
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddingBusiness} onOpenChange={setIsAddingBusiness}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedBusiness ? "Edit Business" : "Add New Business"}</DialogTitle>
          </DialogHeader>
          <BusinessForm
            business={selectedBusiness}
            onCancel={handleCloseDialog}
            onSave={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
