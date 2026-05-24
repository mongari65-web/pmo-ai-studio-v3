import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as const })

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY manquante' }, { status: 500 })
    }

    // Récupérer les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price'],
    })

    const trialing = await stripe.subscriptions.list({ status: 'trialing', limit: 100 })
    const pastDue  = await stripe.subscriptions.list({ status: 'past_due',  limit: 100 })
    const canceled = await stripe.subscriptions.list({ status: 'canceled',  limit: 100, created: { gte: Math.floor(Date.now()/1000) - 30*24*3600 } })

    // Calculer MRR réel
    let mrr = 0
    const planCounts: Record<string, number> = { starter: 0, pro: 0, premium: 0 }

    subscriptions.data.forEach(sub => {
      sub.items.data.forEach(item => {
        const amount = (item.price.unit_amount ?? 0) / 100
        const interval = item.price.recurring?.interval
        mrr += interval === 'year' ? amount / 12 : amount

        // Détecter le plan selon le montant
        if (amount <= 10)      planCounts.starter++
        else if (amount <= 18) planCounts.pro++
        else                   planCounts.premium++
      })
    })

    const arr         = Math.round(mrr * 12)
    const totalActive = subscriptions.data.length
    const churnCount  = canceled.data.length
    const churnRate   = totalActive > 0 ? Math.round(churnCount / (totalActive + churnCount) * 100) : 0
    const ltv         = churnRate > 0 ? Math.round((mrr / totalActive || 0) / (churnRate / 100)) : 0

    // Derniers paiements (PaymentIntents)
    const payments = await stripe.paymentIntents.list({ limit: 10 })
    const recentPayments = payments.data
      .filter(p => p.status === 'succeeded')
      .map(p => ({
        id:       p.id,
        amount:   p.amount / 100,
        currency: p.currency,
        created:  p.created,
        customer: typeof p.customer === 'string' ? p.customer : p.customer?.id,
      }))

    // Paiements échoués
    const failedPayments = payments.data
      .filter(p => p.status === 'requires_payment_method' || p.status === 'canceled')
      .length

    return NextResponse.json({
      mrr:           Math.round(mrr),
      arr,
      totalActive,
      trialing:      trialing.data.length,
      pastDue:       pastDue.data.length,
      canceled:      churnCount,
      churnRate,
      ltv,
      planCounts,
      recentPayments,
      failedPayments,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
