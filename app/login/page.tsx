import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Nexus Learn</h1>
            <p className="text-sm text-neutral-500 mt-1">AI-powered learning platform</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-black hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
