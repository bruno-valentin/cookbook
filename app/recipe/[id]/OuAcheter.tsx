'use client'

import { useState } from 'react'

type Ingredient = { name: string; quantity?: number; unit?: string }
type Item = { name: string; channel: string; store_type?: string; substitute?: string }
type Status = 'idle' | 'loading' | 'done' | 'error'

const norm = (s: string) => s.toLowerCase().trim()

// Lien Google Maps pré-rempli (ADR-4) : recherche "type de magasin + adresse"
const mapsUrl = (storeQuery: string, address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeQuery} ${address}`)}`

export default function OuAcheter({ ingredients }: { ingredients?: Ingredient[] }) {
  const [address, setAddress] = useState('')
  const [submittedAddress, setSubmittedAddress] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [items, setItems] = useState<Item[]>([])

  // Pas d'ingrédients sur la recette → ne rien afficher (E6)
  if (!ingredients || ingredients.length === 0) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/where-to-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      if (!res.ok) {
        // QA FIX-2 (E5) : tout non-2xx → état erreur, on ne suppose pas un JSON valide
        setStatus('error')
        return
      }
      const data = await res.json()
      setItems(Array.isArray(data?.items) ? data.items : [])
      setSubmittedAddress(address.trim())
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  // --- Regroupement (ADR-6 dégradation douce + FIX-3 réconciliation) ---
  const valid = (it: Item) =>
    it.channel === 'specialise' && !!it.store_type?.trim() && !!it.substitute?.trim()

  const specialiseItems = items.filter(valid)
  const returned = new Set(items.map((i) => norm(i.name)))
  const missing = (ingredients ?? []).filter((i) => !returned.has(norm(i.name))) // oublié OU renommé (E3)

  // Tout ce qui n'est pas un spécialisé valide → supermarché ; + les ingrédients manquants (jamais perdus)
  const supermarcheNames = [
    ...items.filter((it) => !valid(it)).map((it) => it.name),
    ...missing.map((i) => i.name),
  ]

  // Spécialisés groupés par type de magasin (1 carte + 1 lien par type — ARB-2)
  const byStore = new Map<string, Item[]>()
  for (const it of specialiseItems) {
    const key = it.store_type!.trim()
    byStore.set(key, [...(byStore.get(key) ?? []), it])
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">🛒 Où acheter</h2>

      {status !== 'done' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Entre ton adresse pour voir où acheter les ingrédients près de chez toi.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse (rue + ville)"
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              disabled={!address.trim() || status === 'loading'}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40"
            >
              {status === 'loading' ? 'Recherche…' : 'Trouver'}
            </button>
          </div>
          {status === 'loading' && (
            <span className="text-sm text-gray-500">Analyse des ingrédients…</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-500">
              {"Impossible de récupérer les lieux d'achat. Réessaie."}
            </span>
          )}
        </form>
      )}

      {status === 'done' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>à {submittedAddress}</span>
            <button
              onClick={() => setStatus('idle')}
              className="hover:underline"
            >
              modifier
            </button>
          </div>

          {missing.length > 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 border rounded-lg px-3 py-2">
              {"⚠️ Certains ingrédients n'ont pas été reconnus, vérifie-les directement."}
            </p>
          )}

          {supermarcheNames.length > 0 && (
            <div className="border rounded-xl p-4">
              <div className="font-semibold mb-1">Supermarché</div>
              <div className="text-sm text-gray-600 mb-3">{supermarcheNames.join(' · ')}</div>
              <a
                href={mapsUrl('supermarché', submittedAddress)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50"
              >
                Voir le supermarché le plus proche ↗
              </a>
            </div>
          )}

          {[...byStore.entries()].map(([storeType, list]) => (
            <div key={storeType} className="border rounded-xl p-4">
              <div className="font-semibold mb-1 capitalize">{storeType}</div>
              <ul className="text-sm mb-3 space-y-0.5">
                {list.map((it, i) => (
                  <li key={i}>
                    {it.name} — <span className="text-gray-500">Alternative : {it.substitute}</span>
                  </li>
                ))}
              </ul>
              <a
                href={mapsUrl(storeType, submittedAddress)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50"
              >
                Voir {storeType} le plus proche ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
