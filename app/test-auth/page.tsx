'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [serverCookies, setServerCookies] = useState<any>(null)
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ))

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    checkSession()

    // Check server-side cookies
    fetch('/api/debug/cookies')
      .then(res => res.json())
      .then(data => {
        setServerCookies(data)
      })
      .catch(err => console.error('Error fetching server cookies:', err))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    })
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Signed in! Check console for details')
      setTimeout(() => window.location.reload(), 500)
    }
  }

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    })
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Signed up! Check console for details. Note: Email confirmation may be required.')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleConfirmEmail = async () => {
    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const data = await response.json()
      if (response.ok) {
        alert('Email confirmed! Now you can sign in.')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="font-semibold mb-2">Session Status</h2>
            <p>Has Session: <strong>{session ? 'Yes' : 'No'}</strong></p>
            {session?.user && (
              <>
                <p>User ID: <code>{session.user.id}</code></p>
                <p>Email: <code>{session.user.email}</code></p>
                <p>Email Confirmed: <strong>{session.user.email_confirmed_at ? 'Yes' : 'No'}</strong></p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Sign Up (test@example.com)
            </button>
            <button
              onClick={handleConfirmEmail}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Confirm Email (test@example.com)
            </button>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In (test@example.com)
            </button>
            {session && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            )}
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">Cookies in Browser</h3>
            <p>Open DevTools &gt; Application &gt; Cookies to check for sb-*</p>
          </div>

          {serverCookies && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Server Cookies (API Response)</h3>
              <p>Total Cookies: {serverCookies.totalCookies}</p>
              <p>Auth Cookies: {serverCookies.authCookies?.length || 0}</p>
              {serverCookies.authCookies && serverCookies.authCookies.length > 0 && (
                <ul className="mt-2 text-sm space-y-1">
                  {serverCookies.authCookies.map((c: any, i: number) => (
                    <li key={i}>
                      <code>{c.name}</code>: {c.exists ? 'exists' : 'empty'}
                    </li>
                  ))}
                </ul>
              )}
              {serverCookies.allCookieNames && (
                <div className="mt-2">
                  <p className="font-semibold text-xs">All Cookie Names:</p>
                  <code className="text-xs break-all">{serverCookies.allCookieNames.join(', ')}</code>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
