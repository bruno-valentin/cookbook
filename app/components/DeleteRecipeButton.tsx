'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type State = 'idle' | 'confirming' | 'deleting' | 'error'

export default function DeleteRecipeButton({ id, redirectAfter }: { id: string; redirectAfter?: boolean }) {
  const [state, setState] = useState<State>('idle')
  const router = useRouter()
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  async function handleDelete() {
    setState('deleting')
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (redirectAfter) {
          router.push('/')
        } else {
          router.refresh()
        }
      } else {
        setState('error')
        resetTimer.current = setTimeout(() => setState('idle'), 3000)
      }
    } catch {
      setState('error')
      resetTimer.current = setTimeout(() => setState('idle'), 3000)
    }
  }

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('confirming')}
        className="text-sm text-gray-400 hover:text-red-500 transition"
      >
        Supprimer
      </button>
    )
  }

  if (state === 'confirming') {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-600">Confirmer la suppression ?</span>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Oui
        </button>
        <button
          onClick={() => setState('idle')}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Annuler
        </button>
      </div>
    )
  }

  if (state === 'deleting') {
    return <span className="text-sm text-gray-400">Suppression en cours…</span>
  }

  return <span className="text-sm text-red-500">Erreur lors de la suppression</span>
}
