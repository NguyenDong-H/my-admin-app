// ============================================================
// src/pages/ListPage.tsx — Phiên bản Mantine hoàn chỉnh
// ============================================================

import { useNavigate } from 'react-router-dom'
import {
  Button, Group, Title, Stack, TextInput, Badge,
  Table, ActionIcon, Tooltip, Text, Paper,
  NumberFormatter, Alert, Loader, SimpleGrid,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useItems } from '@/hooks/useFetch'

// ── Stat card nhỏ ─────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Paper p="md" withBorder radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>{label}</Text>
      <Text size="xl" fw={700} c={color} mt={4}>{value}</Text>
    </Paper>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export function ListPage() {
  const navigate        = useNavigate()
  const { items, loading, error, removeItem } = useItems()
  const [search, setSearch] = useState('')

  // Lọc theo search query
  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  // Xoá item + notification
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xoá "${name}"?`)) return
    try {
      await removeItem(id)
      notifications.show({ title: 'Đã xoá', message: `"${name}" đã được xoá`, color: 'red' })
    } catch {
      notifications.show({ title: 'Lỗi', message: 'Không thể xoá sản phẩm', color: 'red' })
    }
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Stack align="center" py={60}>
        <Loader size="md" />
        <Text c="dimmed">Đang tải dữ liệu...</Text>
      </Stack>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Lỗi tải dữ liệu">
        {error}
      </Alert>
    )
  }

  // ── Stats ─────────────────────────────────────────────────
  const activeCount  = items.filter(i => i.status === 'active').length
  const outOfStock   = items.filter(i => i.stock === 0).length
  const totalValue   = items.reduce((s, i) => s + i.price * i.stock, 0)

  // ── Table rows ────────────────────────────────────────────
  const rows = filtered.map(item => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fw={500} size="sm">{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">{item.category}</Badge>
      </Table.Td>
      <Table.Td>
        <NumberFormatter value={item.price} thousandSeparator="," suffix=" ₫" />
      </Table.Td>
      <Table.Td>
        <Text c={item.stock === 0 ? 'red' : 'inherit'} size="sm">
          {item.stock === 0 ? 'Hết hàng' : item.stock}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={item.status === 'active' ? 'green' : 'gray'}>
          {item.status === 'active' ? 'Đang bán' : 'Ngưng bán'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Chỉnh sửa">
            <ActionIcon
              variant="light" color="blue"
              onClick={() => navigate(`/items/${item.id}/edit`)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Xoá">
            <ActionIcon
              variant="light" color="red"
              onClick={() => handleDelete(item.id, item.name)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="lg">

      {/* Stats */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatCard label="Tổng"       value={items.length}  color="blue" />
        <StatCard label="Đang bán"   value={activeCount}   color="green" />
        <StatCard label="Hết hàng"   value={outOfStock}    color="red" />
        <StatCard
          label="Tổng giá trị"
          value={`${(totalValue / 1_000_000).toFixed(0)}M ₫`}
          color="violet"
        />
      </SimpleGrid>

      {/* Toolbar */}
      <Group justify="space-between">
        <Title order={2}>📦 Sản phẩm</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('/items/new')}
        >
          Thêm mới
        </Button>
      </Group>

      {/* Search */}
      <TextInput
        placeholder="Tìm theo tên hoặc danh mục..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        w={{ base: '100%', sm: 300 }}
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <Text c="dimmed" ta="center" py={40}>
          Không có sản phẩm nào {search && `khớp với "${search}"`}
        </Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tên</Table.Th>
              <Table.Th>Danh mục</Table.Th>
              <Table.Th>Giá</Table.Th>
              <Table.Th>Tồn kho</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Thao tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Stack>
  )
}