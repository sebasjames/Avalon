import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GlobalHeader } from './components/GlobalHeader';
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const InventoryTable = React.lazy(() => import('./components/InventoryTable').then(m => ({ default: m.InventoryTable })));
const InventoryControlDeep = React.lazy(() => import('./components/InventoryControlDeep').then(m => ({ default: m.InventoryControlDeep })));
const ProductionManagement = React.lazy(() => import('./components/ProductionManagement').then(m => ({ default: m.ProductionManagement })));
const ATPAllocation = React.lazy(() => import('./components/ATPAllocation').then(m => ({ default: m.ATPAllocation })));
const ForecastPlanning = React.lazy(() => import('./components/ForecastPlanning').then(m => ({ default: m.ForecastPlanning })));
const PurchasingIntelligence = React.lazy(() => import('./components/PurchasingIntelligence').then(m => ({ default: m.PurchasingIntelligence })));
const ActionCenter = React.lazy(() => import('./components/ActionCenter').then(m => ({ default: m.ActionCenter })));
const IntelligenceHub = React.lazy(() => import('./components/IntelligenceHub').then(m => ({ default: m.IntelligenceHub })));
const FinancialImpact = React.lazy(() => import('./components/FinancialImpact').then(m => ({ default: m.FinancialImpact })));
const PurchaseReports = React.lazy(() => import('./components/PurchaseReports').then(m => ({ default: m.PurchaseReports })));
const DataGovernance = React.lazy(() => import('./components/DataGovernance').then(m => ({ default: m.DataGovernance })));
const SalesPerformance = React.lazy(() => import('./components/SalesPerformance').then(m => ({ default: m.SalesPerformance })));
const AdvancedAnalytics = React.lazy(() => import('./components/AdvancedAnalytics').then(m => ({ default: m.AdvancedAnalytics })));
const EventLog = React.lazy(() => import('./components/EventLog').then(m => ({ default: m.EventLog })));
const InventoryHub = React.lazy(() => import('./components/InventoryHub').then(m => ({ default: m.InventoryHub })));
const SalesTeamProfiles = React.lazy(() => import('./components/SalesTeamProfiles').then(m => ({ default: m.SalesTeamProfiles })));
const Configuration = React.lazy(() => import('./components/Configuration').then(m => ({ default: m.Configuration })));
const GestionComercial = React.lazy(() => import('./components/GestionComercial').then(m => ({ default: m.GestionComercial })));
const ComisionesLogros = React.lazy(() => import('./components/ComisionesLogros').then(m => ({ default: m.ComisionesLogros })));
const MatrixComisiones = React.lazy(() => import('./components/MatrixComisiones').then(m => ({ default: m.MatrixComisiones })));
const CrmFull = React.lazy(() => import('./components/CrmFull').then(m => ({ default: m.CrmFull })));
const NotificationsPage = React.lazy(() => import('./components/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const TintometriaPanel = React.lazy(() => import('./components/TintometriaPanel').then(m => ({ default: m.TintometriaPanel })));
const MezclasTablero = React.lazy(() => import('./components/MezclasTablero').then(m => ({ default: m.MezclasTablero })));
const InventarioTransito = React.lazy(() => import('./components/InventarioTransito').then(m => ({ default: m.InventarioTransito })));
const SmartPosPanel = React.lazy(() => import('./components/SmartPosPanel').then(m => ({ default: m.SmartPosPanel })));
const AccountingModule = React.lazy(() => import('./components/AccountingModule').then(m => ({ default: m.AccountingModule })));
const ReturnsPanel = React.lazy(() => import('./components/ReturnsPanel').then(m => ({ default: m.ReturnsPanel })));
const DispatchModule = React.lazy(() => import('./components/DispatchModule').then(m => ({ default: m.DispatchModule })));
const DispatchReports = React.lazy(() => import('./components/DispatchReports').then(m => ({ default: m.DispatchReports })));
const InformesOmar = React.lazy(() => import('./components/InformesOmar').then(m => ({ default: m.InformesOmar })));
import { EnterpriseProvider } from './context/EnterpriseContext';
import { AuthGate } from './components/AuthGate';
import { FloatingTaskNote } from './components/FloatingTaskNote';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from './components/ToastContainer';

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
    <AuthGate>
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
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            }>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CrmFull />} />

            <Route path="/pos" element={<SmartPosPanel />} />
            <Route path="/inventory-hub" element={<InventoryHub />} />
            <Route path="/inventario-transito" element={<InventarioTransito />} />
            <Route path="/sales-performance" element={<SalesPerformance />} />
            <Route path="/financial" element={<ProtectedRoute allowedRoles={['admin', 'Contabilidad']}><FinancialImpact /></ProtectedRoute>} />
            <Route path="/informes-pedido" element={<PurchaseReports />} />
            <Route path="/informes-omar" element={<InformesOmar />} />
            <Route path="/forecast" element={<ForecastPlanning />} />
            <Route path="/action-center" element={<ActionCenter />} />
            <Route path="/production" element={<ProductionManagement />} />
            <Route path="/dispensador" element={<DispatchModule />} />
            <Route path="/tintometria" element={<TintometriaPanel />} />
            <Route path="/mezclas" element={<MezclasTablero />} />
            <Route path="/ajustes" element={<ProtectedRoute allowedRoles={['admin']}><Configuration /></ProtectedRoute>} />
            <Route path="/atp" element={<ATPAllocation />} />
            <Route path="/governance" element={<ProtectedRoute allowedRoles={['admin']}><DataGovernance /></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><IntelligenceHub /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdvancedAnalytics /></ProtectedRoute>} />
            <Route path="/event-log" element={<EventLog />} />
            <Route path="/staff/sales-profiles" element={<ProtectedRoute allowedRoles={['admin']}><SalesTeamProfiles /></ProtectedRoute>} />
            <Route path="/staff/gestion-comercial" element={<ProtectedRoute allowedRoles={['admin']}><GestionComercial /></ProtectedRoute>} />
            <Route path="/staff/comisiones" element={<ProtectedRoute allowedRoles={['admin']}><ComisionesLogros /></ProtectedRoute>} />
            <Route path="/staff/matrix" element={<ProtectedRoute allowedRoles={['admin']}><MatrixComisiones /></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute allowedRoles={['admin']}><Configuration /></ProtectedRoute>} />
            <Route path="/accounting" element={<Navigate to="/accounting/cierres" replace />} />
            <Route path="/accounting/:tabId" element={<ProtectedRoute allowedRoles={['admin']}><AccountingModule /></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute allowedRoles={['admin']}><ReturnsPanel /></ProtectedRoute>} />
            <Route path="/dispensador" element={<DispatchModule />} />
            <Route path="/dispatch" element={<DispatchModule />} />
            <Route path="/dispatch-reports" element={<DispatchReports />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </React.Suspense>
          </div>
        </main>
        
        <FloatingTaskNote />
        <ToastContainer />
      </div>
    </HashRouter>
    </EnterpriseProvider>
    </AuthGate>
  );
};

export default App;