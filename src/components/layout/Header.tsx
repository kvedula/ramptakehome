'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/lib/hooks/useRampApi';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Settings, 
  User, 
  Search,
  CreditCard,
  LogOut,
  BarChart3,
  Receipt,
  Home
} from 'lucide-react';

export function Header() {
  const { data: business, error } = useBusiness();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-foreground">Ramp Dashboard</span>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Demo
          </Badge>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => router.push('/transactions')}
            >
              <Receipt className="h-4 w-4" />
              Transactions
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => router.push('/spending')}
            >
              <BarChart3 className="h-4 w-4" />
              Spending by Person
            </Button>
          </nav>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions, merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="h-6 w-px bg-border mx-2"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">Ramp Admin</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
