'use client'
import { useState } from 'react'
import { Lote, supabase, avgNotas } from '@/lib/supabase'
import { Stars } from './Stars'
import { Check, Loader2 } from 'lucide-react'

const NOTAS = [
  { key: 'nota_bebida', label: 'Bebida / Qualidade geral' },
  { key: 'nota_acidez', label: 'Acidez' },
  { key: 'nota_corpo',  label: 'Corpo' },
  { key: 'nota_docura', label: 'Doçura / Sabor' },
  { key: 'nota_aroma',  label: 'Aroma' },
  { key: 'nota_final',  label: 'Finalização (xícara limpa)' },
] as const

type NotaKey = typeof NOTAS[number]['key']

function emptyForm() {
  return {
    data_recebimento: new Date().toISOString().split('T')[0],
    box: '', origem: '', sacas: '', impureza: '', pva: '', valor_saca: '', obs: '',
    nota_bebida: 0, nota_acidez: 0, nota_corpo: 0, nota_docura: 0, nota_aroma: 0, nota_final: 0,
    obs_prova: '',
  }
}

interface Props {
  lote?: Lote
  onSaved: () => void
  nextCodigo?: string
}

export default function LoteForm({ lote, onSaved, nextCodigo }: Props) {
  const [form, setForm] = useState(() =>
    lote
      ? { ...lote, sacas: String(lote.sacas), impureza: String(lote.impureza), pva: String(lote.pva), valor_saca: String(lote.valor_saca) }
      : emptyForm()
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.data_recebimento || !form.box || !form.origem || !form.sacas || !form.impureza || !form.pva || !form.valor_saca) {
      setErr('Preencha todos os campos obrigatórios.'); return
    }
    setSaving(true); setErr('')
    const payload = {
      data_recebimento: form.data_recebimento,
      box: form.box, origem: form.origem,
      sacas: Number(form.sacas),
      impureza: Number(form.impureza),
      pva: Number(form.pva),
      valor_saca: Number(form.valor_saca),
      obs: form.obs || null,
      nota_bebida: form.nota_bebida, nota_acidez: form.nota_acidez,
      nota_corpo: form.nota_corpo, nota_docura: form.nota_docura,
      nota_aroma: form.nota_aroma, nota_final: form.nota_final,
      obs_prova: form.obs_prova || null,
    }
    let error
    if (lote) {
      ;({ error } = await supabase.from('lotes').update(payload).eq('id', lote.id))
    } else {
      const codigo = nextCodigo || ('L' + Date.now())
      ;({ error } = await supabase.from('lotes').insert({ ...payload, codigo }))
    }
    setSaving(false)
    if (error) { setErr('Erro ao salvar: ' + error.message); return }
    onSaved()
  }

  return (
    <div className="space-y-4">
      {err && <div className="badge-err p-3 rounded-lg text-sm">{err}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="field"><label>📅 Data de recebimento *</label><input type="date" value={form.data_recebimento} onChange={e => set('data_recebimento', e.target.value)} /></div>
        <div className="field"><label>📦 Box *</label><input placeholder="Ex: A1, B3..." value={form.box} onChange={e => set('box', e.target.value)} /><div className="hint">Localização no armazém</div></div>
        <div className="field"><label>🌱 Origem / Fazenda *</label><input placeholder="Ex: Fazenda Serra Azul - MG" value={form.origem} onChange={e => set('origem', e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="field"><label>⚖️ Sacas (60 kg) *</label><input type="number" min="1" placeholder="0" value={form.sacas} onChange={e => set('sacas', e.target.value)} /></div>
        <div className="field"><label>🔬 Impureza (%) *</label><input type="number" step="0.01" min="0" max="100" placeholder="0.00" value={form.impureza} onChange={e => set('impureza', e.target.value)} /></div>
        <div className="field"><label>🟤 PVA (%) *</label><input type="number" step="0.01" min="0" max="100" placeholder="0.00" value={form.pva} onChange={e => set('pva', e.target.value)} /></div>
        <div className="field"><label>💰 R$ por saca *</label><input type="number" step="0.01" min="0" placeholder="0.00" value={form.valor_saca} onChange={e => set('valor_saca', e.target.value)} /></div>
      </div>

      <div className="field"><label>📝 Observações</label><input placeholder="Alguma informação extra sobre este lote..." value={form.obs} onChange={e => set('obs', e.target.value)} /></div>

      <div className="border-t border-gray-100 pt-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Notas de prova (avaliação sensorial)</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {NOTAS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600">{label}</span>
              <Stars value={(form as any)[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>
        <div className="field"><label>💬 Comentário da prova</label><input placeholder="Ex: Bebida mole, leve acidez, boa doçura..." value={form.obs_prova} onChange={e => set('obs_prova', e.target.value)} /></div>
      </div>

      <button className="btn-primary" onClick={save} disabled={saving}>
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {lote ? 'Salvar alterações' : 'Registrar lote'}
      </button>
    </div>
  )
}
