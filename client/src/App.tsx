import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Clients from "@/pages/Clients";
import Products from "@/pages/Products";
import Expenses from "@/pages/Expenses";
import PLReport from "@/pages/PLReport";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

// Layout
import DashboardLayout from "@/components/layout/DashboardLayout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            {() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/invoices">
            {() => (
              <DashboardLayout>
                <Invoices />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/invoices/new">
            {() => (
              <DashboardLayout>
                <Invoices />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/invoices/:id">
            {() => (
              <DashboardLayout>
                <Invoices />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/clients">
            {() => (
              <DashboardLayout>
                <Clients />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/products">
            {() => (
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/expenses">
            {() => (
              <DashboardLayout>
                <Expenses />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/reports">
            {() => (
              <DashboardLayout>
                <PLReport />
              </DashboardLayout>
            )}
          </Route>
          <Route path="/settings">
            {() => (
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
