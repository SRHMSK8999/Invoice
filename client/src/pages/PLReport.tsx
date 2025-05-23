import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function PLReport() {
  const [period, setPeriod] = useState("monthly");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");

  const { data: businesses } = useQuery({
    queryKey: ["/api/businesses"],
  });

  const { data: invoices } = useQuery({
    queryKey: [
      "/api/invoices",
      "paid",
      selectedBusiness !== "all" ? selectedBusiness : undefined,
      dateRange.from,
      dateRange.to,
    ],
  });

  const { data: expenses } = useQuery({
    queryKey: [
      "/api/expenses",
      selectedBusiness !== "all" ? selectedBusiness : undefined,
      dateRange.from,
      dateRange.to,
    ],
  });

  // Calculate summary
  const totalIncome = invoices?.reduce((acc: number, invoice: any) => acc + invoice.total, 0) || 0;
  const totalExpenses = expenses?.reduce((acc: number, expense: any) => acc + expense.amount, 0) || 0;
  const netProfit = totalIncome - totalExpenses;

  // Prepare monthly data
  const monthlyData = [
    { name: "Jan", income: 5000, expenses: 3000 },
    { name: "Feb", income: 7000, expenses: 3500 },
    { name: "Mar", income: 6000, expenses: 3200 },
    { name: "Apr", income: 8500, expenses: 4000 },
    { name: "May", income: 9000, expenses: 4200 },
    { name: "Jun", income: 7500, expenses: 3800 },
  ];

  // Prepare category data for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
  
  const expenseCategoryData = [
    { name: "Office Rent", value: 2500 },
    { name: "Utilities", value: 800 },
    { name: "Software", value: 1200 },
    { name: "Marketing", value: 1500 },
    { name: "Travel", value: 900 },
    { name: "Misc", value: 600 },
  ];
  
  const incomeCategoryData = [
    { name: "Web Development", value: 12000 },
    { name: "Design", value: 8000 },
    { name: "Consulting", value: 6000 },
    { name: "Maintenance", value: 4000 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Profit & Loss Report</h1>
        <p className="text-muted-foreground">Analyze your business performance with P&L reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <Tabs defaultValue="monthly" onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-wrap gap-2">
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#3B82F6" />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 border-b">Category</th>
                  <th className="text-right p-3 border-b">Amount</th>
                  <th className="text-right p-3 border-b">%</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium">
                  <td className="p-3 border-b">Income</td>
                  <td className="text-right p-3 border-b">${totalIncome.toLocaleString()}</td>
                  <td className="text-right p-3 border-b">100%</td>
                </tr>
                {incomeCategoryData.map((item, index) => (
                  <tr key={index} className="text-muted-foreground">
                    <td className="pl-8 p-3 border-b">{item.name}</td>
                    <td className="text-right p-3 border-b">${item.value.toLocaleString()}</td>
                    <td className="text-right p-3 border-b">
                      {totalIncome ? `${((item.value / totalIncome) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td className="p-3 border-b">Expenses</td>
                  <td className="text-right p-3 border-b">${totalExpenses.toLocaleString()}</td>
                  <td className="text-right p-3 border-b">
                    {totalIncome ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                {expenseCategoryData.map((item, index) => (
                  <tr key={index} className="text-muted-foreground">
                    <td className="pl-8 p-3 border-b">{item.name}</td>
                    <td className="text-right p-3 border-b">${item.value.toLocaleString()}</td>
                    <td className="text-right p-3 border-b">
                      {totalIncome ? `${((item.value / totalIncome) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-muted">
                  <td className="p-3">Net Profit</td>
                  <td className={`text-right p-3 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netProfit.toLocaleString()}
                  </td>
                  <td className={`text-right p-3 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalIncome ? `${((netProfit / totalIncome) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
