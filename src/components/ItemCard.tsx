// ============================================================
// src/components/ItemCard.tsx — Giai đoạn 3
// Thêm nút Xoá + Sửa — gọi callback lên parent
// ============================================================

interface ItemCardProps {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  description?: string

  // Callback functions — parent truyền xuống, child gọi khi cần
  // (Đây là cách child "báo" ngược lên parent)
  onDelete: (id: number) => void
  onEdit: (item: ItemCardProps) => void
}

function ItemCard(props: ItemCardProps) {
  const { id, name, category, price, stock, status, description, onDelete, onEdit } = props

  const isActive = status === 'active'
  const isOutOfStock = stock === 0
  const formattedPrice = price.toLocaleString('vi-VN') + ' ₫'

  // ── Handler xoá: xác nhận → gọi callback lên parent ───────
  const handleDelete = () => {
    // window.confirm mở hộp thoại xác nhận
    const confirmed = window.confirm(`Xoá sản phẩm "${name}"?`)
    if (confirmed) {
      onDelete(id)   // ← gọi hàm của parent, truyền id lên
      // Parent nhận id → lọc bỏ item này khỏi state → React re-render
    }
  }

  // ── Handler sửa: truyền toàn bộ item lên parent ────────────
  const handleEdit = () => {
    onEdit(props)   // ← gọi hàm của parent, truyền toàn bộ props lên
    // Parent nhận item → đặt vào editingItem state → mở form
  }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: isActive ? '#fff' : '#f9f9f9',
    }}>
      {/* ── Row 1: Tên + Badge + Buttons ─────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{name}</h3>
          <span style={{
            padding: '2px 10px', borderRadius: '20px', fontSize: '12px',
            backgroundColor: isActive ? '#d4edda' : '#f8d7da',
            color: isActive ? '#155724' : '#721c24',
          }}>
            {isActive ? '✅ Đang bán' : '⛔ Ngưng bán'}
          </span>
        </div>

        {/* ── Action buttons ────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleEdit}
            style={{
              padding: '4px 12px', borderRadius: '6px',
              border: '1px solid #007bff', backgroundColor: 'transparent',
              color: '#007bff', cursor: 'pointer', fontSize: '13px',
            }}
          >
            ✏️ Sửa
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '4px 12px', borderRadius: '6px',
              border: '1px solid #dc3545', backgroundColor: 'transparent',
              color: '#dc3545', cursor: 'pointer', fontSize: '13px',
            }}
          >
            🗑️ Xoá
          </button>
        </div>
      </div>

      {/* ── Row 2: Chi tiết ───────────────────────────────── */}
      <p style={{ color: '#666', fontSize: '13px', margin: '10px 0 4px' }}>
        📁 {category}
      </p>

      {description && (
        <p style={{ color: '#888', fontSize: '13px', margin: '4px 0' }}>
          {description}
        </p>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>💰 {formattedPrice}</span>
        <span style={{ color: isOutOfStock ? '#dc3545' : '#28a745' }}>
          📦 {isOutOfStock ? 'Hết hàng!' : `Còn ${stock} cái`}
        </span>
      </div>
    </div>
  )
}

export default ItemCard

// ============================================================
// LUỒNG XOÁ ITEM — quan trọng cần hiểu:
//
// 1. User click nút "Xoá" trên ItemCard (child)
// 2. handleDelete() chạy → hỏi confirm
// 3. Nếu OK → gọi onDelete(id) — callback từ parent
// 4. Parent (App.tsx) nhận id:
//    handleDeleteItem(id) chạy:
//    setItems(prev => prev.filter(item => item.id !== id))
// 5. items state thay đổi → React re-render App
// 6. .map() chạy lại với mảng mới (không có item bị xoá)
// 7. ItemCard của item đó biến mất khỏi màn hình ✅
//
// KEY INSIGHT: Child KHÔNG tự xoá mình được!
// Child chỉ "báo" lên Parent → Parent quyết định xoá state
// ============================================================