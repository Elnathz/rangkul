"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { ArrowLeft, Camera, Activity, FileText } from "lucide-react";

export default function LaporanHelperPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const task = MOCK_TASKS.find(t => t.id === taskId) || MOCK_TASKS[0];
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    catatan_kondisi: "",
    skor_energi: 3,
    skor_mobilitas: 3,
    skor_mood: 3,
    skor_nafsu_makan: 3,
    skor_tidur: 3,
    cerita_hari_ini: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulasi upload laporan & health snapshot
    setTimeout(() => {
      setIsSubmitting(false);
      // Di aplikasi asli, kita redirect kembali ke detail tugas (yang statusnya sudah berubah)
      router.push(`/tugas/${task.id}`);
    }, 1500);
  };

  const renderSkorInput = (name: keyof typeof form, label: string) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-foreground">{label}</Label>
        <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
          {form[name]} / 5
        </span>
      </div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setForm(prev => ({ ...prev, [name]: val }))}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              form[name] === val 
                ? "bg-primary text-primary-foreground shadow-md transform scale-105" 
                : "bg-white text-muted-foreground border hover:bg-muted"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Buruk/Rendah</span>
        <span>Sangat Baik</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-white shadow-sm border border-border">
            <Link href={`/tugas/${task.id}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Buat Laporan</h1>
            <p className="text-sm text-muted-foreground">Lansia: {task.lansia.nama}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Card className="shadow-sm">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Bukti Kunjungan
              </CardTitle>
              <CardDescription>Upload foto bersama lansia atau bukti penyelesaian.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/20 cursor-pointer hover:bg-muted/50 transition-colors">
                <Camera className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium">Klik untuk upload foto</p>
                <p className="text-xs text-muted-foreground mt-1">Format JPG/PNG maks 5MB. Akan di-compress otomatis.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="catatan" className="font-semibold">Catatan Umum</Label>
                <Textarea 
                  id="catatan"
                  placeholder="Ceritakan secara singkat apa yang dilakukan hari ini..."
                  value={form.catatan_kondisi}
                  onChange={(e) => setForm(prev => ({ ...prev, catatan_kondisi: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-t-green-500">
            <CardHeader className="bg-green-50/50 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Activity className="w-5 h-5" />
                Health Snapshot
              </CardTitle>
              <CardDescription>Penilaian kondisi lansia hari ini (1 = Sangat Kurang, 5 = Sangat Baik)</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {renderSkorInput("skor_energi", "Energi & Semangat")}
              {renderSkorInput("skor_mobilitas", "Pergerakan Fisik")}
              {renderSkorInput("skor_mood", "Suasana Hati (Mood)")}
              {renderSkorInput("skor_nafsu_makan", "Nafsu Makan")}
              {renderSkorInput("skor_tidur", "Kualitas Tidur Semalam")}

              <div className="space-y-2 pt-4">
                <Label htmlFor="cerita" className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Memory Capsule (Cerita Hari Ini)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">Ceritakan momen berkesan hari ini yang bisa dikenang keluarga.</p>
                <Textarea 
                  id="cerita"
                  placeholder="Misal: Bapak hari ini sangat senang menceritakan masa mudanya saat..."
                  value={form.cerita_hari_ini}
                  onChange={(e) => setForm(prev => ({ ...prev, cerita_hari_ini: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 border-t">
              <Button type="submit" className="w-full bg-brand-gradient text-white" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan & Selesaikan Tugas"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
