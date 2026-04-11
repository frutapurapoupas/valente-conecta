import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

async function login(formData: FormData) {
  'use server'
  const senha = formData.get('senha')?.toString() ?? ''
  const pass = process.env.ADMIN_MASTER_PASS ?? 'VC@master2026'

  if (senha !== pass) {
    redirect('/admin-master/login?erro=1')
  }

  cookies().set('am_token', pass, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin-master/dashboard')
}

export default function AdminMasterLogin({
  searchParams,
}: {
  searchParams: { erro?: string }
}) {
  return <LoginForm action={login} erro={!!searchParams.erro} />
}
