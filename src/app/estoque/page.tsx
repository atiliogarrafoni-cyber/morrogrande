'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Lote, avgNotas } from '@/lib/supabase'
import { StarsDisplay } from '@/components/Stars'
import LoteForm from '@/components/LoteForm'
import { Box, Pencil, X, RefreshCw } from 'lucide-react'

export default function EstoquePage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Lote | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('lotes').select('*').order('created_at', { ascending: false })
    setLotes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const disponiveis = lotes.filter(l => !l.usado)
  const sacas = disponiveis.reduce((s, l) => s + l.sacas, 0)
  const avgImp = disponiveis.length ? disponiveis.reduce((s, l) => s + l.impureza, 0) / disponiveis.length : null
  const avgPva = disponiveis.length ? disponiveis.reduce((s, l) => s + l.pva, 0) / disponiveis.length : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Box size={22} className="text-[#3B6D11]" />
        <div>
          <h1 className="text-lg font-semibold">Estoque</h1>
          <p className="text-sm text-gray-500">Todos os lotes registrados</p>
        </div>
        <button className="ml-auto btn-secondary" onClick={load}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="metric"><div className="text-xs text-gray-500 font-medium mb-1">LOTES NO ESTOQUE</div><div className="text-2xl font-semibold">{lotes.length}</div></div>
        <div className="metric"><div className="text-xs text-gray-500 font-medium mb-1">SACAS DISPONÍVEIS</div><div className="text-2xl font-semibold">{sacas}</div></div>
        <div className="metric"><div className="text-xs text-gray-500 font-medium mb-1">IMPUREZA MÉDIA</div><div className="text-2xl font-semibold">{avgImp != null ? avgImp.toFixed(2) + '%' : '—'}</div></div>
        <div className="metric"><div className="text-xs text-gray-500 font-medium mb-1">PVA MÉDIO</div><div className="text-2xl font-semibold">{avgPva != null ? avgPva.toFixed(2) + '%' : '—'}</div></div>
      </div>

      {/* Modal de edição */}
      {editing && (
        <div style={{ minHeight: 400, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base">Editar lote {editing.codigo}</h2>
              <button className="btn-secondary p-1.5" onClick={() => setEditing(null)}><X size={16} /></button>
            </div>
            <LoteForm
              lote={editing}
              onSaved={() => { setEditing(null); load() }}
            />
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Carregando...</div>
        ) : lotes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Nenhum lote registrado. Vá em "Receber Lote" para começar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Lote</th><th>Data Receb.</th><th>Box</th><th>Origem</th>
                  <th>Sacas</th><th>Impureza</th><th>PVA</th><th>R$/saca</th>
                  <th>Prova</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {lotes.map(l => {
                  const nota = avgNotas(l)
                  const dataFmt = l.data_recebimento
                    ? new Date(l.data_recebimento + 'T12:00:00').toLocaleDateString('pt-BR')
                    : '—'
                  return (
                    <tr key={l.id}>
                      <td><span className="font-medium">{l.codigo}</span></td>
                      <td className="text-gray-500 text-xs">{dataFmt}</td>
                      <td><span className="badge-info">{l.box}</span></td>
                      <td className="text-gray-500 text-xs max-w-[140px] truncate">{l.origem}</td>
                      <td>{l.sacas} sc</td>
                      <td>
                        <span className={l.impureza > 1.5 ? 'badge-err' : l.impureza > 1 ? 'badge-warn' : 'text-sm'}>
                          {l.impureza.toFixed(2)}%
                        </span>
                      </td>
                      <td>{l.pva.toFixed(2)}%</td>
                      <td>R$ {l.valor_saca.toFixed(0)}</td>
                      <td><StarsDisplay value={nota} /></td>
                      <td>
                        <span className={l.usado ? 'badge-warn' : 'badge-ok'}>
                          {l.usado ? 'Usado' : 'Disponível'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary py-1 px-2 text-xs"
                          onClick={() => setEditing(l)}
                          title="Editar lote"
                        >
                          <Pencil size={13} /> Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
