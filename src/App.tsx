import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { PinModal } from './components/common/PinModal';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Cashier } from './pages/Cashier';
import { AuditLog } from './pages/AuditLog';
import { useStore } from './lib/store';

function App() {
  const [showPinModal, setShowPinModal] = useState(true);
  const { isAuthenticated, setAuthenticated } = useStore();

  const handlePinSuccess = () => {
    setAuthenticated(true);
    setShowPinModal(false);
  };

  if (showPinModal && !isAuthenticated) {
    return <PinModal onSuccess={handlePinSuccess} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/audit" element={<AuditLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

