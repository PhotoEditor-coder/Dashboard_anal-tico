// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header  from './components/Header';
import Sidebar from './components/Sidebar';

import DashboardPage  from './pages/DashboardPage';
import UsersPage      from './pages/UsersPage';
import SalesPage      from './pages/SalesPage';
import LogsPage       from './pages/LogsPage';
import AdoptionsPage  from './pages/AdoptionsPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // móvil
  const [sidebarMini, setSidebarMini] = useState(false);   // desktop compacto

  // En móvil el margen es siempre 0; en desktop depende de mini/normal
  const mainClass = [
    'main-content',
    sidebarMini ? 'sidebar-mini' : '',
  ].filter(Boolean).join(' ');

  return (
    <BrowserRouter>
      <div className="App">
        <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />

        <div className="app-container">
          <Sidebar
            isOpen={sidebarOpen}
            isMini={sidebarMini}
            onClose={() => setSidebarOpen(false)}
            onToggleMini={() => setSidebarMini(prev => !prev)}
          />

          <main className={mainClass}>
            <Routes>
              <Route path="/"           element={<DashboardPage />} />
              <Route path="/usuarios"   element={<UsersPage />} />
              <Route path="/ventas"     element={<SalesPage />} />
              <Route path="/logs"       element={<LogsPage />} />
              <Route path="/adopciones" element={<AdoptionsPage />} />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
