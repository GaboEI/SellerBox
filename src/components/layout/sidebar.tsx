'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingBag,
  Tag,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    { href: '/', label: 'dashboard', icon: Home },
    { href: '/inventory', label: 'warehouse', icon: Package },
    { href: '/sales', label: 'sales', icon: ShoppingBag },
    { href: '/listings', label: 'listing_generator', icon: Tag },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <div className="bg-primary rounded-md p-1.5 flex items-center justify-center">
             <BarChart3 className="h-6 w-6 text-primary-foreground" />
           </div>
          <h1 className="text-lg font-semibold text-foreground">
            SellerBox
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={isClient ? t(item.label) : item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{isClient ? t(item.label) : item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        {/* ThemeToggle and Settings link removed from here */}
      </SidebarFooter>
    </Sidebar>
  );
}
