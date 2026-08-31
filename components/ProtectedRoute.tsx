import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { activeRole } = useAuthStore();

  // If the user's current role is not in the allowed list, block access
  if (!allowedRoles.includes(activeRole)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center text-slate-800">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Restringido</h1>
          <p className="text-slate-500 mb-8">
            Tu rol actual (<span className="font-semibold text-slate-700">{activeRole}</span>) no tiene permisos para acceder a este módulo. Por favor, contacta a un administrador si crees que esto es un error.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel Principal
          </Link>
        </div>
      </div>
    );
  }

  // If authorized, render the protected component
  return <>{children}</>;
};
