import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeAgendamentos(onChange: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('agendamentos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, payload => {
        onChange(payload)
      })
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [onChange])
}
