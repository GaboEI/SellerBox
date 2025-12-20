'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingBag,
  Tag,
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
        <Link href="/" className="flex items-end p-2">
          <div className="rounded-xl bg-primary/10 p-1.5 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
            <img
              src="/sellerbox_logo.png"
              alt="SellerBox"
              className="h-10 w-auto"
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={isClient ? t(item.label) : ''}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{isClient ? t(item.label) : ''}</span>
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
