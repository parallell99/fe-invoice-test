import { Navigate, Route, Routes } from 'react-router-dom'
import DesignSystemPage from './pages/DesignSystemPage'

import InvoiceCreatePage from './pages/InvoiceCreatePage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoiceEditPage from './pages/InvoiceEditPage'
import InvoicesPage from './pages/InvoicesPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<InvoicesPage />} />
      <Route path="/invoice/new" element={<InvoiceCreatePage />} />
      <Route path="/invoice/:invoiceId/edit" element={<InvoiceEditPage />} />
      <Route path="/invoice/:invoiceId" element={<InvoiceDetailPage />} />
      <Route path="/design" element={<DesignSystemPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
