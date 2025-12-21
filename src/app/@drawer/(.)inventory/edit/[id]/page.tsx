'use client';

import { RightDrawerShell } from '@/components/layout/right-drawer-shell';
import { EditBookContent } from '@/app/inventory/edit/[id]/page';
import { useTranslation } from 'react-i18next';

export default function InventoryEditDrawerPage() {
  const { t } = useTranslation();
  return (
    <RightDrawerShell title={t('edit_book')} parentHref="/inventory">
      <EditBookContent />
    </RightDrawerShell>
  );
}
