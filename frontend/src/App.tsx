import { Navigate, Route, Routes } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import PartDetailsPage from './pages/parts/PartDetailsPage'
import PartEditorPage from './pages/parts/PartEditorPage'
import PartsManagementPage from './pages/parts/PartsManagementPage'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/parts" />} path="/" />
      <Route element={<PartsManagementPage />} path="/parts" />
      <Route element={<PartEditorPage />} path="/parts/new" />
      <Route element={<PartDetailsPage />} path="/parts/:partId" />
      <Route element={<PartEditorPage />} path="/parts/:partId/edit" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

export default App
