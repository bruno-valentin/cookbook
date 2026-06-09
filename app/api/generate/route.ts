import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt manquant' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: `Tu es un chef cuisinier expert. À partir d'une description, génère une recette complète en JSON.
    
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "title": "Nom de la recette",
  "description": "Courte description appétissante",
  "servings": 4,
  "prep_time_min": 15,
  "cook_time_min": 30,
  "ingredients": [
    { "name": "Tomates", "quantity": 4, "unit": "pièces" }
  ],
  "steps_mise_en_place": [
    "Laver et couper les tomates en dés"
  ],
  "steps_cooking": [
    "Faire chauffer l'huile dans une poêle à feu moyen"
  ]
}`
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Réponse invalide' }, { status: 500 })
  }

  try {
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const recipe = JSON.parse(cleaned)
    return NextResponse.json(recipe)
  } catch {
    return NextResponse.json({ error: 'JSON invalide', raw: content.text }, { status: 500 })
  }
}