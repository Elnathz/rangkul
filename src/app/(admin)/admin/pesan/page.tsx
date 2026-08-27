export const dynamic = "force-dynamic";

export default function AdminPesanPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] h-full p-8 text-center">
      <div className="w-32 h-32 mb-6 opacity-20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-slate-800">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-light text-slate-700 mb-2">Rangkul Admin Chat</h2>
      <p className="text-slate-500 max-w-sm">
        Pilih pesan dari daftar di sebelah kiri untuk mulai mengobrol dengan Pengguna.
      </p>
    </div>
  );
}
