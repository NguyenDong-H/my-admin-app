// ============================================================
// src/components/ItemForm.tsx — Phiên bản Mantine
// Xoá toàn bộ inline style, dùng Mantine components
// ============================================================

import { useEffect } from 'react'
import {
  TextInput, NumberInput, Select, Textarea,
  Button, Group, Stack, Paper, Title, Badge, SegmentedControl,
} from '@mantine/core'
import { useForm }         from '@mantine/form'
import { notifications }   from '@mantine/notifications'

// ── Types ─────────────────────────────────────────────────────
interface ItemFormData {
  name:        string
  category:    string
  price:       number
  stock:       number
  status:      'active' | 'inactive'
  description?: string
}

interface EditItem extends ItemFormData { id: number }

interface ItemFormProps {
  editItem?: EditItem | null
  loading?:  boolean
  onSubmit:  (data: ItemFormData) => Promise<void> | void
  onCancel:  () => void
}

// ── Component ─────────────────────────────────────────────────
export function ItemForm({ editItem, loading, onSubmit, onCancel }: ItemFormProps) {
  const isEditing = Boolean(editItem)

  // ── Mantine useForm — thay thế hoàn toàn cho useState thủ công ──
  const form = useForm<ItemFormData>({
    initialValues: {
      name:        '',
      category:    '',
      price:       0,
      stock:       0,
      status:      'active',
      description: '',
    },
    validate: {
      name:     (v) => v.trim().length < 2 ? 'Tên phải có ít nhất 2 ký tự' : null,
      category: (v) => !v ? 'Vui lòng chọn danh mục' : null,
      price:    (v) => v <= 0 ? 'Giá phải lớn hơn 0' : null,
      stock:    (v) => v < 0 ? 'Số lượng không được âm' : null,
    },
  })

  // ── Điền sẵn khi sửa — 1 lần gọi setValues, không lỗi ──────
  useEffect(() => {
    if (editItem) {
      form.setValues({
        name:        editItem.name,
        category:    editItem.category,
        price:       editItem.price,
        stock:       editItem.stock,
        status:      editItem.status,
        description: editItem.description ?? '',
      })
    } else {
      form.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem?.id])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (values: ItemFormData) => {
    try {
      await onSubmit(values)
      notifications.show({
        title: isEditing ? 'Cập nhật thành công' : 'Thêm thành công',
        message: `"${values.name}" đã được ${isEditing ? 'cập nhật' : 'thêm vào danh sách'}`,
        color: 'green',
      })
    } catch (err: unknown) {
      notifications.show({
        title: 'Có lỗi xảy ra',
        message: err instanceof Error ? err.message : 'Thử lại sau',
        color: 'red',
      })
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <Paper p="xl" radius="md" withBorder>

      {/* Header */}
      <Group mb="lg">
        <Title order={3}>
          {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </Title>
        <Badge color={isEditing ? 'orange' : 'green'} variant="light">
          {isEditing ? 'Edit' : 'New'}
        </Badge>
      </Group>

      {/* form.onSubmit tự validate trước khi gọi handleSubmit */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">

          {/* Tên */}
          <TextInput
            label="Tên sản phẩm"
            placeholder="VD: Laptop Pro X"
            required
            {...form.getInputProps('name')}
            // getInputProps tự bind: value, onChange, onBlur, error
          />

          {/* Danh mục */}
          <Select
            label="Danh mục"
            placeholder="Chọn danh mục"
            required
            data={['Electronics', 'Accessories', 'Clothing', 'Food & Beverage']}
            {...form.getInputProps('category')}
          />

          {/* Giá + Tồn kho — 2 cột */}
          <Group grow>
            <NumberInput
              label="Giá (VNĐ)"
              required
              min={0}
              thousandSeparator=","
              suffix=" ₫"
              {...form.getInputProps('price')}
            />
            <NumberInput
              label="Tồn kho"
              min={0}
              {...form.getInputProps('stock')}
            />
          </Group>

          {/* Trạng thái — dùng SegmentedControl thay radio */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--mantine-color-text)' }}>
              Trạng thái
            </p>
            <SegmentedControl
              data={[
                { value: 'active',   label: '✅ Đang bán'  },
                { value: 'inactive', label: '⛔ Ngưng bán' },
              ]}
              {...form.getInputProps('status')}
            />
          </div>

          {/* Mô tả */}
          <Textarea
            label="Mô tả (tuỳ chọn)"
            placeholder="Nhập mô tả ngắn..."
            rows={2}
            {...form.getInputProps('description')}
          />

          {/* Buttons */}
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Huỷ
            </Button>
            <Button
              type="submit"
              loading={loading}
              color={isEditing ? 'orange' : 'blue'}
            >
              {isEditing ? '💾 Lưu thay đổi' : '➕ Thêm mới'}
            </Button>
          </Group>

        </Stack>
      </form>
    </Paper>
  )
}