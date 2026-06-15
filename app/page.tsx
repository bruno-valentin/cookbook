import { supabase } from '@/lib/supabase'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: recipes } = await supabase.from('recipes').select('*').order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🍳 Mon Cookbook</h1>
        <Link href="/add" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          + Ajouter une recette
        </Link>
      </div>

      {recipes && recipes.length === 0 && (
        <p className="text-gray-500 text-center py-16">Aucune recette pour l'instant. Ajoutez-en une !</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes && recipes.map((recipe) => (
          <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
            <div className="border rounded-xl p-5 hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-1">{recipe.title}</h2>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
              <div className="flex gap-4 text-sm">
                <span>⏱ {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min</span>
                <span>🔥 {recipe.nutrition?.calories_per_portion || '—'} kcal</span>
                <span>⭐ {recipe.yuka_score || '—'}/100</span>
                <span>💶 {recipe.price_per_portion ? `${recipe.price_per_portion}€` : '—'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}