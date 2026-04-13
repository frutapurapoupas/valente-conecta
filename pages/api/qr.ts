import type { NextApiRequest, NextApiResponse } from 'next'
import QRCode from 'qrcode'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { link } = req.query
  if (!link || typeof link !== 'string') {
    res.status(400).send('Faltando link')
    return
  }
  try {
    const qr = await QRCode.toBuffer(link, { width: 256 })
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(qr)
  } catch (e) {
    res.status(500).send('Erro ao gerar QR')
  }
}
