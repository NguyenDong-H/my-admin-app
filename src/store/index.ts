// ============================================================
// src/store/index.ts
// Tạo Redux store — kết hợp tất cả reducers
// ============================================================

import { configureStore } from '@reduxjs/toolkit'
import itemsReducer from './itemsSlice'

export const store = configureStore({
  reducer: {
    items: itemsReducer,
    // Thêm reducer khác ở đây: users: usersReducer, ...
  },
})

// ── TypeScript helpers ─────────────────────────────────────────
// Lấy kiểu tự động từ store — không cần viết tay
export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch