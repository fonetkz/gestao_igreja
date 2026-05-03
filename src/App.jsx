import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import ProgrammingPage from './pages/ProgrammingPage'
import HymnPrintPage from './pages/HymnPrintPage'
import SettingsPage from './pages/SettingsPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Toast from './components/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membros" element={<MembersPage />} />
          <Route path="/programacao" element={<ProgrammingPage />} />
          <Route path="/impressao" element={<HymnPrintPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/conta" element={<AccountSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toast />
    </BrowserRouter>
  )
}
