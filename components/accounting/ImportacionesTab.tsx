import React from 'react';
import { ImportInvoicesPanel } from '../ImportInvoicesPanel';

export const ImportacionesTab: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full overflow-y-auto">
            <ImportInvoicesPanel />
        </div>
    );
};
