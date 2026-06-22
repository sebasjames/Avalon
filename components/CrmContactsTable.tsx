import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, X, Trash2, Users, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
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
  const itemsPerPage = 5;
  const [sortConfig, setSortConfig] = useState<{ key: keyof CrmContact, direction: 'asc' | 'desc' } | null>(null);
  const [isAdvancedView, setIsAdvancedView] = useState(false);

  const [editingCell, setEditingCell] = useState<{ contactId: string, field: string } | null>(null);

  const { crmUsers, reassignContacts, getContactHealthScore, updateContact, cleanGarbageLeads } = useEnterprise();

  // Mocking the current active user for security rules (Requirement 9)
  const currentUser = crmUsers.find(u => u.id === 'U-ME') || crmUsers[0]; 
  const canReassign = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const handleCellClick = (contactId: string, field: string) => {
    setEditingCell({ contactId, field });
  };

  const handleSave = (contactId: string, field: string, val: string | number) => {
    setEditingCell(null);
    updateContact(contactId, { [field]: val });
  };

  const handleSaveDM = (contactId: string, dmIndex: number, dmField: string, val: string) => {
    setEditingCell(null);
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const newDMs = [...(contact.decisionMakers || [])];
    if (!newDMs[dmIndex]) {
        newDMs[dmIndex] = { name: '', position: '', hobby: '', birthday: '' };
    }
    newDMs[dmIndex] = { ...newDMs[dmIndex], [dmField]: val };
    updateContact(contactId, { decisionMakers: newDMs });
  };

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetUser, setReassignTargetUser] = useState('');
  const [reassignTransferDeals, setReassignTransferDeals] = useState(true);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'ALL' || c.source === selectedSource;
    const matchesTier = filterTier === 'ALL' || c.tier === filterTier;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    
    return matchesSearch && matchesSource && matchesTier && matchesStatus;
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

  const getBirthdayColor = (birthday?: string) => {
      if (!birthday) return 'text-slate-400 bg-slate-50 border-slate-200';
      const today = new Date();
      const bdate = new Date(birthday);
      
      // Calculate next birthday date
      const nextBday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
      if (nextBday.getTime() < today.getTime()) {
          nextBday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = Math.abs(nextBday.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays <= 7) return 'text-rose-700 bg-rose-100 border-rose-300 font-bold'; // En menos de 7 días
      if (diffDays <= 30) return 'text-amber-700 bg-amber-100 border-amber-300 font-bold'; // En menos de un mes
      return 'text-slate-600 bg-slate-100 border-slate-200'; // Normal
  };

  return (
    <div className="space-y-4">
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
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <button onClick={() => { if(window.confirm('¿Mandar a INACTIVO a todos los leads sin interacción en más de 30 días?')) cleanGarbageLeads(30); }} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md hover:bg-amber-200 flex items-center gap-1 mr-2 transition-colors">
                <Trash2 className="w-3 h-3"/> Limpiar Basura (30d)
            </button>
            <span className={`text-xs font-bold ${isAdvancedView ? 'text-indigo-600' : 'text-slate-500'}`}>Vista Avanzada</span>
            <button 
                onClick={() => setIsAdvancedView(!isAdvancedView)} 
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAdvancedView ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAdvancedView ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: isAdvancedView ? 'translateX(18px)' : 'translateX(4px)' }} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs">
                    <input 
                        type="checkbox" 
                        onChange={toggleSelectAll}
                        checked={selectedContactIds.length === currentContacts.length && currentContacts.length > 0} 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                    Nombre <SortIcon columnKey="name" />
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('company')}>
                    Empresa <SortIcon columnKey="company" />
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIT/Cédula</th>
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                
                {isAdvancedView && <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('source')}>
                    Origen <SortIcon columnKey="source" />
                </th>
                
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('status')}>
                    Estado <SortIcon columnKey="status" />
                </th>
                
                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                
                {isAdvancedView && (
                    <>
                        <th className="py-3 px-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-50/50">Persona Clave 1</th>
                        <th className="py-3 px-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-50/50">Persona Clave 2</th>
                        <th className="py-3 px-3 text-xs font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-50/50">Persona Clave 3</th>
                        
                        <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('tier')}>
                            Tier <SortIcon columnKey="tier" />
                        </th>
                        <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Etapa KAM</th>
                        <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Últ. Contacto</th>
                    </>
                )}

                <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-slate-200">
              {currentContacts.map(contact => {
                const sourceBadge = getSourceBadge(contact.source);
                const SourceIcon = sourceBadge.icon;
                const isSelected = selectedContactIds.includes(contact.id);
                
                const renderCell = (field: keyof CrmContact, display: React.ReactNode, type: string = 'text') => {
                    const isEditing = editingCell?.contactId === contact.id && editingCell.field === field;
                    return (
                        <td className="py-3 px-3 cursor-pointer hover:bg-slate-100" onClick={() => handleCellClick(contact.id, field)}>
                            {isEditing ? (
                                <input autoFocus className="border border-indigo-400 p-1 w-full text-xs rounded" type={type} defaultValue={String(contact[field] || '')} onBlur={e => handleSave(contact.id, field, e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave(contact.id, field, e.currentTarget.value)} />
                            ) : display}
                        </td>
                    );
                };

                const renderSelectCell = (field: keyof CrmContact, options: {value:string, label:string}[], display: React.ReactNode) => {
                    const isEditing = editingCell?.contactId === contact.id && editingCell.field === field;
                    return (
                        <td className="py-3 px-3 cursor-pointer hover:bg-slate-100" onClick={() => handleCellClick(contact.id, field)}>
                            {isEditing ? (
                                <select autoFocus className="border border-indigo-400 p-1 w-full text-xs rounded" defaultValue={String(contact[field] || '')} onBlur={e => handleSave(contact.id, field, e.target.value)}>
                                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            ) : display}
                        </td>
                    );
                };

                return (
                <tr 
                  key={contact.id} 
                  className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                >
                  <td className="py-3 px-4" onClick={(e) => toggleSelectContact(e, contact.id)}>
                      <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                  </td>
                  
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

                  {renderCell('company', <span className="text-sm text-slate-600 whitespace-nowrap">{contact.company}</span>)}
                  {renderCell('document', <span className="text-sm text-slate-600 font-mono text-xs">{contact.documentType || 'NIT'} {contact.documentNumber || 'N/A'}</span>)}
                  
                  {renderCell('phone', <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap"><Phone className="w-3 h-3" /> {contact.phone}</div>)}
                  
                  {isAdvancedView && renderCell('email', <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap"><Mail className="w-3 h-3" /> {contact.email}</div>, 'email')}
                  
                  {renderSelectCell('source', 
                    ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'GOOGLE_ADS', 'MANUAL', 'STREET', 'REFERRAL', 'WEBSITE'].map(o => ({value:o, label:o})),
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${sourceBadge.color}`}>
                      <SourceIcon className="w-3 h-3" />
                      {sourceBadge.label}
                    </div>
                  )}

                  {renderSelectCell('status', 
                    [{value:'LEAD', label:'Lead'}, {value:'PROSPECTO', label:'Prospecto'}, {value:'VINCULADO', label:'Vinculado'}, {value:'INACTIVO', label:'Inactivo'}],
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${contact.status === 'VINCULADO' ? 'bg-emerald-100 text-emerald-700' : 
                        contact.status === 'PROSPECTO' ? 'bg-amber-100 text-amber-700' : 
                        contact.status === 'LEAD' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'}`}>
                      {contact.status === 'VINCULADO' ? 'Vinculado' : contact.status === 'PROSPECTO' ? 'Prospecto' : contact.status === 'LEAD' ? 'Lead' : 'Inactivo'}
                    </span>
                  )}

                  {renderSelectCell('ownerId',
                    crmUsers.map(u => ({value: u.id, label: u.name})),
                    <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                      {crmUsers.find(u => u.id === contact.ownerId)?.name || 'Sin Asignar'}
                    </span>
                  )}
                  
                  {isAdvancedView && (
                      <>
                        {[0,1,2].map(idx => {
                            const dm = (contact.decisionMakers || [])[idx];
                            if (!dm) return (
                                <td key={idx} className="py-3 px-3 bg-indigo-50/20 cursor-pointer hover:bg-indigo-100/50" onClick={() => handleCellClick(contact.id, `dm-${idx}-name`)}>
                                    {editingCell?.contactId === contact.id && editingCell.field === `dm-${idx}-name` ? (
                                        <input autoFocus className="border border-indigo-400 p-1 w-full text-xs rounded" placeholder="Nombre..." onBlur={e => handleSaveDM(contact.id, idx, 'name', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveDM(contact.id, idx, 'name', e.currentTarget.value)} />
                                    ) : <span className="text-xs text-slate-400 italic">Click para añadir</span>}
                                </td>
                            );
                            return (
                                <td key={idx} className="py-3 px-3 bg-indigo-50/20 whitespace-nowrap cursor-pointer hover:bg-indigo-100/50" onClick={() => handleCellClick(contact.id, `dm-${idx}-name`)}>
                                    {editingCell?.contactId === contact.id && editingCell.field === `dm-${idx}-name` ? (
                                        <div className="flex flex-col gap-1">
                                            <input autoFocus className="border border-indigo-400 p-1 w-full text-[10px] rounded" defaultValue={dm.name} placeholder="Nombre" onBlur={e => handleSaveDM(contact.id, idx, 'name', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveDM(contact.id, idx, 'name', e.currentTarget.value)} />
                                            <input className="border border-indigo-400 p-1 w-full text-[10px] rounded" defaultValue={dm.position} placeholder="Cargo" onBlur={e => handleSaveDM(contact.id, idx, 'position', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveDM(contact.id, idx, 'position', e.currentTarget.value)} />
                                            <input type="date" className="border border-indigo-400 p-1 w-full text-[10px] rounded" defaultValue={dm.birthday} onBlur={e => handleSaveDM(contact.id, idx, 'birthday', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveDM(contact.id, idx, 'birthday', e.currentTarget.value)} />
                                            <input className="border border-indigo-400 p-1 w-full text-[10px] rounded" defaultValue={dm.hobby} placeholder="Hobby" onBlur={e => handleSaveDM(contact.id, idx, 'hobby', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveDM(contact.id, idx, 'hobby', e.currentTarget.value)} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-800">{dm.name} <span className="font-normal text-slate-500">({dm.position})</span></span>
                                            <div className="flex gap-2 items-center">
                                                {dm.birthday && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getBirthdayColor(dm.birthday)}`}>
                                                        🎂 {new Date(dm.birthday).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                                {dm.hobby && <span className="text-[10px] text-slate-500 truncate max-w-[100px]">🎯 {dm.hobby}</span>}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            );
                        })}
                        {renderSelectCell('tier',
                            ['REGULAR', 'STRATEGIC', 'NEW'].map(o => ({value:o, label:o})),
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${contact.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-700' : 
                                contact.tier === 'REGULAR' ? 'bg-blue-100 text-blue-700' : 
                                'bg-slate-100 text-slate-700'}`}>
                            Tier {contact.tier}
                            </span>
                        )}
                        {renderSelectCell('postSaleStage',
                            ['ONBOARDING', 'RENTABILIZACION', 'FIDELIZACION', 'MONITOREO'].map(o => ({value:o, label:o})),
                            <span className="text-xs text-slate-600 font-medium">{contact.postSaleStage || '-'}</span>
                        )}
                        {renderCell('lastContactDate', <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(contact.lastContactDate).toLocaleDateString('es-CO')}</span>, 'date')}
                      </>
                  )}

                  <td className="py-3 px-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onContactClick(contact.id); }} className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors flex justify-end w-full bg-indigo-50 hover:bg-indigo-100 rounded">
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
    </div>
  );
};
