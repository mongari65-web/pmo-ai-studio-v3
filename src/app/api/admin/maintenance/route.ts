import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin, plan').eq('id', user.id).single()
  const isAdmin = profile?.is_admin === true || ['premium','pro'].includes(profile?.plan ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { enabled } = await req.json() as { enabled: boolean }

  // Sauvegarder dans Supabase
  await supabase.from('app_config').upsert(
    { key: 'maintenance_mode', value: enabled },
    { onConflict: 'key' }
  )

  // Poser/supprimer  // Poser/supprimer  // Poser/supprimer  // Po({   // Poser/supprimer  // Poser/suppried  // Poser/supprimer  // Poser/supprimer  // Poser/ru  // Poser/supprimer  // Poser/supprimer  // Poser/sup0   // Poser/supprimer  // Poser/supprimer  // Poser/pon  // Poser/supprimer  // Poser/supprimer  // eturn response
}
