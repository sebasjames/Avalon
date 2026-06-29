import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, X, Trash2, Users, ArrowUp, ArrowDown, AlertTriangle, SlidersHorizontal, Plus, Pencil, Save } from 'lucide-react';
import { CrmContact, CrmLeadSource, CustomerTier } from '../types';

interface CrmContactsTableProps {
  contacts: CrmContact[];
  searchQuery: string;
  selectedSource: CrmLeadSource | 'ALL';
  setSelectedSource: (source: CrmLeadSource | 'ALL') => void;
  getSourceBadge: (source: string) => { label: string; color: string; icon: any };
  onContactClick: (contactId: string) => void;
  onDeleteContacts: (contactIds: string[]) => void;
  filterTier: CustomerTier | 'ALL';
  filterStatus: 'ALL' | 'VINCULADO' | 'INACTIVO' | 'PROSPECTO';
}

import { useEnterprise } from '../context/EnterpriseContext';

export const CrmContactsTable: React.FC<CrmContactsTableProps> = ({
  contacts, searchQuery, selectedSource, setSelectedSource, getSourceBadge, onContactClick, onDeleteContacts, filterTier, filterStatus
}) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [sortConfig, setSortConfig] = useState<{ key: keyof CrmContact, direction: 'asc' | 'desc' } | null>(null);
  
  // Phase 2: Saved Views
  const [activeViewId, setActiveViewId] = useState('v1');
  const [savedViews, setSavedViews] = useState<any[]>([
    { id: 'v1', name: 'Todos los Contactos' },
    { id: 'v2', name: 'Leads' },
    { id: 'v4', name: 'Clientes' },
    { id: 'v3', name: 'Clientes VIP' },
  ]);

  const [isNewViewModalOpen, setIsNewViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewField, setNewViewField] = useState('status');
  const [newViewValue, setNewViewValue] = useState('VINCULADO');

  const handleCreateView = () => {
      if (newViewName) {
          const newView = {
              id: 'v_' + Date.now(),
              name: newViewName,
              customFilter: { field: newViewField, value: newViewValue }
          };
          setSavedViews(prev => [...prev, newView]);
          setActiveViewId(newView.id);
          setIsNewViewModalOpen(false);
          setNewViewName('');
      }
  };

  // Phase 1: Dynamic columns
  const AVAILABLE_COLUMNS = [
    { id: 'tags', label: 'Etiquetas' },
    { id: 'document', label: 'NIT/Cédula' },
    { id: 'email', label: 'Email' },
    { id: 'source', label: 'Origen' },
    { id: 'status', label: 'Estado' },
    { id: 'ownerId', label: 'Responsable' },
    { id: 'tier', label: 'Tier' },
    { id: 'postSaleStage', label: 'Etapa KAM' },
    { id: 'lastContactDate', label: 'Últ. Contacto' },
  ];
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['tags', 'document', 'source', 'status', 'ownerId']);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isAdvancedView, setIsAdvancedView] = useState(false); // Kept for retrocompatibility with Decision Makers for now

  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const { crmUsers, reassignContacts, getContactHealthScore, updateContact, cleanGarbageLeads } = useEnterprise();

  // Mocking the current active user for security rules (Requirement 9)
  const currentUser = crmUsers.find(u => u.id === 'U-ME') || crmUsers[0]; 
  const canReassign = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const handleSave = (contactId: string, field: string, val: string | number) => {
    updateContact(contactId, { [field]: val });
  };


  const AVAILABLE_TAGS = ['VIP', 'En Riesgo', 'Alta Prioridad', 'Nuevo', 'Referido', 'Socio'];
  
  const handleToggleTag = (contactId: string, tag: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const currentTags = contact.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
    updateContact(contactId, { tags: newTags });
  };

  const tableColumns = ['company', 'name', 'whatsapp', ...visibleColumns];

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetUser, setReassignTargetUser] = useState('');
  const [reassignTransferDeals, setReassignTransferDeals] = useState(true);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'ALL' || c.source === selectedSource;
    const matchesTier = filterTier === 'ALL' || c.tier === filterTier;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    
    let matchesView = true;
    if (activeViewId === 'v2') { // Leads
        matchesView = c.status === 'PROSPECTO' || c.status === 'LEAD';
    } else if (activeViewId === 'v4') { // Clientes
        matchesView = c.status === 'VINCULADO';
    } else if (activeViewId === 'v3') { // Clientes VIP
        matchesView = c.tier === 'Estratégico' || (c.tags && c.tags.includes('VIP')) || false;
    } else {
        const customView = savedViews.find(v => v.id === activeViewId);
        if (customView && customView.customFilter) {
            if (customView.customFilter.field === 'status') matchesView = c.status === customView.customFilter.value;
            else if (customView.customFilter.field === 'tier') matchesView = c.tier === customView.customFilter.value;
            else if (customView.customFilter.field === 'tags') matchesView = c.tags && c.tags.includes(customView.customFilter.value);
            else if (customView.customFilter.field === 'source') matchesView = c.source === customView.customFilter.value;
        }
    }
    
    return matchesSearch && matchesSource && matchesTier && matchesStatus && matchesView;
  });

  const sortedContacts = React.useMemo(() => {
    let sortableItems = [...filteredContacts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredContacts, sortConfig]);

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const currentContacts = sortedContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: keyof CrmContact) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof CrmContact }) => {
      if (sortConfig?.key !== columnKey) return <span className="ml-1 opacity-0 group-hover:opacity-50"><ArrowUp className="w-3 h-3 inline" /></span>;
      return sortConfig.direction === 'asc' 
          ? <span className="ml-1 text-indigo-600"><ArrowUp className="w-3 h-3 inline" /></span> 
          : <span className="ml-1 text-indigo-600"><ArrowDown className="w-3 h-3 inline" /></span>;
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.length === currentContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(currentContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(cid => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if(window.confirm('¿Eliminar contactos seleccionados?')) {
        onDeleteContacts(selectedContactIds);
        setSelectedContactIds([]);
    }
  };

  const handleReassignSubmit = () => {
    if (reassignTargetUser && selectedContactIds.length > 0) {
      reassignContacts(selectedContactIds, reassignTargetUser, reassignTransferDeals);
      setSelectedContactIds([]);
      setIsReassignModalOpen(false);
      setReassignTargetUser('');
    }
  };


  return (
    <div className="space-y-4">
      {/* Phase 2: Saved Views Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          {savedViews.map(view => (
              <button 
                  key={view.id}
                  onClick={() => setActiveViewId(view.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeViewId === view.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                  {view.name}
              </button>
          ))}
          <button onClick={() => setIsNewViewModalOpen(true)} className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" /> Nueva Vista
          </button>
      </div>

      {/* Filters and Bulk Actions Area */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
            {selectedSource !== 'ALL' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                {getSourceBadge(selectedSource).label}
                <button onClick={() => setSelectedSource('ALL')} className="hover:bg-indigo-200 p-0.5 rounded-full transition-colors">
                <X className="w-3 h-3" />
                </button>
            </div>
            )}
            {selectedContactIds.length > 0 && (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-700">{selectedContactIds.length} seleccionados</span>
                    {canReassign ? (
                        <button onClick={() => setIsReassignModalOpen(true)} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-200 transition">
                            <Users className="w-3 h-3" /> Reasignar
                        </button>
                    ) : (
                        <span className="text-xs text-rose-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Reasignación Bloqueada</span>
                    )}
                    <button onClick={handleDeleteSelected} className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-semibold hover:bg-rose-200 transition">
                        <Trash2 className="w-3 h-3" /> Borrar
                    </button>
                </div>
            )}
            {selectedContactIds.length === 0 && selectedSource === 'ALL' && (
                <span className="text-sm text-slate-500">Filtrando: Ninguno. Selecciona casillas para acciones masivas.</span>
            )}
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 relative">
            <button onClick={() => { if(window.confirm('¿Mandar a INACTIVO a todos los leads sin interacción en más de 30 días?')) cleanGarbageLeads(30); }} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md hover:bg-amber-200 flex items-center gap-1 mr-2 transition-colors">
                <Trash2 className="w-3 h-3"/> Limpiar Basura (30d)
            </button>
            
            <button onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                <SlidersHorizontal className="w-3 h-3" /> Columnas
            </button>

            {isColumnDropdownOpen && (
                <div className="absolute top-10 right-0 w-48 bg-white border border-slate-200 shadow-lg rounded-lg py-2 z-20">
                    <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-500">Mostrar Columnas</div>
                    {AVAILABLE_COLUMNS.map(col => (
                        <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700">
                            <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => setVisibleColumns(prev => prev.includes(col.id) ? prev.filter(c => c !== col.id) : [...prev, col.id])} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            {col.label}
                        </label>
                    ))}
                </div>
            )}

            <span className={`text-xs font-bold ml-2 ${isAdvancedView ? 'text-indigo-600' : 'text-slate-500'}`}>Vista Avanzada</span>
            <button 
                onClick={() => setIsAdvancedView(!isAdvancedView)} 
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAdvancedView ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAdvancedView ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: isAdvancedView ? 'translateX(18px)' : 'translateX(4px)' }} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto outline-none" tabIndex={0}>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-3 border-r border-slate-200 w-10 text-center">
                    <input 
                        type="checkbox" 
                        onChange={toggleSelectAll}
                        checked={selectedContactIds.length === currentContacts.length && currentContacts.length > 0} 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </th>
                <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('company')}>
                    CLIENTE <SortIcon columnKey="company" />
                </th>
                <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('phone')}>
                    TELEFONO DE CLIENTE <SortIcon columnKey="phone" />
                </th>
                <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                    Contacto Principal <SortIcon columnKey="name" />
                </th>
                {isAdvancedView && (
                  <>
                    <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('whatsapp')}>
                        WhatsApp <SortIcon columnKey="whatsapp" />
                    </th>
                    <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('contact2')}>
                        Contacto 2 <SortIcon columnKey="contact2" />
                    </th>
                    <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('phone2')}>
                        Teléfono C. 2 <SortIcon columnKey="phone2" />
                    </th>
                    <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('contact3')}>
                        Contacto 3 <SortIcon columnKey="contact3" />
                    </th>
                    <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('phone3')}>
                        Teléfono C. 3 <SortIcon columnKey="phone3" />
                    </th>
                  </>
                )}
                
                {visibleColumns.includes('tags') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Etiquetas</th>}
                
                {visibleColumns.includes('document') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">NIT/Cédula</th>}
                {visibleColumns.includes('email') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                
                {isAdvancedView && visibleColumns.includes('source') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('source')}>
                    Origen <SortIcon columnKey="source" />
                </th>}
                
                {visibleColumns.includes('status') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('status')}>
                    Estado <SortIcon columnKey="status" />
                </th>}
                
                {visibleColumns.includes('ownerId') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>}
                

                {visibleColumns.includes('tier') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('tier')}>
                    Tier <SortIcon columnKey="tier" />
                </th>}
                {visibleColumns.includes('postSaleStage') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Etapa KAM</th>}
                {visibleColumns.includes('lastContactDate') && <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Últ. Contacto</th>}

                <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentContacts.map(contact => {
                const sourceBadge = getSourceBadge(contact.source);
                const SourceIcon = sourceBadge.icon;
                const isSelected = selectedContactIds.includes(contact.id);
                
                const renderCell = (field: keyof CrmContact, display: React.ReactNode, type: string = 'text') => {
                    const isEditing = editingRowId === contact.id;
                    return (
                        <td className={`py-1.5 px-3 border-r border-slate-100 text-[13px] text-slate-700 transition-colors relative hover:bg-slate-50`} onClick={(e) => { if (isEditing) e.stopPropagation(); }}>
                            {isEditing ? (
                                <input className="absolute inset-0 border-2 border-indigo-500 px-2 w-full h-full text-[13px] bg-white outline-none z-10" type={type} defaultValue={String(contact[field] || '')} onBlur={e => { handleSave(contact.id, field, e.target.value); }} onClick={(e) => e.stopPropagation()} onKeyDown={e => { if(e.key === 'Enter') e.currentTarget.blur(); e.stopPropagation(); }} />
                            ) : display}
                        </td>
                    );
                };

                const renderSelectCell = (field: keyof CrmContact, options: {value:string, label:string}[], display: React.ReactNode) => {
                    const isEditing = editingRowId === contact.id;
                    return (
                        <td className={`py-1.5 px-3 border-r border-slate-100 text-[13px] text-slate-700 transition-colors relative hover:bg-slate-50`} onClick={(e) => { if (isEditing) e.stopPropagation(); }}>
                            {isEditing ? (
                                <select className="absolute inset-0 border-2 border-indigo-500 px-2 w-full h-full text-[13px] bg-white outline-none z-10" defaultValue={String(contact[field] || '')} onBlur={e => { handleSave(contact.id, field, e.target.value); }} onClick={(e) => e.stopPropagation()} onKeyDown={e => { if(e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); e.stopPropagation(); }}>
                                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            ) : display}
                        </td>
                    );
                };

                return (
                <tr 
                  key={contact.id} 
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/20' : 'bg-white'}`}
                  onClick={() => { if (editingRowId !== contact.id) onContactClick(contact.id); }}
                >
                  <td className="py-1.5 px-3 border-r border-slate-100 text-center" onClick={(e) => toggleSelectContact(e, contact.id)}>
                      <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                  </td>
                  
                  {renderCell('company', <span className="text-sm text-slate-600 whitespace-nowrap">{contact.company}</span>)}

                  {renderCell('phone', (
                    <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>
                  ))}

                  {renderCell('name', (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white 
                            ${getContactHealthScore(contact.id) === 'GREEN' ? 'bg-emerald-500' : 
                              getContactHealthScore(contact.id) === 'YELLOW' ? 'bg-amber-500' : 
                              'bg-rose-500'}`} 
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 whitespace-nowrap">{contact.name}</span>
                    </div>
                  ))}

                  {isAdvancedView && (
                    <>
                      {renderCell('whatsapp', (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
                          {contact.whatsapp ? (
                            <a 
                              href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.116-2.875-6.973C16.597 1.882 14.122.862 11.49.862c-5.434 0-9.858 4.42-9.863 9.864-.002 1.718.461 3.39 1.34 4.869l-.988 3.606 3.693-.979zm12.387-5.748c-.327-.164-1.938-.956-2.238-1.065-.3-.11-.519-.164-.738.164-.219.329-.848 1.065-1.039 1.285-.19.22-.382.247-.709.082-1.127-.565-1.928-1.006-2.714-2.355-.207-.354-.021-.54.149-.708.154-.152.327-.382.49-.573.164-.19.219-.327.328-.546.11-.22.055-.41-.027-.573-.082-.164-.738-1.776-1.011-2.434-.267-.643-.539-.556-.738-.566-.19-.01-.41-.01-.628-.01-.219 0-.573.082-.875.41-.301.329-1.15 1.122-1.15 2.735s1.177 3.172 1.34 3.39c.164.22 2.313 3.532 5.603 4.954.782.338 1.39.54 1.866.69.787.25 1.5.214 2.067.129.631-.095 1.938-.793 2.21-1.558.273-.766.273-1.422.19-1.558-.081-.137-.3-.22-.628-.383z"/>
                              </svg>
                              <span className="font-semibold text-emerald-600">{contact.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No asignado</span>
                          )}
                        </div>
                      ))}
                      {renderCell('contact2', <span className="text-sm font-medium text-slate-900 whitespace-nowrap">{contact.contact2 || <span className="text-slate-400 italic text-xs">No asignado</span>}</span>)}
                      {renderCell('phone2', <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{contact.phone2 || <span className="text-slate-400 italic text-xs">No asignado</span>}</span>)}
                      {renderCell('contact3', <span className="text-sm font-medium text-slate-900 whitespace-nowrap">{contact.contact3 || <span className="text-slate-400 italic text-xs">No asignado</span>}</span>)}
                      {renderCell('phone3', <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{contact.phone3 || <span className="text-slate-400 italic text-xs">No asignado</span>}</span>)}
                    </>
                  )}

                  {visibleColumns.includes('tags') && (
                      <td 
                        className={`py-1.5 px-3 border-r border-slate-100 text-[13px] text-slate-700 transition-colors relative hover:bg-slate-50 bg-white`}
                        onClick={(e) => { if (editingRowId === contact.id) e.stopPropagation(); }}
                      >
                        {editingRowId === contact.id ? (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl rounded-lg border border-slate-200 z-50 p-2 flex flex-col gap-1">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase px-1">Etiquetas (Auto-guardado)</div>
                                </div>
                                {AVAILABLE_TAGS.map(tag => {
                                    const hasTag = contact.tags?.includes(tag);
                                    return (
                                        <label key={tag} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 cursor-pointer rounded">
                                            <input type="checkbox" checked={hasTag || false} onChange={() => handleToggleTag(contact.id, tag)} className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3" />
                                            <span className="text-xs text-slate-700 font-medium">{tag}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : null}
                         <div className="flex flex-wrap gap-1 max-w-[150px]">
                           {contact.tags?.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">{t}</span>
                           ))}
                           {(!contact.tags || contact.tags.length === 0) && <span className="text-xs text-slate-300">-</span>}
                         </div>
                      </td>
                  )}
                  {visibleColumns.includes('document') && renderCell('document', <span className="text-sm text-slate-600 font-mono text-xs">{contact.documentType || 'NIT'} {contact.documentNumber || 'N/A'}</span>)}
                  
                  {visibleColumns.includes('email') && renderCell('email', <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap"><Mail className="w-3 h-3" /> {contact.email}</div>, 'email')}
                  
                  {isAdvancedView && visibleColumns.includes('source') && renderSelectCell('source', 
                    ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'GOOGLE_ADS', 'MANUAL', 'STREET', 'REFERRAL', 'WEBSITE'].map(o => ({value:o, label:o})),
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${sourceBadge.color}`}>
                      <SourceIcon className="w-3 h-3" />
                      {sourceBadge.label}
                    </div>
                  )}

                  {visibleColumns.includes('status') && renderSelectCell('status', 
                    [{value:'LEAD', label:'Lead'}, {value:'PROSPECTO', label:'Prospecto'}, {value:'VINCULADO', label:'Vinculado'}, {value:'INACTIVO', label:'Inactivo'}],
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${contact.status === 'VINCULADO' ? 'bg-emerald-100 text-emerald-700' : 
                        contact.status === 'PROSPECTO' ? 'bg-amber-100 text-amber-700' : 
                        contact.status === 'LEAD' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'}`}>
                      {contact.status === 'VINCULADO' ? 'Vinculado' : contact.status === 'PROSPECTO' ? 'Prospecto' : contact.status === 'LEAD' ? 'Lead' : 'Inactivo'}
                    </span>
                  )}

                  {visibleColumns.includes('ownerId') && renderSelectCell('ownerId',
                    crmUsers.map(u => ({value: u.id, label: u.name})),
                    <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                      {crmUsers.find(u => u.id === contact.ownerId)?.name || 'Sin Asignar'}
                    </span>
                  )}
                  

                  {visibleColumns.includes('tier') && renderSelectCell('tier',
                      ['REGULAR', 'STRATEGIC', 'NEW'].map(o => ({value:o, label:o})),
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${contact.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-700' : 
                          contact.tier === 'REGULAR' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'}`}>
                      Tier {contact.tier}
                      </span>
                  )}
                  {visibleColumns.includes('postSaleStage') && renderSelectCell('postSaleStage',
                      ['ONBOARDING', 'RENTABILIZACION', 'FIDELIZACION', 'MONITOREO'].map(o => ({value:o, label:o})),
                      <span className="text-xs text-slate-600 font-medium">{contact.postSaleStage || '-'}</span>
                  )}
                  {visibleColumns.includes('lastContactDate') && renderCell('lastContactDate', <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(contact.lastContactDate).toLocaleDateString('es-CO')}</span>, 'date')}

                  <td className="py-1.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                        {editingRowId === contact.id ? (
                            <button onClick={(e) => { e.stopPropagation(); setEditingRowId(null); }} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Guardar Fila">
                                <Save className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); setEditingRowId(contact.id); }} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Editar Fila">
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onContactClick(contact.id); }} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Abrir Perfil">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-slate-500">No se encontraron contactos que coincidan con la búsqueda.</div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredContacts.length)} de {filteredContacts.length}
                </span>
                <div className="flex gap-1">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 border border-slate-200 rounded bg-white text-sm disabled:opacity-50"
                    >Anterior</button>
                    {Array.from({length: totalPages}).map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded text-sm ${currentPage === i + 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 border border-slate-200 rounded bg-white text-sm disabled:opacity-50"
                    >Siguiente</button>
                </div>
            </div>
        )}
      </div>

      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Reasignar Contactos</h2>
            <p className="text-sm text-slate-500 mb-4">Selecciona el comercial al que deseas reasignar {selectedContactIds.length} contacto(s).</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nuevo Propietario</label>
                <select 
                  value={reassignTargetUser} 
                  onChange={(e) => setReassignTargetUser(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="">Selecciona un usuario...</option>
                  {crmUsers.filter(u => u.role === 'SALES_REP' || u.role === 'MANAGER').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="transferDeals" 
                  checked={reassignTransferDeals} 
                  onChange={(e) => setReassignTransferDeals(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="transferDeals" className="text-sm text-slate-700 font-medium">También transferir Oportunidades Abiertas</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsReassignModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Cancelar</button>
              <button onClick={handleReassignSubmit} disabled={!reassignTargetUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {isNewViewModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">Crear Nueva Vista</h3>
                      <button onClick={() => setIsNewViewModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre de la Vista</label>
                          <input type="text" value={newViewName} onChange={e => setNewViewName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. Leads Facebook" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filtrar por Campo</label>
                          <select value={newViewField} onChange={e => setNewViewField(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="status">Estado (PROSPECTO, VINCULADO...)</option>
                              <option value="source">Origen (FACEBOOK, GOOGLE_ADS...)</option>
                              <option value="tier">Tier (Estratégico, Regular...)</option>
                              <option value="tags">Etiqueta (VIP, Nuevo...)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Exacto</label>
                          <input type="text" value={newViewValue} onChange={e => setNewViewValue(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. FACEBOOK" />
                      </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setIsNewViewModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 transition-colors">Cancelar</button>
                      <button onClick={handleCreateView} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Guardar Vista</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
