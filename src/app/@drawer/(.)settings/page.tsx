'use client';

import { RightDrawerShell } from '@/components/layout/right-drawer-shell';
import { SettingsContent } from '@/app/settings/page';
import { useTranslation } from 'react-i18next';

export default function SettingsDrawerPage() {
  const { t } = useTranslation();
  return (
    <RightDrawerShell title={t('settings')} parentHref="/dashboard">
      <SettingsContent />
    </RightDrawerShell>
  );
}
