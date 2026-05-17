'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Blend } from '@/lib/supabase'
import { ClipboardCheck, RefreshCw, Download } from 'lucide-react'

export default function HistoricoPage() {
  const [blends, setBlends] = useState<Blend[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('blends').select('*').order('created_at', { ascending: false })
    setBlends(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function exportCSV() {
    const header = ['Data', 'Liga', 'Lotes', 'Impureza (%)', 'PVA (%)', 'Preço médio R$/sc', 'Nota prova', 'Status', 'Avisos']
    const rows = blends.map(b => [
      b.data_aprovacao,
      `${b.liga_numero} — ${b.liga_nome}`,
      b.lotes_codigos.join(', '),
      b.imp_media,
      b.pva_media,
      b.preco_medio,
      b.nota_media ?? '—',
      b.status,
      (b.avisos ?? []).join('; '),
    ])
    const csv = '\uFEFF' + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `blends_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <ClipboardCheck size={22} className="text-[#3B6D11]" />
        <div>
          <h1 className="text-lg font-semibold">Histórico de blends</h1>
          <p className="text-sm text-gray-500">Todos os blends aprovados</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-secondary" onClick={exportCSV}><Download size={14} /> Exportar CSV</button>
          <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Atualizar</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Carregando...</div>
        ) : blends.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Nenhum blend aprovado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Data</th><th>Liga</th><th>Lotes usados</th>
                  <th>Impureza</th><th>PVA</th><th>Preço médio</th>
                  <th>Nota prova</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {blends.map(b => {
                  const dataFmt = b.data_aprovacao
                    ? new Date(b.data_aprovacao + 'T12:00:00').toLocaleDateString('pt-BR')
                    : '—'
                  return (
                    <tr key={b.id}>
                      <td className="text-gray-500 text-xs whitespace-nowrap">{dataFmt}</td>
                      <td><span className="font-medium">{b.liga_numero}</span> <span className="text-gray-500">— {b.liga_nome}</span></td>
                      <td className="text-xs text-gray-500">{b.lotes_codigos.join(', ')}</td>
                      <td>{b.imp_media.toFixed(2)}%</td>
                      <td>{b.pva_media.toFixed(2)}%</td>
                      <td>R$ {b.preco_medio.toFixed(0)}/sc</td>
                      <td>{b.nota_media ? `${b.nota_media.toFixed(1)} / 5` : <span className="text-gray-400 text-xs">—</span>}</td>
                      <td>
                        <span className={b.status.includes('avisos') ? 'badge-warn' : 'badge-ok'}>
                          {b.status}
                        </span>
                        {(b.avisos ?? []).length > 0 && (
                          <div className="text-xs text-[#854F0B] mt-0.5">{b.avisos.join(' | ')}</div>
                        )}
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
