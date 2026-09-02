export const RIWAYAT_INDICATORS = [
  "energi",
  "mobilitas",
  "mood",
  "nafsu_makan",
  "kualitas_tidur",
] as const;

export type RiwayatIndicator = (typeof RIWAYAT_INDICATORS)[number];

export type HealthSnapshotScore = Record<RiwayatIndicator, number>;

export type DatedHealthSnapshot = HealthSnapshotScore & {
  tanggal: string;
};

export type RiwayatTrend = {
  rata_rata_terakhir: number | null;
  rata_rata_sebelumnya: number | null;
  perubahan: number | null;
  perlu_perhatian: boolean;
  alasan: string | null;
};

export type RiwayatIndicatorTrend = {
  indikator: RiwayatIndicator;
  points: Array<{ tanggal: string; nilai: number }>;
  ringkasan: string | null;
};

type Relation<T> = T | T[] | null | undefined;

type RawEvidence = {
  foto_bukti_url: string | null;
  catatan_kondisi: string | null;
};

type RawSnapshot = HealthSnapshotScore & {
  cerita_hari_ini: string | null;
};

export type RawRiwayatTask = {
  id: string;
  status: string;
  lansia_id: string;
  keluarga_id: string;
  jadwal_waktu: string;
  completed_at: string | null;
  task_evidence: Relation<RawEvidence>;
  health_snapshots: Relation<RawSnapshot>;
};

export type RiwayatVisit = {
  task_id: string;
  submitted_at: string;
  foto_bukti_path: string | null;
  catatan_kondisi: string | null;
  cerita_hari_ini: string | null;
  snapshot: HealthSnapshotScore | null;
};

export const RIWAYAT_DISCLAIMER = "Riwayat ini membantu keluarga melihat pola kunjungan dan bukan diagnosis medis.";

export class RiwayatDataAccessError extends Error {
  readonly stage: "auth" | "ownership" | "timeline" | "signing";
  readonly code: string;

  constructor(
    stage: "auth" | "ownership" | "timeline" | "signing",
    code: string,
  ) {
    super("Riwayat data access failed");
    this.name = "RiwayatDataAccessError";
    this.stage = stage;
    this.code = code;
  }
}

type RiwayatActor = { id: string };
type RiwayatLansia = { id: string; nama: string };

type RiwayatHandlerDependencies = {
  authenticate: () => Promise<RiwayatActor | null>;
  findOwnedLansia: (lansiaId: string, keluargaId: string) => Promise<RiwayatLansia | null>;
  findTasks: (lansiaId: string, keluargaId: string) => Promise<RawRiwayatTask[]>;
  signEvidence: (path: string | null) => Promise<string | null>;
  reportError: (event: {
    requestId: string;
    stage: string;
    code: string;
    errorName: string;
  }) => void;
};

function firstRelation<T>(value: Relation<T>) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function isValidHealthSnapshot(value: unknown): value is HealthSnapshotScore {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return RIWAYAT_INDICATORS.every((indicator) => {
    const score = record[indicator];
    return Number.isInteger(score) && Number(score) >= 1 && Number(score) <= 5;
  });
}

export function averageSnapshot(snapshot: HealthSnapshotScore) {
  const total = RIWAYAT_INDICATORS.reduce((sum, indicator) => sum + snapshot[indicator], 0);
  return Number((total / RIWAYAT_INDICATORS.length).toFixed(2));
}

function sortDatedSnapshots<T extends { tanggal?: string }>(snapshots: T[]) {
  return [...snapshots].sort((left, right) => {
    if (!left.tanggal || !right.tanggal) return 0;
    return new Date(left.tanggal).getTime() - new Date(right.tanggal).getTime();
  });
}

export function calculateRiwayatTrend(
  snapshots: Array<HealthSnapshotScore & { tanggal?: string }>,
): RiwayatTrend {
  const validSnapshots = sortDatedSnapshots(snapshots.filter((snapshot) => isValidHealthSnapshot(snapshot)));
  const averages = validSnapshots.map(averageSnapshot);
  const last = averages.at(-1) ?? null;
  const previous = averages.at(-2) ?? null;
  const latestThree = averages.slice(-3);
  const declining = latestThree.length === 3
    && latestThree[1] < latestThree[0]
    && latestThree[2] < latestThree[1];

  return {
    rata_rata_terakhir: last,
    rata_rata_sebelumnya: previous,
    perubahan: last !== null && previous !== null ? Number((last - previous).toFixed(2)) : null,
    perlu_perhatian: declining,
    alasan: declining ? "Rata-rata kondisi menurun dalam tiga kunjungan berturut-turut." : null,
  };
}

export function calculateIndicatorTrends(
  snapshots: DatedHealthSnapshot[],
): RiwayatIndicatorTrend[] {
  const ordered = sortDatedSnapshots(snapshots.filter((snapshot) => isValidHealthSnapshot(snapshot)));
  return RIWAYAT_INDICATORS.map((indikator) => {
    const points = ordered.map((snapshot) => ({ tanggal: snapshot.tanggal, nilai: snapshot[indikator] }));
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

export function mapRiwayatTasks(
  tasks: RawRiwayatTask[],
  scope?: { lansiaId: string; keluargaId: string },
) {
  const visits = tasks
    .filter((task) => task.status === "selesai")
    .filter((task) => !scope || (
      task.lansia_id === scope.lansiaId
      && task.keluarga_id === scope.keluargaId
    ))
    .map((task): RiwayatVisit => {
      const evidence = firstRelation(task.task_evidence);
      const rawSnapshot = firstRelation(task.health_snapshots);
      const validSnapshot = isValidHealthSnapshot(rawSnapshot) ? rawSnapshot : null;
      return {
        task_id: task.id,
        submitted_at: task.completed_at ?? task.jadwal_waktu,
        foto_bukti_path: evidence?.foto_bukti_url ?? null,
        catatan_kondisi: evidence?.catatan_kondisi ?? null,
        cerita_hari_ini: validSnapshot?.cerita_hari_ini ?? null,
        snapshot: validSnapshot ? Object.fromEntries(
          RIWAYAT_INDICATORS.map((indicator) => [indicator, validSnapshot[indicator]]),
        ) as HealthSnapshotScore : null,
      };
    })
    .sort((left, right) => new Date(left.submitted_at).getTime() - new Date(right.submitted_at).getTime());

  const trendSnapshots = visits.flatMap((visit): DatedHealthSnapshot[] => visit.snapshot
    ? [{ tanggal: visit.submitted_at, ...visit.snapshot }]
    : []);

  return { visits, trendSnapshots };
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function createRiwayatRangkulHandler(dependencies: RiwayatHandlerDependencies) {
  return async function handleRiwayat(
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const requestId = crypto.randomUUID();

    try {
      const { id: lansiaId } = await context.params;
      const actor = await dependencies.authenticate();
      if (!actor) {
        return jsonResponse({ error: "unauthorized", message: "Anda harus login" }, 401);
      }

      const lansia = await dependencies.findOwnedLansia(lansiaId, actor.id);
      if (!lansia) {
        return jsonResponse({ error: "not_found", message: "Profil lansia tidak ditemukan" }, 404);
      }

      const tasks = await dependencies.findTasks(lansiaId, actor.id);
      const { visits, trendSnapshots } = mapRiwayatTasks(tasks, {
        lansiaId,
        keluargaId: actor.id,
      });
      const timeline = await Promise.all(visits.map(async (visit) => ({
        task_id: visit.task_id,
        selesai_at: visit.submitted_at,
        foto_bukti_url: await dependencies.signEvidence(visit.foto_bukti_path),
        catatan_kondisi: visit.catatan_kondisi,
        cerita_hari_ini: visit.cerita_hari_ini,
        scores: visit.snapshot,
      })));
      const summary = calculateRiwayatTrend(trendSnapshots);

      return jsonResponse({
        data: {
          lansia,
          timeline,
          tren: calculateIndicatorTrends(trendSnapshots),
          ringkasan: summary,
          perlu_perhatian: summary.perlu_perhatian,
          disclaimer: RIWAYAT_DISCLAIMER,
        },
      }, 200);
    } catch (error: unknown) {
      const dataError = error instanceof RiwayatDataAccessError ? error : null;
      dependencies.reportError({
        requestId,
        stage: dataError?.stage ?? "handler",
        code: dataError?.code ?? "unexpected",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      return jsonResponse({ error: "server_error", message: "Riwayat belum dapat dimuat" }, 500);
    }
  };
}
