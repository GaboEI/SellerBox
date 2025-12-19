'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  if (status === 'loading') {
    // Puedes poner un spinner o un esqueleto de carga aquí
    return <div>{t('loading')}</div>;
  }

  if (status === 'unauthenticated') {
    // Redirige al usuario a la página de login si no está autenticado
    redirect('/login');
  }

  // Si el usuario está autenticado, muestra el contenido de la página
  return <h1>Dashboard OK</h1>;
}