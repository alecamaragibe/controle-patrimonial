import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Components/Sidebar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CadastrarBem from './pages/CadastrarBem'
import Movimentacoes from "./pages/Movimentacoes";
import LogsAuditoria from "./pages/LogsAuditoria";

function App() {
  return (
    <BrowserRouter>
      {/* Container principal ocupando a tela toda */}
      <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
        
        {/* Barra lateral fixa na esquerda */}
        <Sidebar />

        {/* Área branca da direita onde as páginas vão estar renderizando */}
        <div className="flex-grow-1 p-5">
          <Routes>
         
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastrar-bem" element={<CadastrarBem />} />
            <Route path="/login" element={<Login />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
            <Route path="/auditoria" element={<LogsAuditoria />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  )
}

export default App