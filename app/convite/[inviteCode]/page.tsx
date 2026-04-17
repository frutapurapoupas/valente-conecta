'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Store, User, Phone, MapPin, Package, ArrowRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface InviteData {
  id: string
  store_name: string
  responsible_name: string
  whatsapp: string
  status: string
  referral: {
    user: {
      name: string
    }
  }
}

export default function ConvitePage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [formData, setFormData] = useState({
    storeLocation: '',
    storePhoto: null as File | null,
    acceptTerms: false
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (inviteCode) {
      loadInvite()
    }
  }, [inviteCode])

  const loadInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('store_invites')
        .select(`
          *,
          referral:referrals(
            user:auth_users(
              raw_user_meta_data->>name as name
            )
          )
        `)
        .eq('invite_code', inviteCode)
        .single()

      if (error) {
        console.error('Erro ao carregar convite:', error)
        return
      }

      if (data.status !== 'pending') {
        router.push(`/convite-expirado?status=${data.status}`)
        return
      }

      setInvite(data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, storePhoto: file })
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite || !formData.acceptTerms) return

    setAccepting(true)
    try {
      // Upload da foto se existir
      let photoUrl = null
      if (formData.storePhoto) {
        const fileName = `store-${Date.now()}-${formData.storePhoto.name}`
        const { error: uploadError } = await supabase.storage
          .from('store-images')
          .upload(fileName, formData.storePhoto)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('store-images')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      }

      // Aceitar convite e criar loja
      const { data: storeId, error: acceptError } = await supabase
        .rpc('accept_store_invite', {
          invite_code_param: inviteCode,
          store_data: {
            name: invite.store_name,
            location: formData.storeLocation,
            photo: photoUrl
          }
        })

      if (acceptError) {
        console.error('Erro ao aceitar convite:', acceptError)
        return
      }

      router.push(`/convite-sucesso?store=${storeId}`)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!invite) return

    try {
      await supabase
        .from('store_invites')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', invite.id)

      router.push('/convite-rejeitado')
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Carregando convite...</p>
        </div>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Convite não encontrado</h1>
          <p className="text-zinc-400">Este convite é inválido ou expirou.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black">
        <div className="container mx-auto px-4 py-8 text-center">
          <Store className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-black italic mb-2">Você foi convidado!</h1>
          <p className="text-lg opacity-90">Para cadastrar a loja no Valente Conecta</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Informações do Convite */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-yellow-500" />
              Detalhes do Convite
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-400">Loja</p>
                  <p className="font-semibold">{invite.store_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-400">Responsável</p>
                  <p className="font-semibold">{invite.responsible_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-400">WhatsApp</p>
                  <p className="font-semibold">{invite.whatsapp}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-400">Convidado por</p>
                  <p className="font-semibold">{invite.referral?.user?.name || 'Um usuário Valente'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Aceitação */}
          <form onSubmit={handleAccept} className="space-y-6">
            {/* Localização */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-500" />
                Localização da Loja
              </h3>
              
              <input
                type="text"
                value={formData.storeLocation}
                onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ex: Rua Principal, 123 - Centro, Coité-BA"
                required
              />
            </div>

            {/* Foto da Loja */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4">Foto da Loja (opcional)</h3>
              
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null)
                        setFormData({ ...formData, storePhoto: null })
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remover foto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 text-zinc-500 mx-auto">+</div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-yellow-500 hover:text-yellow-400">
                          Clique para fazer upload
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-zinc-500 text-sm mt-1">
                        PNG, JPG ou GIF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Termos */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 text-yellow-500 bg-zinc-800 border-zinc-700 rounded focus:ring-yellow-500"
                  required
                />
                <span className="text-sm text-zinc-300">
                  Aceito cadastrar minha loja no Valente Conecta e autorizo o envio de comunicações relacionadas ao serviço.
                </span>
              </label>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={accepting || !formData.acceptTerms}
                className="flex-1 bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Aceitar Convite
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReject}
                className="px-6 py-4 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Recusar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
