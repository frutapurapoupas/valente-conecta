// Este endpoint registra tokens de push (incluindo chat_id do Telegram) para o usuário logado
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { usuarioId, tipo, token } = req.body
  if (!usuarioId || !tipo || !token) return res.status(400).json({ error: 'Dados obrigatórios' })

  const { error } = await supabase
    .from('push_tokens')
    .upsert([{ usuarioId, tipo, token }], { onConflict: ['usuarioId', 'tipo'] })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true })
}
