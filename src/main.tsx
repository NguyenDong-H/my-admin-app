// ============================================================
// src/main.tsx — Thêm Provider bọc toàn bộ app
// Chỉ thêm 2 dòng import + bọc Provider, không đổi gì khác
// ============================================================

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'   // ← thêm
import { store }    from './store'        // ← thêm
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>   {/* ← bọc App trong Provider */}
      <App />
    </Provider>
  </React.StrictMode>
)

// Provider làm gì?
// → Truyền store xuống toàn bộ component tree
// → Mọi component dùng useAppSelector/useAppDispatch đều đọc được store
// → Không cần truyền store qua props từng tầng