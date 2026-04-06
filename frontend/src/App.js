// frontend/src/App.js  ← ÚNICO punto de entrada (elimina App.jsx)
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header  from './components/Header';
import Sidebar from './components/Sidebar';

// Páginas
import DashboardPage  from './pages/DashboardPage';
import UsersPage      from './pages/UsersPage';
import SalesPage      from './pages/SalesPage';
import LogsPage       from './pages/LogsPage';
import AdoptionsPage  from './pages/AdoptionsPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Header
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <div className="app-container">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/"           element={<DashboardPage />} />
              <Route path="/usuarios"   element={<UsersPage />} />
              <Route path="/ventas"     element={<SalesPage />} />
              <Route path="/logs"       element={<LogsPage />} />
              <Route path="/adopciones" element={<AdoptionsPage />} />
              {/* Redirigir cualquier ruta desconocida al dashboard */}
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
