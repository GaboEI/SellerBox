'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  Home,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  BookOpen,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/settings/theme-toggle';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/catalog', label: 'Catalog', icon: Book },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales', icon: ShoppingBag },
  { href: '/listings', label: 'Listing Generator', icon: Tag },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            Librarian's Toolkit
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <ThemeToggle />
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={pathname === '/settings'}
                tooltip="Settings"
            >
                <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
