// ============================================================
// src/App.tsx — Mantine AppShell + React Router kết hợp
// ============================================================

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import {
  MantineProvider, AppShell, Burger, Group, Title,
  NavLink, Text, Badge, ActionIcon, Tooltip, createTheme,
} from '@mantine/core'
import { Notifications, notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import { IconList, IconPlus, IconMoon, IconSun } from '@tabler/icons-react'
import { ListPage }  from './pages/ListPage'
import { AddPage } from './pages/Page'
import { EditPage } from './pages/Page'

// ── Custom theme (tuỳ chỉnh màu sắc, font...) ────────────────
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
})

// ── Nav items ─────────────────────────────────────────────────
const NAV = [
  { to: '/items',     icon: IconList,  label: 'Danh sách' },
  { to: '/items/new', icon: IconPlus,  label: 'Thêm mới'  },
]

// ── Sidebar component ─────────────────────────────────────────
function Sidebar() {
  const location = useLocation()

  return (
    <>
      <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs" px="xs">
        Menu
      </Text>
      {NAV.map(item => (
        <NavLink
          key={item.to}
          component={Link}
          to={item.to}
          label={item.label}
          leftSection={<item.icon size={18} />}
          active={location.pathname.startsWith(item.to)}
          mb={4}
        />
      ))}
    </>
  )
}

// ── Shell — layout AppShell + Routes ─────────────────────────
function Shell() {
  const [opened, { toggle }]     = useDisclosure()
  const [isDark, setIsDark]      = useState(false)

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* ── Header ───────────────────────────────────────── */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* Hamburger menu — chỉ hiện trên mobile */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>⚡ AdminApp</Title>
          </Group>

          <Group gap="sm">
            <Badge variant="light" color="blue">v1.0</Badge>
            <Tooltip label={isDark ? 'Light mode' : 'Dark mode'}>
              <ActionIcon variant="default" onClick={() => setIsDark(d => !d)}>
                {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

      {/* ── Content — Routes thay đổi theo URL ───────────── */}
      <AppShell.Main>
        <Routes>
          <Route path="/"                element={<Navigate to="/items" replace />} />
          <Route path="/items"           element={<ListPage />} />
          <Route path="/items/new"       element={<AddPage />} />
          <Route path="/items/:id/edit"  element={<EditPage />} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  return (
    <MantineProvider theme={theme}>
      {/* Notifications cần đặt TRONG MantineProvider */}
      <Notifications position="top-right" zIndex={1000} />

      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </MantineProvider>
  )
}

// ── Export notifications helper để dùng ở các file khác ───────
// eslint-disable-next-line react-refresh/only-export-components
export { notifications }