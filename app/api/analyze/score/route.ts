import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { ingredients, servings } = await request.json()

  if (!ingredients || !servings) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Évalue ces ingrédients pour ${servings} portions : ${JSON.stringify(ingredients)}`
      }
    ],
    system: `Tu es un expert en nutrition et en prix des aliments en France.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "yuka_score": 75,
  "yuka_explanation": "Recette bien équilibrée avec des ingrédients peu transformés",
  "price_per_portion": 4.50,
  "price_explanation": "Prix estimé avec des produits de supermarché standard"
}

Le yuka_score est sur 100 (100 = excellent, 0 = très mauvais).
Il prend en compte : niveau de transformation des aliments, additifs, qualité nutritionnelle.
Le price_per_portion est en euros, estimé pour la France en 2024.`
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Réponse invalide' }, { status: 500 })
  }

  try {
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const score = JSON.parse(cleaned)
    return NextResponse.json(score)
  } catch {
    return NextResponse.json({ error: 'JSON invalide', raw: content.text }, { status: 500 })
  }
}