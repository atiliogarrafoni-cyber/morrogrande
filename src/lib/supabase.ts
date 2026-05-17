import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Liga = {
  id: string
  numero: string
  nome: string
  descricao: string | null
  imp_max: number
  pva_max: number
  preco_min: number
  preco_max: number
  created_at: string
}

export type Lote = {
  id: string
  codigo: string
  data_recebimento: string
  box: string
  origem: string
  sacas: number
  impureza: number
  pva: number
  valor_saca: number
  obs: string | null
  nota_bebida: number
  nota_acidez: number
  nota_corpo: number
  nota_docura: number
  nota_aroma: number
  nota_final: number
  obs_prova: string | null
  usado: boolean
  created_at: string
  updated_at: string
}

export type Blend = {
  id: string
  data_aprovacao: string
  liga_id: string | null
  liga_numero: string
  liga_nome: string
  lotes_ids: string[]
  lotes_codigos: string[]
  imp_media: number
  pva_media: number
  preco_medio: number
  nota_media: number | null
  status: string
  avisos: string[]
  created_at: string
}

export function avgNotas(lote: Partial<Lote>): number {
  const vals = [
    lote.nota_bebida, lote.nota_acidez, lote.nota_corpo,
    lote.nota_docura, lote.nota_aroma, lote.nota_final,
  ].filter((v): v is number => typeof v === 'number' && v > 0)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}
