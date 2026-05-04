'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface AddSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubjectCreated: (subject: any) => void
  userId: string
}

export function AddSubjectModal({ isOpen, onClose, onSubjectCreated, userId }: AddSubjectModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ))

  if (!isOpen) return null

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: name.trim(),
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      onSubjectCreated(data)
      setName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-1">Create New Subject</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Add a new subject to organize your learning materials
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium mb-2">
              Subject Name
            </label>
            <input
              id="subjectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Machine Learning, Calculus II"
              required
              className="w-full px-4 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/[0.08] transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-black/[0.08] rounded-xl text-sm font-medium hover:bg-black/[0.02] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
