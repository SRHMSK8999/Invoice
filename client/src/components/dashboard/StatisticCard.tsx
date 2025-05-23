import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface StatisticCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconColor: string;
  isNegative?: boolean;
  isCurrency?: boolean;
}

export default function StatisticCard({
  title,
  value,
  change,
  icon,
  iconColor,
  isNegative = false,
  isCurrency = false
}: StatisticCardProps) {
  // Format the value as currency if needed
  const formattedValue = isCurrency 
    ? formatCurrency(value) 
    : value.toLocaleString();

  // Determine the change color and icon
  const changeColor = isNegative ? "text-red-500" : "text-green-500";
  const changePrefix = isNegative ? "↑" : "↑";

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 text-white rounded-md", iconColor)}>
            {icon}
          </div>
          <div className="flex-1 w-0 ml-5">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{formattedValue}</div>
                <div className="flex items-baseline text-sm">
                  <span className={changeColor}>{changePrefix} {change}%</span>
                  <span className="ml-2 text-gray-500">from last month</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
