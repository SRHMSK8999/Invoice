import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  DollarSign,
  BarChart2,
  Settings,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "P&L Report", href: "/reports", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "block" : "hidden"
      )}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-dark-500">
          <div className="flex h-16 items-center px-4 bg-dark-600">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold text-white">InvoiceFlow</h1>
              <button onClick={() => setIsOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-dark-600"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-dark-500">
          <div className="flex items-center h-16 px-4 bg-dark-600">
            <h1 className="text-xl font-bold text-white">InvoiceFlow</h1>
          </div>
          
          <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-2 font-medium rounded-lg bg-primary-600 text-[15px] text-right text-[#373a69] pl-[16px] pr-[16px] pt-[10px] pb-[10px]"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
