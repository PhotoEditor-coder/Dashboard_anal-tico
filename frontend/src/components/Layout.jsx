// frontend/src/components/Layout.jsx
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="logo">Art Analytics</h1>
        <nav>
          <ul>
            <li className="active">Dashboard</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2>Analytics Dashboard</h2>
          <span className="topbar-badge">Portfolio Project</span>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
