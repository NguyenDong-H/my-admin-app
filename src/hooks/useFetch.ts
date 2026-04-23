// ============================================================
// src/hooks/useFetch.ts
// Custom hook — tái sử dụng logic gọi API ở mọi component
// ============================================================

import { useState, useEffect, useCallback } from 'react'

// ── Hook 1: useFetch — GET đơn giản ──────────────────────────
// Dùng khi: cần load data từ URL, tự động fetch khi mount
//
// Ví dụ:
//   const { data, loading, error } = useFetch<Item[]>('/api/items')

export function useFetch<T>(url: string) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    // Flag tránh setState sau khi component đã unmount
    // (React 18 strict mode mount 2 lần → cần cleanup này)
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(url)

        // ⚠️ fetch KHÔNG tự throw khi status 4xx/5xx!
        // Phải kiểm tra res.ok thủ công
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        const json: T = await res.json()
        if (!cancelled) setData(json)

      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Lỗi không xác định'
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    // Cleanup function — chạy khi:
    // 1. Component unmount
    // 2. url thay đổi (trước khi effect mới chạy)
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}

// ── Hook 2: useAsync — cho mọi async operation ───────────────
// Dùng khi: cần gọi API thủ công (POST, PUT, DELETE)
//           hoặc cần control khi nào fetch
//
// Ví dụ:
//   const { execute, loading, error } = useAsync(itemApi.create)
//   <button onClick={() => execute(formData)}>Thêm</button>

export function useAsync<TArgs extends unknown[], TReturn>(
  asyncFn: (...args: TArgs) => Promise<TReturn>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [data, setData]       = useState<TReturn | null>(null)

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await asyncFn(...args)
        setData(result)
        return result
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Lỗi không xác định'
        setError(msg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [asyncFn]
  )

  return { execute, loading, error, data }
}

// ── Hook 3: useItems — custom hook domain-specific ───────────
// Bọc toàn bộ logic CRUD cho items
// Component không cần biết gì về API hay state management

import { itemApi, type Item, type CreateItemDto } from '@/api/itemApi'

export function useItems() {
  const [items, setItems]     = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Fetch tất cả items
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await itemApi.getAll()
      setItems(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setLoading(false)
    }
  }, [])

  // Tự fetch khi hook được dùng lần đầu
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  const addItem = async (dto: CreateItemDto) => {
    const created = await itemApi.create(dto)
    setItems(prev => [...prev, created])   // optimistic update
    return created
  }

  const updateItem = async (id: number, dto: Partial<CreateItemDto>) => {
    const updated = await itemApi.update(id, dto)
    setItems(prev => prev.map(i => i.id === id ? updated : i))
    return updated
  }

  const removeItem = async (id: number) => {
    await itemApi.remove(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return {
    items, loading, error,
    fetchAll,
    addItem,
    updateItem,
    removeItem,
  }
}