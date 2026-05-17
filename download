'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import LoteForm from '@/components/LoteForm'
import { PackagePlus, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const [nextCodigo, setNextCodigo] = useState('')
  const [saved, setSaved] = useState(false)

  const loadNext = useCallback(async () => {
    const { count } = await supabase.from('lotes').select('*', { count: 'exact', head: true })
    const n = (count ?? 0) + 1
    setNextCodigo('L' + String(n).padStart(3, '0'))
  }, [])

  useEffect(() => { loadNext() }, [loadNext])

  function onSaved() {
    setSaved(true)
    loadNext()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <PackagePlus size={22} className="text-[#3B6D11]" />
        <div>
          <h1 className="text-lg font-semibold">Receber novo lote</h1>
          <p className="text-sm text-gray-500">Preencha os dados do lote recebido</p>
        </div>
        {nextCodigo && (
          <span className="ml-auto badge-info text-base px-3 py-1">Próximo código: <strong>{nextCodigo}</strong></span>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 badge-ok p-3 rounded-xl mb-4 text-sm">
          <CheckCircle size={16} /> Lote registrado com sucesso!
        </div>
      )}

      <div className="card">
        <LoteForm onSaved={onSaved} nextCodigo={nextCodigo} key={nextCodigo} />
      </div>
    </div>
  )
}
