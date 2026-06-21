import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json()

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'Ingrédients manquants' }, { status: 400 })
  }

  const names = ingredients.map((i: { name?: string }) => i?.name).filter(Boolean)

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000, // QA FIX-1 (E4) : évite la troncature JSON sur recettes longues
    messages: [{ role: 'user', content: JSON.stringify(names) }],
    system: `Tu classes des ingrédients pour un acheteur en France.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "items": [
    { "name": "Oignon", "channel": "supermarche" },
    { "name": "Mirin", "channel": "specialise", "store_type": "épicerie asiatique", "substitute": "saké + 1 c. à s. de sucre" }
  ]
}

Règles :
- Reprends EXACTEMENT chaque nom d'ingrédient reçu, sans en oublier, sans en renommer, sans en ajouter.
- "supermarche" si l'ingrédient est trouvable en supermarché classique français (cas par défaut, en cas de doute).
- "specialise" UNIQUEMENT si l'ingrédient est réellement indisponible en grande surface : dans ce cas
  "store_type" (type de commerce, ex. "épicerie asiatique", "épicerie italienne", "boucherie halal") ET
  "substitute" (ingrédient courant de remplacement) sont OBLIGATOIRES.
- N'invente jamais de nom ni d'adresse de magasin : seulement le TYPE de commerce.`
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Réponse invalide' }, { status: 500 })
  }

  try {
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'JSON invalide', raw: content.text }, { status: 500 })
  }
}
