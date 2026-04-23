// ============================================================
// src/hooks/reduxHooks.ts
// Typed hooks — dùng thay cho useDispatch/useSelector trực tiếp
// ============================================================

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'

// Dùng 2 hook này trong mọi component thay vì import useDispatch/useSelector
// → TypeScript tự hiểu kiểu, không cần cast thủ công

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// ── Cách dùng trong component ─────────────────────────────────
//
// import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks'
//
// const dispatch = useAppDispatch()
// const items    = useAppSelector(state => state.items.items)
// const loading  = useAppSelector(state => state.items.loading)
//
// dispatch(fetchItems())
// dispatch(addItem(formData))
// dispatch(removeItem(id))