'use client';

import { RightDrawerShell } from '@/components/layout/right-drawer-shell';
import { AddSaleContent } from '@/app/sales/add/page';
import { useTranslation } from 'react-i18next';

export default function SalesAddDrawerPage() {
  const { t } = useTranslation();
  return (
    <RightDrawerShell title={t('record_new_sale')} parentHref="/sales">
      <AddSaleContent />
    </RightDrawerShell>
  );
}
