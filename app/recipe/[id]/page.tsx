import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function RecipePage({ params }: { params: { id: string } }) {
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', params.id).single()

  if (!recipe) return <div className="p-8">Recette introuvable.</div>

  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline mb-4 block">← Retour</Link>

      <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
      <p className="text-gray-500 mb-6">{recipe.description}</p>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{totalTime}</div>
          <div className="text-xs text-gray-500">min total</div>
        </div>
        <div className="border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{recipe.nutrition?.calories_per_portion || '—'}</div>
          <div className="text-xs text-gray-500">kcal/portion</div>
        </div>
        <div className="border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: recipe.yuka_score >= 70 ? 'green' : recipe.yuka_score >= 40 ? 'orange' : 'red' }}>
            {recipe.yuka_score || '—'}
          </div>
          <div className="text-xs text-gray-500">score Yuka</div>
        </div>
        <div className="border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{recipe.price_per_portion ? `${recipe.price_per_portion}€` : '—'}</div>
          <div className="text-xs text-gray-500">par portion</div>
        </div>
      </div>

      {/* Temps */}
      <div className="flex gap-4 text-sm text-gray-500 mb-8">
        <span>⏱ Préparation : {recipe.prep_time_min} min</span>
        <span>🔥 Cuisson : {recipe.cook_time_min} min</span>
        <span>👥 {recipe.servings} portions</span>
      </div>

      {/* Ingrédients */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Ingrédients</h2>
        <ul className="space-y-1">
          {recipe.ingredients?.map((ing: any, i: number) => (
            <li key={i} className="flex gap-2">
              <span className="font-medium">{ing.quantity} {ing.unit}</span>
              <span className="text-gray-600">{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mise en place */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">🥣 Mise en place</h2>
        <ol className="space-y-2">
          {recipe.steps_mise_en_place?.map((step: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="font-bold text-gray-400 w-5">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Cuisson */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">👨‍🍳 Cuisson</h2>
        <ol className="space-y-2">
          {recipe.steps_cooking?.map((step: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="font-bold text-gray-400 w-5">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Nutrition */}
      {recipe.nutrition && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">🥗 Valeurs nutritionnelles</h2>
          <p className="text-sm text-gray-500 mb-3">% des apports journaliers recommandés par portion</p>
          <div className="space-y-2">
            {Object.entries(recipe.nutrition.vitamins || {}).map(([key, value]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vitamine {key}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(value, 100)}%` }} />
                </div>
              </div>
            ))}
            {Object.entries(recipe.nutrition.minerals || {}).map(([key, value]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}