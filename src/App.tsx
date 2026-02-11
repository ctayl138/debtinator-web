import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/pages/Layout';
import Debts from '@/pages/Debts';
import Payoff from '@/pages/Payoff';
import Charts from '@/pages/Charts';
import PayoffTimeline from '@/pages/PayoffTimeline';
import Income from '@/pages/Income';
import Settings from '@/pages/Settings';
import Documentation from '@/pages/Documentation';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Debts />} />
        <Route path="payoff" element={<Payoff />} />
        <Route path="charts" element={<Charts />} />
        <Route path="payoff-timeline" element={<PayoffTimeline />} />
        <Route path="income" element={<Income />} />
        <Route path="settings" element={<Settings />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
