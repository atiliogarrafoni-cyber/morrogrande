'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coffee, PackagePlus, Box, GitMerge, ClipboardCheck, Settings } from 'lucide-react'

const links = [
  { href: '/',           label: 'Receber Lote',  icon: PackagePlus },
  { href: '/estoque',    label: 'Estoque',        icon: Box },
  { href: '/blend',      label: 'Criar Blend',    icon: GitMerge },
  { href: '/historico',  label: 'Histórico',      icon: ClipboardCheck },
  { href: '/ligas',      label: 'Ligas',          icon: Settings },
]

export default function Nav() {
  const path = usePathname()
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-14 gap-6">
          <div className="flex items-center gap-2 font-semibold text-[#3B6D11] shrink-0">
            <Coffee size={20} />
            <span>CaféReg</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {links.map(({ href, label, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#EAF3DE] text-[#3B6D11] font-medium'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
