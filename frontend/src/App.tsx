import { useState, useEffect } from 'react';
import { TabType, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProcessesPage } from './pages/ProcessesPage';
import { ThreadsPage } from './pages/ThreadsPage';
import { ConcurrencyPage } from './pages/ConcurrencyPage';
import { DeadlockPage } from './pages/DeadlockPage';
import { MemoryPage } from './pages/MemoryPage';
import { DiskPage } from './pages/DiskPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AdaptivePage } from './pages/AdaptivePage';
import { SimulationPage } from './pages/SimulationPage';
import { LogsPage } from './pages/LogsPage';
import { DocsPage } from './pages/DocsPage';
import { SystemMetrics } from './types';
import { fetchMetrics } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'processes':
        return <ProcessesPage />;
      case 'threads':
        return <ThreadsPage />;
      case 'concurrency':
        return <ConcurrencyPage />;
      case 'deadlock':
        return <DeadlockPage />;
      case 'memory':
        return <MemoryPage />;
      case 'disk':
        return <DiskPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'adaptive':
        return <AdaptivePage />;
      case 'simulation':
        return <SimulationPage />;
      case 'logs':
        return <LogsPage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar metrics={metrics} onOpenLogs={() => setActiveTab('logs')} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
