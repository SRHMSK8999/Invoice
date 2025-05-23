import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from "@shared/schema";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: User | undefined | null;
}

export default function Header({ sidebarOpen, setSidebarOpen, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative z-10 flex shrink-0 h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 text-gray-500 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex justify-between flex-1 px-4">
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <Input
                className="block w-full h-full py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center ml-4 md:ml-6">
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <div className="relative ml-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 p-0">
                  <span className="sr-only">Open user menu</span>
                  {user?.profileImageUrl ? (
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={user.profileImageUrl}
                      alt="User profile"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium uppercase">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings">Account Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/logout">Sign out</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
