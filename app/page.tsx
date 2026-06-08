import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('recipes').select('*')

  return (
    <main>
      <h1>Cookbook</h1>
      {error && <p>Erreur : {error.message}</p>}
      {data && <p>Connexion Supabase OK — {data.length} recette(s) en base</p>}
    </main>
  )
}