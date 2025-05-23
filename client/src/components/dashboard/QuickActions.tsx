import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Users, Package, DollarSign } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Create Invoice",
      description: "Generate new invoices",
      icon: <FileText className="w-6 h-6" />,
      iconColor: "text-primary-600 bg-primary-100",
      href: "/invoices/new",
    },
    {
      title: "Add Client",
      description: "Create new client profile",
      icon: <Users className="w-6 h-6" />,
      iconColor: "text-green-600 bg-green-100",
      href: "/clients",
    },
    {
      title: "Add Product",
      description: "Create new product/service",
      icon: <Package className="w-6 h-6" />,
      iconColor: "text-purple-600 bg-purple-100",
      href: "/products",
    },
    {
      title: "Record Expense",
      description: "Add new business expense",
      icon: <DollarSign className="w-6 h-6" />,
      iconColor: "text-yellow-600 bg-yellow-100",
      href: "/expenses",
    },
  ];

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-2 rounded-md ${action.iconColor}`}>
                    {action.icon}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
