import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import ProgrammingPage from './pages/ProgrammingPage'
import SettingsPage from './pages/SettingsPage'
import AccountSettingsPage from './pages/AccountSettingsPage'

import ResetPasswordPage from './pages/ResetPasswordPage'
import Toast from './components/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

        {/* Rotas protegidas */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membros" element={<MembersPage />} />
          <Route path="/programacao" element={<ProgrammingPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/conta" element={<AccountSettingsPage />} />
        </Route>

        {/* Redirect padrão */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toast />
    </BrowserRouter>
  )
}
