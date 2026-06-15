import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || !id.trim()) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    console.error('[DELETE /api/recipes]', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Recette introuvable' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
