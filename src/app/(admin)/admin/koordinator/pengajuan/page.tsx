export default function Page() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-foreground mb-2">
        Pengajuan Koordinator
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Daftar pengajuan akun koordinator yang menunggu verifikasi admin.
      </p>
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada pengajuan yang masuk.
        </p>
      </div>
    </div>
  );
}
