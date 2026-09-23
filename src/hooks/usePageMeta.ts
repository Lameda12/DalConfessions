import { useEffect } from 'react'

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content') ?? undefined

    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = prevTitle
      if (meta && prevDescription !== undefined) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])
}
