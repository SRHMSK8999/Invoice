import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

interface RevenueChartProps {
  data: any[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Default sample data for empty states
  const sampleData = [
    { name: 'Jan', revenue: 0, expenses: 0 },
    { name: 'Feb', revenue: 0, expenses: 0 },
    { name: 'Mar', revenue: 0, expenses: 0 },
    { name: 'Apr', revenue: 0, expenses: 0 },
    { name: 'May', revenue: 0, expenses: 0 },
    { name: 'Jun', revenue: 0, expenses: 0 },
  ];
  
  // Safely check if data is an array and process it
  const chartData = Array.isArray(data) && data.length > 0
    ? data.map(item => {
        if (item && item.month) {
          return {
            name: format(new Date(item.month), 'MMM'),
            revenue: parseFloat(item.revenue || 0),
            expenses: parseFloat(item.expenses || 0)
          };
        }
        return item;
      })
    : sampleData;
  
  // No data message with empty chart
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center">
            <div className="text-muted-foreground mb-4">No revenue data available</div>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#60A5FA" />
                <Bar dataKey="expenses" name="Expenses" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display chart with data
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Revenue Overview</CardTitle>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-400 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-secondary-500 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#60A5FA" />
              <Bar dataKey="expenses" name="Expenses" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
