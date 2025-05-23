import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Dashboard Components
import StatisticCard from "@/components/dashboard/StatisticCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import BusinessOverview from "@/components/dashboard/BusinessOverview";
import ClientActivity from "@/components/dashboard/ClientActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  return (
    <div className="py-6">
      {/* Dashboard Header */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex mt-4 space-x-3 md:mt-0">
            <div>
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 3 Months</SelectItem>
                  <SelectItem value="180">Last 6 Months</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href="/invoices/new">
              <Button>
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 md:px-8">
        {/* Statistic Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatisticCard
            title="Total Invoices"
            value={dashboardData?.totalInvoices || 0}
            change={8.2}
            icon={
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            }
            iconColor="bg-primary-500"
          />
          <StatisticCard
            title="Total Revenue"
            value={dashboardData?.totalRevenue || 0}
            isCurrency={true}
            change={12.4}
            icon={
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="bg-green-500"
          />
          <StatisticCard
            title="Unpaid Invoices"
            value={dashboardData?.unpaidAmount || 0}
            isCurrency={true}
            change={3.5}
            isNegative={true}
            icon={
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            iconColor="bg-red-500"
          />
          <StatisticCard
            title="Active Clients"
            value={dashboardData?.activeClients || 0}
            change={5.8}
            icon={
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconColor="bg-gray-500"
          />
        </div>

        {/* Revenue Chart and Recent Invoices */}
        <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-2">
          <RevenueChart data={dashboardData?.monthlyRevenue || []} />
          <RecentInvoices invoices={dashboardData?.recentInvoices || []} />
        </div>

        {/* Business Overview and Client Activity */}
        <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-2">
          <BusinessOverview />
          <ClientActivity />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}
