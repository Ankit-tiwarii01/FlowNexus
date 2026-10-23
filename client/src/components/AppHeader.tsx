import { ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export function AppHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5 sm:px-8">
      <Link to="/workflows"><Logo /></Link>
      <div className="relative">
        <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 text-sm font-medium hover:bg-gray-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 font-bold text-brand-700">{initials}</span>
          <span className="hidden sm:block">{user?.name}</span><ChevronDown size={15} className="text-gray-400" />
        </button>
        {open && <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-soft"><div className="border-b border-gray-100 px-3 py-2"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="truncate text-xs text-gray-500">{user?.email}</p></div><button onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600"><LogOut size={16} /> Sign out</button></div>}
      </div>
    </header>
  );
}
