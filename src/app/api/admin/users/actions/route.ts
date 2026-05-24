import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'ban' | 'unban' | 'upgrade' | 'downgrade' | 'reset_quota' | 'delete'
      userId: string
      plan?: string
    }

    const { action, userId, plan } = body
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    switch (action) {

      case 'ban': {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ is_banned: true })
          .eq('id', userId)
        if (error) throw error
        return NextResponse.json({ success: true, message: 'Utilisateur banni' })
      }

      case 'unban': {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ is_banned: false })
          .eq('id', userId)
        if (error) throw error
        return NextResponse.json({ success: true, message: 'Utilisateur débanni' })
      }

      case 'upgrade': {
        if (!plan) return NextResponse.json({ error: 'plan requis' }, { status: 400 })
        const limits: Record<string, number> = { free: 5, starter: 100, pro: 200, premium: 300 }
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan,
            ai_calls_limit: limits[plan] ?? 5,
            subscription_status: 'active',
            plan_started_at: new Date().toISOString(),
          })
          .eq('id', userId)
        if (error) throw error
        return NextResponse.json({ success: true, message: `Plan mis à jour → ${plan}` })
      }

      case 'reset_quota': {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ ai_calls_count: 0 })
          .eq('id', userId)
        if (error) throw error
        return NextResponse.json({ success: true, message: 'Quota IA réinitialisé' })
      }

      case 'delete': {
        // Supprimer le profil puis l'utilisateur auth
        await supabaseAdmin.from('profiles').delete().eq('id', userId)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (error) throw error
        return NextResponse.json({ success: true, message: 'Utilisateur supprimé' })
      }

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
