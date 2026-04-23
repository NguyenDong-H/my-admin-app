// ============================================================
// src/api/itemApi.ts
// Tách toàn bộ logic gọi API ra khỏi component
// ============================================================

import axios from 'axios'

// ── 1. Tạo axios instance với config mặc định ────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── 2. Request Interceptor ────────────────────────────────────
// Chạy TRƯỚC mỗi request — dùng để đính kèm token auth
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── 3. Response Interceptor ───────────────────────────────────
// Chạy SAU mỗi response — xử lý lỗi tập trung
client.interceptors.response.use(
  (response) => response,   // 2xx → trả về bình thường
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token hết hạn → xoá token, redirect login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    if (status === 403) {
      console.error('Không có quyền truy cập')
    }

    if (status >= 500) {
      console.error('Lỗi server — thử lại sau')
    }

    return Promise.reject(error)
  }
)

// ── 4. TypeScript types ───────────────────────────────────────
export interface Item {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  description?: string
}

export type CreateItemDto = Omit<Item, 'id'>
export type UpdateItemDto = Partial<CreateItemDto>

// ── Mock data ban đầu ─────────────────────────────────────────
const SEED: Item[] = [
  { id: 1, name: 'Laptop Pro X',    category: 'Electronics', price: 25000000, stock: 15, status: 'active' },
  { id: 2, name: 'Wireless Mouse',  category: 'Accessories', price: 350000,   stock: 80, status: 'active' },
  { id: 3, name: 'USB-C Hub',       category: 'Accessories', price: 600000,   stock: 0,  status: 'inactive' },
  { id: 4, name: 'Ức gà chiên nước mắm', category: 'Food & Beverage', price: 600000, stock: 40, status: 'active' },
]

// ── localStorage helpers ──────────────────────────────────────
const LS_KEY = 'admin_items'
const delay  = (ms = 400) => new Promise(r => setTimeout(r, ms))  // giả lập độ trễ network

function getDB(): Item[] {
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(SEED))
    return SEED
  }
  return JSON.parse(raw)
}

function saveDB(items: Item[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

// ── API functions ─────────────────────────────────────────────
export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    await delay()
    return getDB()
  },
//   getAll: async () => {
//     const res = await client.get<Item[]>('/items')
//     return res.data
// },
  getById: async (id: number): Promise<Item> => {
    await delay(200)
    const item = getDB().find(i => i.id === id)
    if (!item) throw new Error(`Không tìm thấy item #${id}`)
    return item
  },
 
  create: async (body: CreateItemDto): Promise<Item> => {
    await delay()
    const items  = getDB()
    const newItem: Item = { ...body, id: Date.now() }
    saveDB([...items, newItem])
    return newItem
  },
 
  update: async (id: number, body: UpdateItemDto): Promise<Item> => {
    await delay()
    const items   = getDB()
    const updated = items.map(i => i.id === id ? { ...i, ...body } : i)
    saveDB(updated)
    return updated.find(i => i.id === id)!
  },
 
  remove: async (id: number): Promise<void> => {
    await delay(200)
    saveDB(getDB().filter(i => i.id !== id))
  },
}
 
