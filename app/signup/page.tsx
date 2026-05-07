"use client";

import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { LanguageToggle } from '@/components/language-toggle';

export default function SignupPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Nexus Learn</h1>
            <p className="text-sm text-neutral-500 mt-1">{t('auth.platformDesc')}</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-neutral-600">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="font-medium text-black hover:underline">
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
