'use client';

import { RightDrawerShell } from '@/components/layout/right-drawer-shell';
import { EditSaleContent } from '@/app/sales/edit/[id]/page';
import { useTranslation } from 'react-i18next';

export default function SalesEditDrawerPage() {
  const { t } = useTranslation();
  return (
    <RightDrawerShell title={t('edit_sale')} parentHref="/sales">
      <EditSaleContent />
    </RightDrawerShell>
  );
}
