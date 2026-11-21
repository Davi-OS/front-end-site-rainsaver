// Shared look of text-like form controls (Input, Select). The border is
// slate-500 (4.8:1 on white) so the control boundary meets the 3:1 minimum for
// UI components; errors switch to red-600 and are also announced in text.
export const FIELD_LABEL_CLASSES = 'text-sm font-medium text-slate-700'

export function fieldClasses(hasError: boolean): string {
  return `min-h-11 rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 disabled:bg-slate-100 disabled:text-slate-600 ${
    hasError ? 'border-red-600' : 'border-slate-500'
  }`
}

export const FIELD_ERROR_CLASSES = 'text-xs font-medium text-red-700'
