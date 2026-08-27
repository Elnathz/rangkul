export type HealthSnapshotScore = {
  energi: number;
  mobilitas: number;
  mood: number;
  nafsu_makan: number;
  kualitas_tidur: number;
};

export type RiwayatTrend = {
  rata_rata_terakhir: number | null;
  rata_rata_sebelumnya: number | null;
  perubahan: number | null;
  perlu_perhatian: boolean;
  alasan: string | null;
};

export type RiwayatIndicator = keyof HealthSnapshotScore;

export type RiwayatIndicatorTrend = {
  indikator: RiwayatIndicator;
  points: Array<{ tanggal: string; nilai: number }>;
  ringkasan: string | null;
};

export function averageSnapshot(snapshot: HealthSnapshotScore) {
  return Number(((snapshot.energi + snapshot.mobilitas + snapshot.mood + snapshot.nafsu_makan + snapshot.kualitas_tidur) / 5).toFixed(2));
}

export function calculateRiwayatTrend(snapshots: HealthSnapshotScore[]): RiwayatTrend {
  const averages = snapshots.map(averageSnapshot);
  const last = averages.at(-1) ?? null;
  const previous = averages.at(-2) ?? null;
  const declining = averages.length >= 3 && averages.slice(-3).every((value, index, values) => index === 0 || value < values[index - 1]);

  return {
    rata_rata_terakhir: last,
    rata_rata_sebelumnya: previous,
    perubahan: last !== null && previous !== null ? Number((last - previous).toFixed(2)) : null,
    perlu_perhatian: declining,
    alasan: declining ? 'Rata-rata kondisi menurun dalam tiga kunjungan berturut-turut.' : null,
  };
}

export function calculateIndicatorTrends(
  snapshots: Array<HealthSnapshotScore & { tanggal: string }>,
): RiwayatIndicatorTrend[] {
  const indicators: RiwayatIndicator[] = ["energi", "mobilitas", "mood", "nafsu_makan", "kualitas_tidur"];
  return indicators.map((indikator) => {
    const points = snapshots.map((snapshot) => ({ tanggal: snapshot.tanggal, nilai: snapshot[indikator] }));
    const first = points[0]?.nilai;
    const last = points.at(-1)?.nilai;
    return {
      indikator,
      points,
      ringkasan: first !== undefined && last !== undefined && points.length > 1
        ? `${last > first ? "Naik" : last < first ? "Turun" : "Stabil"} dari ${first} menjadi ${last}.`
        : null,
    };
  });
}
