'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Lote, Liga, avgNotas } from '@/lib/supabase'
import { StarsDisplay } from '@/components/Stars'
import { GitMerge, X, Check, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

export default function BlendPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [ligas, setLigas] = useState<Liga[]>([])
  const [ligaSel, setLigaSel] = useState<Liga | null>(null)
  const [slots, setSlots] = useState<(Lote | null)[]>([null, null, null, null])
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  const load = useCallback(async () => {
    const [{ data: ls }, { data: lgs }] = await Promise.all([
      supabase.from('lotes').select('*').eq('usado', false).order('created_at', { ascending: false }),
      supabase.from('ligas').select('*').order('numero'),
    ])
    setLotes(ls ?? [])
    setLigas(lgs ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const filled = slots.filter(Boolean) as Lote[]
  const usedIds = slots.filter(Boolean).map(l => l!.id)
  const disponiveis = lotes.filter(l => !usedIds.includes(l.id))

  const n = filled.length
  const avgImp = n ? filled.reduce((s, l) => s + l.impureza, 0) / n : 0
  const avgPva = n ? filled.reduce((s, l) => s + l.pva, 0) / n : 0
  const avgPreco = n ? filled.reduce((s, l) => s + l.valor_saca, 0) / n : 0
  const notaVals = filled.map(l => avgNotas(l)).filter(v => v > 0)
  const notaMedia = notaVals.length ? notaVals.reduce((a, b) => a + b, 0) / notaVals.length : 0

  const erros: string[] = []
  const avisos: string[] = []
  if (n >= 2 && ligaSel) {
    if (avgImp > ligaSel.imp_max) erros.push(`Impureza ${avgImp.toFixed(2)}% acima do limite de ${ligaSel.imp_max}%`)
    if (avgPva > ligaSel.pva_max) erros.push(`PVA ${avgPva.toFixed(2)}% acima do limite de ${ligaSel.pva_max}%`)
    if (avgPreco < ligaSel.preco_min) avisos.push(`Preço médio R$${avgPreco.toFixed(0)}/sc abaixo do mínimo R$${ligaSel.preco_min}`)
    if (avgPreco > ligaSel.preco_max) avisos.push(`Preço médio R$${avgPreco.toFixed(0)}/sc acima do máximo R$${ligaSel.preco_max}`)
  }
  const canApprove = n >= 2 && ligaSel && erros.length === 0

  function setSlot(i: number, loteId: string) {
    const lote = lotes.find(l => l.id === loteId) ?? null
    setSlots(s => { const n = [...s]; n[i] = lote; return n })
  }

  function removeSlot(i: number) {
    setSlots(s => { const n = [...s]; n[i] = null; return n })
  }

  async function aprovar() {
    if (!canApprove || !ligaSel) return
    setSaving(true)
    const { error: bErr } = await supabase.from('blends').insert({
      data_aprovacao: new Date().toISOString().split('T')[0],
      liga_id: ligaSel.id,
      liga_numero: ligaSel.numero,
      liga_nome: ligaSel.nome,
      lotes_ids: filled.map(l => l.id),
      lotes_codigos: filled.map(l => l.codigo),
      imp_media: +avgImp.toFixed(2),
      pva_media: +avgPva.toFixed(2),
      preco_medio: +avgPreco.toFixed(2),
      nota_media: notaMedia ? +notaMedia.toFixed(1) : null,
      status: avisos.length ? 'Aprovado c/ avisos' : 'Aprovado',
      avisos,
    })
    if (!bErr) {
      await supabase.from('lotes').update({ usado: true }).in('id', filled.map(l => l.id))
    }
    setSaving(false)
    if (!bErr) {
      setOk(true)
      setSlots([null, null, null, null])
      setLigaSel(null)
      load()
      setTimeout(() => setOk(false), 4000)
    }
  }

  const pct = (v: number, max: number) => Math.min(100, (v / max) * 100)
  const barColor = (p: number) => p > 100 ? '#E24B4A' : p > 80 ? '#EF9F27' : '#3B6D11'

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <GitMerge size={22} className="text-[#3B6D11]" />
        <div>
          <h1 className="text-lg font-semibold">Criar Blend</h1>
          <p className="text-sm text-gray-500">Monte um blend e aprove dentro dos padrões da liga</p>
        </div>
        <button className="ml-auto btn-secondary" onClick={load}><RefreshCw size={14} /> Atualizar</button>
      </div>

      {ok && (
        <div className="flex items-center gap-2 badge-ok p-3 rounded-xl mb-4 text-sm">
          <Check size={16} /> Blend aprovado e registrado com sucesso!
        </div>
      )}

      {/* 1. Liga */}
      <div className="card">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">1. Escolha a liga (padrão de qualidade)</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {ligas.map(l => (
            <button
              key={l.id}
              onClick={() => setLigaSel(ligaSel?.id === l.id ? null : l)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                ligaSel?.id === l.id
                  ? 'bg-[#3B6D11] text-white border-[#3B6D11]'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              {l.numero} — {l.nome}
            </button>
          ))}
        </div>
        {ligaSel && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge-gray">{ligaSel.descricao}</span>
            <span className="badge-err">Imp. máx {ligaSel.imp_max}%</span>
            <span className="badge-warn">PVA máx {ligaSel.pva_max}%</span>
            <span className="badge-info">R$ {ligaSel.preco_min}–{ligaSel.preco_max}/sc</span>
          </div>
        )}
      </div>

      {/* 2. Lotes */}
      <div className="card">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">2. Selecione os lotes (2 a 4 lotes)</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {slots.map((slot, i) => (
            <div
              key={i}
              className={`border rounded-xl p-4 ${slot ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-200'}`}
            >
              <div className="text-xs font-medium text-gray-400 uppercase mb-2">
                Lote {i + 1}{i < 2 ? ' (obrigatório)' : ' (opcional)'}
              </div>
              {slot ? (
                <div>
                  <div className="font-semibold text-sm mb-0.5">{slot.codigo} <span className="font-normal text-gray-500">Box {slot.box}</span></div>
                  <div className="text-xs text-gray-500 mb-1">{slot.origem}</div>
                  <div className="flex gap-3 text-xs text-gray-600 mb-1">
                    <span>Imp: {slot.impureza.toFixed(2)}%</span>
                    <span>PVA: {slot.pva.toFixed(2)}%</span>
                    <span>R${slot.valor_saca.toFixed(0)}/sc</span>
                  </div>
                  <StarsDisplay value={avgNotas(slot)} />
                  <button className="btn-danger mt-2" onClick={() => removeSlot(i)}><X size={12} /> Remover</button>
                </div>
              ) : (
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
                  onChange={e => { if (e.target.value) setSlot(i, e.target.value); e.target.value = '' }}
                  value=""
                >
                  <option value="">— Selecionar lote —</option>
                  {disponiveis.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.codigo} | Box {l.box} | Imp:{l.impureza.toFixed(2)}% | PVA:{l.pva.toFixed(2)}% | R${l.valor_saca.toFixed(0)}/sc
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Resultado */}
        {n >= 2 && (
          <div className={`rounded-xl p-4 ${erros.length ? 'bg-[#FCEBEB] border border-[#E24B4A]' : avisos.length ? 'bg-[#FAEEDA] border border-[#BA7517]' : 'bg-[#EAF3DE] border border-[#639922]'}`}>
            <div className={`font-semibold text-sm mb-3 ${erros.length ? 'text-[#A32D2D]' : avisos.length ? 'text-[#854F0B]' : 'text-[#3B6D11]'}`}>
              {erros.length ? '❌ Blend fora dos limites' : avisos.length ? '⚠️ Blend com avisos' : '✅ Blend dentro dos parâmetros'}
            </div>
            <div className={`grid gap-4 mb-3 ${notaMedia ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {[
                { label: 'Impureza média', val: avgImp.toFixed(2) + '%', max: ligaSel?.imp_max },
                { label: 'PVA médio', val: avgPva.toFixed(2) + '%', max: ligaSel?.pva_max },
                { label: 'Preço médio', val: `R$ ${avgPreco.toFixed(0)}/sc`, max: null },
                ...(notaMedia ? [{ label: 'Nota de prova', val: notaMedia.toFixed(1) + ' / 5', max: null }] : []),
              ].map(({ label, val, max }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className="text-xl font-semibold">{val}</div>
                  {max && ligaSel && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div style={{ flex: 1, height: 6, background: '#d1d5db', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct(parseFloat(val), max)}%`, height: '100%', background: barColor(pct(parseFloat(val), max)), borderRadius: 4 }} />
                      </div>
                      <span className="text-xs text-gray-500">/{max}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {erros.map((e, i) => <div key={i} className="text-xs text-[#A32D2D] flex gap-1 mb-1"><X size={12} className="shrink-0 mt-0.5" />{e}</div>)}
            {avisos.map((a, i) => <div key={i} className="text-xs text-[#854F0B] flex gap-1 mb-1"><AlertTriangle size={12} className="shrink-0 mt-0.5" />{a}</div>)}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button className="btn-primary" onClick={aprovar} disabled={!canApprove || saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Aprovar blend
          </button>
          <button className="btn-secondary" onClick={() => { setSlots([null, null, null, null]); setLigaSel(null) }}>
            <RefreshCw size={14} /> Limpar
          </button>
        </div>
      </div>
    </div>
  )
}
