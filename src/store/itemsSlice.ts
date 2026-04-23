// ============================================================
// src/store/itemsSlice.ts
// Slice = state + actions + async thunks cho items
// ============================================================

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { itemApi, type Item, type CreateItemDto } from '@/api/itemApi'

// ── 1. Định nghĩa shape của state ─────────────────────────────
interface ItemsState {
  items:        Item[]
  loading:      boolean
  error:        string | null
  selectedItem: Item | null    // item đang được sửa
}

const initialState: ItemsState = {
  items:        [],
  loading:      false,
  error:        null,
  selectedItem: null,
}

// ── 2. Async Thunks — gọi API ──────────────────────────────────
// createAsyncThunk tự tạo 3 action types:
// items/fetchAll/pending, items/fetchAll/fulfilled, items/fetchAll/rejected

export const fetchItems = createAsyncThunk(
  'items/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await itemApi.getAll()
    } catch (e: unknown) {
      // rejectWithValue: truyền error message vào action.payload
      return rejectWithValue((e as Error).message)
    }
  }
)

export const addItem = createAsyncThunk(
  'items/add',
  async (dto: CreateItemDto, { rejectWithValue }) => {
    try {
      return await itemApi.create(dto)
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const updateItem = createAsyncThunk(
  'items/update',
  async ({ id, dto }: { id: number; dto: Partial<CreateItemDto> }, { rejectWithValue }) => {
    try {
      return await itemApi.update(id, dto)
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const removeItem = createAsyncThunk(
  'items/remove',
  async (id: number, { rejectWithValue }) => {
    try {
      await itemApi.remove(id)
      return id    // trả về id để reducer biết xoá cái nào
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message)
    }
  }
)

// ── 3. Slice ──────────────────────────────────────────────────
const itemsSlice = createSlice({
  name: 'items',
  initialState,

  // reducers: actions đồng bộ (synchronous)
  reducers: {
    setSelectedItem(state, action: PayloadAction<Item | null>) {
      state.selectedItem = action.payload
      // Redux Toolkit dùng Immer bên dưới
      // → được phép "mutate" trực tiếp, Immer tự tạo object mới
    },
    clearError(state) {
      state.error = null
    },
  },

  // extraReducers: xử lý async thunk
  extraReducers: (builder) => {

    // ── fetchItems ──────────────────────────────────────────
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        state.items   = action.payload
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })

    // ── addItem ─────────────────────────────────────────────
    builder
      .addCase(addItem.pending,    (state) => { state.loading = true })
      .addCase(addItem.fulfilled,  (state, action) => {
        state.loading = false
        state.items.push(action.payload)   // Immer cho phép push trực tiếp!
      })
      .addCase(addItem.rejected,   (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })

    // ── updateItem ──────────────────────────────────────────
    builder
      .addCase(updateItem.pending,    (state) => { state.loading = true })
      .addCase(updateItem.fulfilled,  (state, action) => {
        state.loading = false
        const idx = state.items.findIndex(i => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload   // Immer xử lý
      })
      .addCase(updateItem.rejected,   (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })

    // ── removeItem ──────────────────────────────────────────
    builder
      .addCase(removeItem.pending,    (state) => { state.loading = true })
      .addCase(removeItem.fulfilled,  (state, action) => {
        state.loading = false
        state.items   = state.items.filter(i => i.id !== action.payload)
      })
      .addCase(removeItem.rejected,   (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })
  },
})

export const { setSelectedItem, clearError } = itemsSlice.actions
export default itemsSlice.reducer

// ============================================================
// IMMER — tại sao được phép mutate trong Redux Toolkit:
//
// Redux Toolkit dùng thư viện Immer bên dưới.
// Immer "theo dõi" mọi thay đổi bạn làm trên state
// → tự tạo ra object mới bất biến sau khi reducer chạy xong
//
// Vì vậy trong slice này:
//   state.items.push(x)        ← OK (Immer xử lý)
//   state.items[idx] = y       ← OK
//   state.loading = false      ← OK
//
// Nhưng bên ngoài slice (trong component):
//   items.push(x)              ← VẪN SAI như cũ!
// ============================================================