import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { CreatePage } from '@/pages/CreatePage'
import { InvitationViewPage } from '@/pages/InvitationPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<CreatePage />} />
        <Route path="/i/:id" element={<InvitationViewPage />} />
      </Route>
    </Routes>
  )
}
