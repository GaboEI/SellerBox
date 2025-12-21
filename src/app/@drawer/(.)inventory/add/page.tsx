'use client';

import { RightDrawerShell } from '@/components/layout/right-drawer-shell';
import { AddBookContent } from '@/app/inventory/add/page';
import { useTranslation } from 'react-i18next';

export default function InventoryAddDrawerPage() {
  const { t } = useTranslation();
  return (
    <RightDrawerShell title={t('add_new_book')} parentHref="/inventory">
      <AddBookContent />
    </RightDrawerShell>
  );
}
