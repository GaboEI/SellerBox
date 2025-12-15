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
  BarChart3
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
import { useI18n } from '@/components/i18n/i18n-provider';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const menuItems = [
    { href: '/', label: t('dashboard'), icon: Home },
    { href: '/catalog', label: t('catalog'), icon: Book },
    { href: '/inventory', label: t('inventory'), icon: Package },
    { href: '/sales', label: t('sales'), icon: ShoppingBag },
    { href: '/listings', label: t('listing_generator'), icon: Tag },
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
                tooltip={t('settings')}
            >
                <Link href="/settings">
                    <Settings />
                    <span>{t('settings')}</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
