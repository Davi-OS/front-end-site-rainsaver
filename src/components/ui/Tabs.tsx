import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  key: string
  label: string
  content: ReactNode
}

interface TabsProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}

// WAI-ARIA tabs with automatic activation: arrows/Home/End move focus and
// select; only the active tab is in the tab order.
export function Tabs({ items, activeKey, onChange }: TabsProps) {
  const baseId = useId()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const active = items.find((item) => item.key === activeKey) ?? items[0]

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else return

    event.preventDefault()
    const key = items[next].key
    onChange(key)
    tabRefs.current[key]?.focus()
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-slate-200">
        {items.map((item, index) => {
          const selected = item.key === active.key
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[item.key] = el
              }}
              id={`${baseId}-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`-mb-px min-h-11 border-b-2 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 ${
                selected
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.key}`}
        aria-labelledby={`${baseId}-tab-${active.key}`}
        className="pt-4"
      >
        {active.content}
      </div>
    </div>
  )
}
