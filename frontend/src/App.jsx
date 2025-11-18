// frontend/src/App.jsx
import React from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import "./index.css";

const App = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default App;
