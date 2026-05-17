'use client'

interface StarsProps {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: number
}

export function Stars({ value, onChange, readOnly, size = 20 }: StarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => !readOnly && onChange?.(n)}
          style={{ fontSize: size, cursor: readOnly ? 'default' : 'pointer', color: n <= value ? '#EF9F27' : '#d1d5db', lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function StarsDisplay({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-gray-400">Sem avaliação</span>
  return (
    <span className="flex items-center gap-1">
      <Stars value={Math.round(value)} readOnly size={14} />
      <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
    </span>
  )
}
