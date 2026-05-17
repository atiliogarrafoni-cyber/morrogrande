'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Liga } from '@/lib/supabase'
import { Settings, Plus, Trash2, Check, Loader2 } from 'lucide-react'

function emptyForm() {
  return { numero: '', nome: '', descricao: '', imp_max: '', pva_max: '', preco_min: '', preco_max: '' }
}

export default function LigasPage() {
  const [ligas, setLigas] = useState<Liga[]>([])
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('ligas').select('*').order('numero')
    setLigas(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.numero || !form.nome || !form.imp_max || !form.pva_max || !form.preco_min || !form.preco_max) {
      setErr('Preencha todos os campos obrigatórios.'); return
    }
    setSaving(true); setErr('')
    const { error } = await supabase.from('ligas').insert({
      numero: form.numero,
      nome: form.nome,
      descricao: form.descricao || null,
      imp_max: Number(form.imp_max),
      pva_max: Number(form.pva_max),
      preco_min: Number(form.preco_min),
      preco_max: Number(form.preco_max),
    })
    setSaving(false)
    if (error) { setErr(error.code === '23505' ? 'Já existe uma liga com este número.' : 'Erro: ' + error.message); return }
    setForm(emptyForm())
    load()
  }

  async function remove(id: string, numero: string) {
    if (!confirm(`Remover liga ${numero}?`)) return
    await supabase.from('ligas').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Settings size={22} className="text-[#3B6D11]" />
        <div>
          <h1 className="text-lg font-semibold">Ligas</h1>
          <p className="text-sm text-gray-500">Padrões de qualidade para aprovação de blends</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium">
          <Plus size={16} className="text-[#3B6D11]" /> Adicionar nova liga
        </div>
        {err && <div className="badge-err p-3 rounded-lg text-sm mb-3">{err}</div>}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="field"><label>Número da liga *</label><input placeholder="Ex: 50350" value={form.numero} onChange={e => set('numero', e.target.value)} /></div>
          <div className="field"><label>Nome *</label><input placeholder="Ex: MGT" value={form.nome} onChange={e => set('nome', e.target.value)} /></div>
          <div className="field"><label>Descrição / destino</label><input placeholder="Ex: Mercado interno, bebida mole" value={form.descricao} onChange={e => set('descricao', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="field">
            <label>Impureza máxima no blend (%) *</label>
            <input type="number" step="0.01" placeholder="1.00" value={form.imp_max} onChange={e => set('imp_max', e.target.value)} />
            <div className="hint">Limite crítico — bloqueia aprovação</div>
          </div>
          <div className="field">
            <label>PVA máximo no blend (%) *</label>
            <input type="number" step="0.01" placeholder="5.00" value={form.pva_max} onChange={e => set('pva_max', e.target.value)} />
            <div className="hint">Limite crítico — bloqueia aprovação</div>
          </div>
          <div className="field">
            <label>Faixa de preço (R$/saca) *</label>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="Mín" value={form.preco_min} onChange={e => set('preco_min', e.target.value)} style={{ flex: 1 }} />
              <span className="text-gray-400 text-sm">até</span>
              <input type="number" placeholder="Máx" value={form.preco_max} onChange={e => set('preco_max', e.target.value)} style={{ flex: 1 }} />
            </div>
            <div className="hint">Fora da faixa gera aviso (não bloqueia)</div>
          </div>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Salvar liga
        </button>
      </div>

      <div className="space-y-3">
        {ligas.map(l => (
          <div key={l.id} className="card flex items-start justify-between gap-4 mb-0">
            <div>
              <div className="font-semibold text-base mb-1">{l.numero} — {l.nome}</div>
              {l.descricao && <div className="text-sm text-gray-500 mb-2">{l.descricao}</div>}
              <div className="flex flex-wrap gap-2">
                <span className="badge-err">Imp. máx {l.imp_max}%</span>
                <span className="badge-warn">PVA máx {l.pva_max}%</span>
                <span className="badge-info">R$ {l.preco_min}–{l.preco_max}/sc</span>
              </div>
            </div>
            <button className="btn-danger shrink-0" onClick={() => remove(l.id, l.numero)}>
              <Trash2 size={13} /> Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
