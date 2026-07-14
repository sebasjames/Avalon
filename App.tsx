import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GlobalHeader } from './components/GlobalHeader';
import { Dashboard } from './components/Dashboard';
import { InventoryTable } from './components/InventoryTable';
import { InventoryControlDeep } from './components/InventoryControlDeep';
import { ProductionManagement } from './components/ProductionManagement';
import { ATPAllocation } from './components/ATPAllocation';
import { ForecastPlanning } from './components/ForecastPlanning';
import { PurchasingIntelligence } from './components/PurchasingIntelligence';
import { ActionCenter } from './components/ActionCenter';
import { IntelligenceHub } from './components/IntelligenceHub';
import { FinancialImpact } from './components/FinancialImpact';
import { DataGovernance } from './components/DataGovernance';
import { SalesPerformance } from './components/SalesPerformance';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { EventLog } from './components/EventLog';
import { InventoryHub } from './components/InventoryHub';
import { SmartDataMapper } from './components/SmartDataMapper';
import { SalesTeamProfiles } from './components/SalesTeamProfiles';
import { Configuration } from './components/Configuration';
import { GestionComercial } from './components/GestionComercial';
import { ComisionesLogros } from './components/ComisionesLogros';
import { MatrixComisiones } from './components/MatrixComisiones';
import { CrmFull } from './components/CrmFull';

import { AlbaranIngestion } from './components/AlbaranIngestion';
import { SmartPosPanel } from './components/SmartPosPanel';
import { AccountingModule } from './components/AccountingModule';
import { ReturnsPanel } from './components/ReturnsPanel';
import { EnterpriseProvider } from './context/EnterpriseContext';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsZenMode(prev => {
          const next = !prev;
          try {
            if (next && !document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else if (!next && document.fullscreenElement) {
              document.exitFullscreen();
            }
          } catch (err) {}
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <EnterpriseProvider>
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        {/* Mobile Overlay */}
        {isSidebarOpen && !isZenMode && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        {!isZenMode && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        
        <main className="flex-1 overflow-y-auto h-screen relative flex flex-col">
          {/* Mobile Header */}
          {!isZenMode && (
            <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="ml-3 flex items-center gap-2 hover:opacity-85 transition-opacity">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="font-bold text-white text-xs">P</span>
                </div>
                <span className="font-bold text-slate-900">Procoquinal OS</span>
              </Link>
            </div>
          )}

          {!isZenMode && <GlobalHeader />}

          <div className="flex-1 relative">
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CrmFull />} />

            <Route path="/pos" element={<SmartPosPanel />} />
            <Route path="/inventory-hub" element={<InventoryHub />} />
            <Route path="/inventory-mapper" element={<SmartDataMapper />} />
            <Route path="/albaranes" element={<AlbaranIngestion />} />
            <Route path="/sales-performance" element={<SalesPerformance />} />
            <Route path="/financial" element={<FinancialImpact />} />
            <Route path="/forecast" element={<ForecastPlanning />} />
            <Route path="/action-center" element={<ActionCenter />} />
            <Route path="/production" element={<ProductionManagement />} />
            <Route path="/atp" element={<ATPAllocation />} />
            <Route path="/governance" element={<DataGovernance />} />
            <Route path="/intelligence" element={<IntelligenceHub />} />
            <Route path="/analytics" element={<AdvancedAnalytics />} />
            <Route path="/event-log" element={<EventLog />} />
            <Route path="/staff/sales-profiles" element={<SalesTeamProfiles />} />
            <Route path="/staff/gestion-comercial" element={<GestionComercial />} />
            <Route path="/staff/comisiones" element={<ComisionesLogros />} />
            <Route path="/staff/matrix" element={<MatrixComisiones />} />
            <Route path="/config" element={<Configuration />} />
            <Route path="/accounting/:tabId" element={<AccountingModule />} />
            <Route path="/returns" element={<ReturnsPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
    </EnterpriseProvider>
  );
};

export default App;