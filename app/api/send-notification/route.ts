// app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Configuração do Firebase Admin (servidor)
// Você precisa baixar a chave da conta de serviço do Firebase

export async function POST(request: NextRequest) {
  try {
    const { token, titulo, corpo, dados } = await request.json()
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 400 })
    }
    
    // Simulação - em produção, use firebase-admin
    console.log(`📱 Enviando notificação para token: ${token.substring(0, 20)}...`)
    console.log(`Título: ${titulo}`)
    console.log(`Corpo: ${corpo}`)
    
    // Aqui você implementaria o envio real com firebase-admin
    // const admin = require('firebase-admin')
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    // await admin.messaging().send({ token, notification: { title: titulo, body: corpo }, data: dados })
    
    return NextResponse.json({ success: true, message: 'Notificação enviada (simulação)' })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}