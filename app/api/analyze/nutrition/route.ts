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
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyse ces ingrédients pour ${servings} portions : ${JSON.stringify(ingredients)}`
      }
    ],
    system: `Tu es un nutritionniste expert. Calcule les valeurs nutritionnelles pour la liste d'ingrédients donnée.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "calories_per_portion": 450,
  "vitamins": {
    "A": 25,
    "B1": 10,
    "B2": 15,
    "B3": 20,
    "B6": 30,
    "B12": 5,
    "C": 45,
    "D": 8,
    "E": 12,
    "K": 18,
    "folate": 22
  },
  "minerals": {
    "calcium": 15,
    "fer": 20,
    "magnesium": 18,
    "potassium": 35,
    "zinc": 12,
    "selenium": 8
  }
}

Les pourcentages sont les % des apports journaliers recommandés (AJR) par portion.`
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Réponse invalide' }, { status: 500 })
  }

  try {
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const nutrition = JSON.parse(cleaned)
    return NextResponse.json(nutrition)
  } catch {
    return NextResponse.json({ error: 'JSON invalide', raw: content.text }, { status: 500 })
  }
}