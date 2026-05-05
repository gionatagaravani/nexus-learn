'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuth } from './auth-provider'

interface EditSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubjectUpdated: (subject: any) => void
  subject: {
    id: string
    name: string
    icon: string | null
  }
}

const EMOJI_LIST = ['📚', '💻', '🧬', '📐', '🌍', '🎨', '🎵', '⚽', '🔬', '💡', '🧠', '💼', '🚀', '📊', '📈', '📋', '📝', '✏️', '🏆', '🧩']

export function EditSubjectModal({ isOpen, onClose, onSubjectUpdated, subject }: EditSubjectModalProps) {
  const [name, setName] = useState(subject.name)
  const [icon, setIcon] = useState(subject.icon || '📚')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { supabase } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setName(subject.name)
      setIcon(subject.icon || '📚')
    }
  }, [isOpen, subject])

  if (!isOpen) return null

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          name: name.trim(),
          icon: icon,
        })
        .eq('id', subject.id)
        .select()
        .single()

      if (error) throw error

      onSubjectUpdated(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subject')
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

        <h2 className="text-xl font-semibold mb-1">Edit Subject</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Update the name and icon for your subject
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editSubjectName" className="block text-sm font-medium mb-2">
              Subject Name
            </label>
            <input
              id="editSubjectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Machine Learning, Calculus II"
              required
              className="w-full px-4 py-2.5 bg-white border border-black/[0.08] rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/[0.08] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                    icon === e
                      ? 'bg-black/[0.08] border-black/[0.12] shadow-sm'
                      : 'hover:bg-black/[0.04] border-transparent'
                  } border`}
                >
                  {e}
                </button>
              ))}
            </div>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
