import React, { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const DEFAULT_MD = `# Welcome to Markdown Editor

## Features
- **Live preview** — see changes instantly
- *Syntax highlighting* — beautiful code blocks
- 💾 **Auto-save** — never lose your work
- 📋 **Copy** — copy markdown or HTML
- 🌙 **Dark mode** — easy on the eyes

## Code Example
\`\`\`typescript
const greet = (name: string): string => {
  return \`Hello, \${name}!\`
}
console.log(greet('Kenza'))
\`\`\`

## Table
| Language | Type | Usage |
|----------|------|-------|
| TypeScript | Static | Frontend/Backend |
| Java | Static | Enterprise |
| Python | Dynamic | AI/Data |

> "The best code is the code that doesn't need to be written." — Anonymous

---
Start typing to edit this document!
`

const STORAGE_KEY = 'md-editor-content'

marked.setOptions({ gfm: true, breaks: true })

export default function App() {
  const [md, setMd] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_MD)
  const [dark, setDark] = useState(false)
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split')
  const [copied, setCopied] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const html = DOMPurify.sanitize(marked(md) as string)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, md)
    setWordCount(md.trim().split(/\s+/).filter(Boolean).length)
  }, [md])

  const copy = useCallback((type: 'md' | 'html') => {
    navigator.clipboard.writeText(type === 'md' ? md : html)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }, [md, html])

  const download = useCallback(() => {
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.md'; a.click()
    URL.revokeObjectURL(url)
  }, [md])

  const reset = () => { if (confirm('Reset to default content?')) setMd(DEFAULT_MD) }

  const bg = dark ? '#0d1117' : '#f6f8fa'
  const surface = dark ? '#161b22' : '#ffffff'
  const border = dark ? '#30363d' : '#d0d7de'
  const text = dark ? '#e6edf3' : '#1f2328'
  const muted = dark ? '#8b949e' : '#656d76'

  const s = {
    app: { display: 'flex', flexDirection: 'column' as const, height: '100vh', background: bg, color: text, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
    toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: `1px solid ${border}`, background: surface, flexWrap: 'wrap' as const },
    toolBtn: (active = false) => ({ padding: '5px 12px', border: `1px solid ${active ? '#388bfd' : border}`, borderRadius: 6, background: active ? dark ? '#1f6feb' : '#ddf4ff' : 'transparent', color: active ? '#388bfd' : text, cursor: 'pointer', fontSize: 13, fontWeight: 500 }),
    main: { display: 'flex', flex: 1, overflow: 'hidden' },
    pane: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', borderRight: `1px solid ${border}` },
    textarea: { flex: 1, border: 'none', outline: 'none', padding: '20px', fontFamily: '"Fira Code","Cascadia Code",monospace', fontSize: 14, lineHeight: 1.7, resize: 'none' as const, background: bg, color: text, overflowY: 'auto' as const },
    preview: { flex: 1, padding: '20px 28px', overflowY: 'auto' as const, lineHeight: 1.7, fontSize: 15 },
    statusBar: { padding: '4px 16px', background: surface, borderTop: `1px solid ${border}`, fontSize: 12, color: muted, display: 'flex', gap: 20 },
  }

  return (
    <div style={s.app}>
      <div style={s.toolbar}>
        <span style={{ fontWeight: 700, fontSize: 15, marginRight: 8, color: '#388bfd' }}>MD Editor</span>
        {(['split', 'edit', 'preview'] as const).map(v => (
          <button key={v} style={s.toolBtn(view === v)} onClick={() => setView(v)}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.toolBtn()} onClick={() => copy('md')}>{copied === 'md' ? '✓ Copied!' : 'Copy MD'}</button>
        <button style={s.toolBtn()} onClick={() => copy('html')}>{copied === 'html' ? '✓ Copied!' : 'Copy HTML'}</button>
        <button style={s.toolBtn()} onClick={download}>↓ Download</button>
        <button style={s.toolBtn()} onClick={reset}>Reset</button>
        <button style={s.toolBtn(dark)} onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
      </div>

      <div style={s.main}>
        {(view === 'split' || view === 'edit') && (
          <div style={{ ...s.pane, borderRight: view === 'split' ? `1px solid ${border}` : 'none' }}>
            <div style={{ padding: '6px 16px', background: surface, borderBottom: `1px solid ${border}`, fontSize: 12, color: muted }}>MARKDOWN</div>
            <textarea style={s.textarea} value={md} onChange={e => setMd(e.target.value)} spellCheck={false} />
          </div>
        )}
        {(view === 'split' || view === 'preview') && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 16px', background: surface, borderBottom: `1px solid ${border}`, fontSize: 12, color: muted }}>PREVIEW</div>
            <div style={s.preview} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>

      <div style={s.statusBar}>
        <span>{wordCount} words</span>
        <span>{md.length} characters</span>
        <span>{md.split('\n').length} lines</span>
        <span style={{ marginLeft: 'auto' }}>Auto-saved ✓</span>
      </div>
    </div>
  )
}
