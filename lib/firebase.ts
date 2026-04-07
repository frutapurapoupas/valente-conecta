// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Configuração do Firebase (substitua com seus dados)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "472637206113", // Seu ID do remetente
  appId: "SEU_APP_ID"
}

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null

// Solicitar permissão e obter token
export async function solicitarPermissaoPush(): Promise<string | null> {
  if (!messaging) return null
  
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permissão negada')
      return null
    }
    
    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    
    // Obter token
    const token = await getToken(messaging, {
      vapidKey: 'BIWFxPkEyr8mYu1BzyhvFHEpJMiTMHuUBBFFHfavGQRCSjil2j9UFDB1wA1USKQnwdtXsD_0gDTHbKSFw7nLhks',
      serviceWorkerRegistration: registration
    })
    
    if (token) {
      console.log('Token FCM:', token)
      localStorage.setItem('fcm_token', token)
      
      // Salvar token no backend (opcional)
      await fetch('/api/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tipo: 'cliente' })
      })
    }
    
    return token
  } catch (error) {
    console.error('Erro ao obter token:', error)
    return null
  }
}

// Receber mensagens em primeiro plano
export function onMessageListener() {
  if (!messaging) return Promise.resolve(null)
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}

// Enviar notificação para um token específico (via API)
export async function enviarNotificacaoPush(
  token: string,
  titulo: string,
  corpo: string,
  dados?: any
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, titulo, corpo, dados })
    })
    
    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return false
  }
}