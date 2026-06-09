'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AddRecipe() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState<'prompt' | 'edit' | 'done'>('prompt')

  async function generateRecipe() {
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    setRecipe(data)
    setStep('edit')
    setLoading(false)
  }

  async function analyzeAndSave() {
    setAnalyzing(true)

    const [nutritionRes, scoreRes] = await Promise.all([
      fetch('/api/analyze/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: recipe.ingredients, servings: recipe.servings })
      }),
      fetch('/api/analyze/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: recipe.ingredients, servings: recipe.servings })
      })
    ])

    const nutrition = await nutritionRes.json()
    const score = await scoreRes.json()

    await supabase.from('recipes').insert({
      ...recipe,
      nutrition,
      yuka_score: score.yuka_score,
      price_per_portion: score.price_per_portion
    })

    setAnalyzing(false)
    setStep('done')
    setTimeout(() => router.push('/'), 1500)
  }

  if (step === 'done') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl">✅ Recette sauvegardée !</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🍳 Ajouter une recette</h1>

      {step === 'prompt' && (
        <div>
          <label className="block text-sm font-medium mb-2">Décris ta recette</label>
          <textarea
            className="w-full border rounded-lg p-3 h-32 mb-4 resize-none"
            placeholder="Ex: une pasta au citron et crevettes pour 4 personnes..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={generateRecipe}
            disabled={loading || !prompt}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? '⏳ Génération en cours...' : '✨ Générer la recette'}
          </button>
        </div>
      )}

      {step === 'edit' && recipe && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              className="w-full border rounded-lg p-2"
              value={recipe.title}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg p-2 h-20 resize-none"
              value={recipe.description}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Portions</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={recipe.servings}
                onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Préparation (min)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={recipe.prep_time_min}
                onChange={(e) => setRecipe({ ...recipe, prep_time_min: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Cuisson (min)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={recipe.cook_time_min}
                onChange={(e) => setRecipe({ ...recipe, cook_time_min: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ingrédients</label>
            {recipe.ingredients.map((ing: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="flex-1 border rounded-lg p-2"
                  value={ing.name}
                  onChange={(e) => {
                    const updated = [...recipe.ingredients]
                    updated[i] = { ...updated[i], name: e.target.value }
                    setRecipe({ ...recipe, ingredients: updated })
                  }}
                />
                <input
                  type="number"
                  className="w-20 border rounded-lg p-2"
                  value={ing.quantity}
                  onChange={(e) => {
                    const updated = [...recipe.ingredients]
                    updated[i] = { ...updated[i], quantity: parseFloat(e.target.value) }
                    setRecipe({ ...recipe, ingredients: updated })
                  }}
                />
                <input
                  className="w-24 border rounded-lg p-2"
                  value={ing.unit}
                  onChange={(e) => {
                    const updated = [...recipe.ingredients]
                    updated[i] = { ...updated[i], unit: e.target.value }
                    setRecipe({ ...recipe, ingredients: updated })
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep('prompt')}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              ← Recommencer
            </button>
            <button
              onClick={analyzeAndSave}
              disabled={analyzing}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex-1"
            >
              {analyzing ? '⏳ Analyse en cours...' : '🔬 Analyser et sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}