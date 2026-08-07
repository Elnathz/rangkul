import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MoreVertical, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const users = [
    { id: 'USR-001', name: 'Budi (Koordinator)', role: 'Koordinator', status: 'Active' },
    { id: 'USR-002', name: 'Siti Aminah', role: 'Helper', status: 'Verified' },
    { id: 'USR-003', name: 'Rina Sulastri', role: 'Helper', status: 'Under_Review' },
    { id: 'USR-004', name: 'Johan', role: 'Keluarga', status: 'Restricted' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direktori Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola data seluruh *user* yang terdaftar.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
             <input type="text" placeholder="Cari nama atau ID..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left font-sans text-sm">
           <thead className="bg-[#F5F8FC] border-b border-gray-100">
             <tr>
               <th className="px-6 py-4 font-bold text-gray-700">Nama Pengguna</th>
               <th className="px-6 py-4 font-bold text-gray-700">ID / UUID</th>
               <th className="px-6 py-4 font-bold text-gray-700">Peran Sistem</th>
               <th className="px-6 py-4 font-bold text-gray-700">Status</th>
               <th className="px-6 py-4 font-bold text-gray-700 text-right">Aksi</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {users.map(user => (
               <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-semibold text-xs">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'Under_Review' || user.status === 'Restricted' ? (
                      <span className="text-red-600 bg-red-50 flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs w-max">
                        <AlertCircle className="w-3.5 h-3.5" /> {user.status}
                      </span>
                    ) : (
                      <span className="text-[#0D47A1] bg-blue-50 flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs w-max">
                        <ShieldCheck className="w-3.5 h-3.5" /> {user.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">
                       <MoreVertical className="w-4 h-4 text-gray-400" />
                    </Button>
                  </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}