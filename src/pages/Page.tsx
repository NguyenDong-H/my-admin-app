// ============================================================
// src/pages/ListPage.tsx — Dùng Redux thay useItems()
// ============================================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button, Group, Title, Stack, TextInput, Badge,
  Table, ActionIcon, Tooltip, Text, Paper,
  NumberFormatter, Alert, Loader, SimpleGrid,
} from '@mantine/core'
import { notifications }                     from '@mantine/notifications'
import { IconPlus, IconSearch, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react'
import { useAppDispatch, useAppSelector }    from '@/hooks/reduxHooks'
import { fetchItems, removeItem }            from '@/store/itemsSlice'

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Paper p="md" withBorder radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>{label}</Text>
      <Text size="xl" fw={700} c={color} mt={4}>{value}</Text>
    </Paper>
  )
}

export function ListPage() {
  const navigate  = useNavigate()
  const dispatch  = useAppDispatch()

  // ── Đọc state từ Redux store ──────────────────────────────
  const items   = useAppSelector(state => state.items.items)
  const loading = useAppSelector(state => state.items.loading)
  const error   = useAppSelector(state => state.items.error)

  const [search, setSearch] = useState('')

  // Fetch khi mount — chỉ fetch 1 lần nếu chưa có data
  useEffect(() => {
    if (items.length === 0) dispatch(fetchItems())
  }, [dispatch, items.length])

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xoá "${name}"?`)) return
    try {
      await dispatch(removeItem(id)).unwrap()
      // .unwrap() throw error nếu bị rejected → catch bên dưới bắt được
      notifications.show({ title: 'Đã xoá', message: `"${name}" đã được xoá`, color: 'red' })
    } catch {
      notifications.show({ title: 'Lỗi', message: 'Không thể xoá sản phẩm', color: 'red' })
    }
  }

  if (loading) return <Stack align="center" py={60}><Loader /><Text c="dimmed">Đang tải...</Text></Stack>
  if (error)   return <Alert icon={<IconAlertCircle size={16} />} color="red">{error}</Alert>

  const activeCount = items.filter(i => i.status === 'active').length
  const outOfStock  = items.filter(i => i.stock === 0).length
  const totalValue  = items.reduce((s, i) => s + i.price * i.stock, 0)

  const rows = filtered.map(item => (
    <Table.Tr key={item.id}>
      <Table.Td><Text fw={500} size="sm">{item.name}</Text></Table.Td>
      <Table.Td><Badge variant="light">{item.category}</Badge></Table.Td>
      <Table.Td><NumberFormatter value={item.price} thousandSeparator="," suffix=" ₫" /></Table.Td>
      <Table.Td><Text c={item.stock === 0 ? 'red' : 'inherit'} size="sm">{item.stock === 0 ? 'Hết hàng' : item.stock}</Text></Table.Td>
      <Table.Td><Badge color={item.status === 'active' ? 'green' : 'gray'}>{item.status === 'active' ? 'Đang bán' : 'Ngưng bán'}</Badge></Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Sửa">
            <ActionIcon variant="light" color="blue" onClick={() => navigate(`/items/${item.id}/edit`)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Xoá">
            <ActionIcon variant="light" color="red" onClick={() => handleDelete(item.id, item.name)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatCard label="Tổng"         value={items.length}  color="blue" />
        <StatCard label="Đang bán"     value={activeCount}   color="green" />
        <StatCard label="Hết hàng"     value={outOfStock}    color="red" />
        <StatCard label="Tổng giá trị" value={`${(totalValue / 1_000_000).toFixed(0)}M ₫`} color="violet" />
      </SimpleGrid>

      <Group justify="space-between">
        <Title order={2}>📦 Sản phẩm</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/items/new')}>Thêm mới</Button>
      </Group>

      <TextInput
        placeholder="Tìm theo tên hoặc danh mục..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        w={{ base: '100%', sm: 300 }}
      />

      {filtered.length === 0
        ? <Text c="dimmed" ta="center" py={40}>Không có sản phẩm nào</Text>
        : (
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
        )
      }
    </Stack>
  )
}

// ============================================================
// src/pages/AddPage.tsx — Dùng Redux
// ============================================================

import { useNavigate as useNav2 }         from 'react-router-dom'
import { Anchor, Breadcrumbs } from '@mantine/core'
import { notifications as notif2 }        from '@mantine/notifications'
import { useAppDispatch as useDisp2 }     from '@/hooks/reduxHooks'
import { addItem }                        from '@/store/itemsSlice'
import { ItemForm }                       from '@/components/ItemForm'
import { Link }                           from 'react-router-dom'

export function AddPage() {
  const navigate = useNav2()
  const dispatch = useDisp2()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      await dispatch(addItem(data)).unwrap()  // ghi vào Redux store + localStorage
      notif2.show({ title: 'Thêm thành công!', message: `"${data.name}" đã được thêm`, color: 'green' })
      navigate('/items')
    } catch {
      notif2.show({ title: 'Lỗi!', message: 'Không thể thêm sản phẩm', color: 'red' })
    }
  }

  return (
    <Stack gap="lg">
      <Breadcrumbs>
        <Anchor component={Link} to="/items">Sản phẩm</Anchor>
        <span>Thêm mới</span>
      </Breadcrumbs>
      <Title order={2}>Thêm sản phẩm mới</Title>
      <ItemForm onSubmit={handleSubmit} onCancel={() => navigate('/items')} />
    </Stack>
  )
}

// ============================================================
// src/pages/EditPage.tsx — Dùng Redux
// ============================================================

import { useEffect as useEff3, useState as useSt3 } from 'react'
import { useNavigate as useNav3, useParams, Link as RLink } from 'react-router-dom'
import { Loader as MLoader, Text as MText } from '@mantine/core'
import { notifications as notif3 }    from '@mantine/notifications'
import { useAppDispatch as useDisp3, useAppSelector as useSel3 } from '@/hooks/reduxHooks'
import { fetchItems as fetchAll3, updateItem } from '@/store/itemsSlice'
import { ItemForm as IForm }           from '@/components/ItemForm'
import type { Item }                   from '@/api/itemApi'

export function EditPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNav3()
  const dispatch = useDisp3()

  // ── Tất cả hooks ở ĐÂY — trước mọi return ────────────────
  const items   = useSel3(state => state.items.items)
  const loading = useSel3(state => state.items.loading)
  const [item, setItem]       = useSt3<Item | null>(null)
  const [notFound, setNotFound] = useSt3(false)

  useEff3(() => {
    // Nếu store chưa có items → fetch trước
    const load = async () => {
      let list = items
      if (list.length === 0) {
        const result = await dispatch(fetchAll3()).unwrap()
        list = result
      }
      const found = list.find(i => i.id === Number(id))
      if (found) setItem(found)
      else setNotFound(true)
    }
    load()
  }, [id])  // eslint-disable-line

  // ── Conditional return SAU tất cả hooks ──────────────────
  if (loading && !item) return <MLoader />
  if (notFound) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <MText c="red" mb="md">Không tìm thấy sản phẩm #{id}</MText>
      <RLink to="/items" style={{ color: 'var(--mantine-color-blue-6)' }}>← Về danh sách</RLink>
    </div>
  )
  if (!item) return <MLoader />

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      await dispatch(updateItem({ id: Number(id), dto: data })).unwrap()
      notif3.show({ title: 'Cập nhật thành công!', message: `"${data.name}" đã được lưu`, color: 'green' })
      navigate('/items')
    } catch {
      notif3.show({ title: 'Lỗi!', message: 'Không thể cập nhật', color: 'red' })
    }
  }

  return (
    <Stack gap="lg">
      <Breadcrumbs>
        <Anchor component={RLink} to="/items">Sản phẩm</Anchor>
        <span>Sửa: {item.name}</span>
      </Breadcrumbs>
      <Title order={2}>Chỉnh sửa sản phẩm</Title>
      <IForm editItem={item} onSubmit={handleSubmit} onCancel={() => navigate('/items')} />
    </Stack>
  )
}