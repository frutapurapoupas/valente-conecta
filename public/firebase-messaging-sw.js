// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Configuração do Firebase (substitua com seus dados)
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "472637206113",
  appId: "SEU_APP_ID"
})

const messaging = firebase.messaging()

// Receber mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem em segundo plano:', payload)
  
  const notificationTitle = payload.notification?.title || 'Valente Conecta'
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação',
    icon: '/icone.png',
    badge: '/icone.png',
    tag: 'valente-conecta',
    data: payload.data || {}
  }
  
  self.registration.showNotification(notificationTitle, notificationOptions)
})