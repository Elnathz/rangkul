export default function Page() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-foreground mb-2">
        Banding
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Daftar permohonan banding dari pengguna yang akunnya ditangguhkan atau dinonaktifkan.
      </p>
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada permohonan banding yang masuk.
        </p>
      </div>
    </div>
  );
}
