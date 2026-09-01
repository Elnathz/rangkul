export type OfflineEvidenceStatus = "draft" | "pending_sync" | "syncing" | "submitted" | "failed";

export type OfflineEvidenceDraft = {
  id: string;
  owner_user_id: string;
  task_id: string;
  client_submission_id: string;
  photo: Blob;
  photo_preview_url?: string;
  lansia_nama?: string;
  kategori_nama?: string;
  catatan_kondisi: string;
  skor_energi: number | null;
  skor_mobilitas: number | null;
  skor_mood: number | null;
  skor_nafsu_makan: number | null;
  skor_tidur: number | null;
  cerita_hari_ini: string;
  status: OfflineEvidenceStatus;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

const DATABASE_NAME = "rangkul-offline";
const DATABASE_VERSION = 2;
const STORE_NAME = "evidence-drafts";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia di perangkat ini"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = (event) => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("task_id", "task_id", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("owner_user_id", "owner_user_id", { unique: false });
        store.createIndex("owner_task", ["owner_user_id", "task_id"], { unique: true });
      } else {
        // Version upgrade: add owner_user_id index if missing
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
        if (oldVersion < 2) {
          const store = request.transaction!.objectStore(STORE_NAME);
          if (!store.indexNames.contains("owner_user_id")) {
            store.createIndex("owner_user_id", "owner_user_id", { unique: false });
          }
          if (!store.indexNames.contains("owner_task")) {
            store.createIndex("owner_task", ["owner_user_id", "task_id"], { unique: true });
          }
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Database offline gagal dibuka"));
  });
}

export async function saveEvidenceDraft(draft: OfflineEvidenceDraft): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(draft);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Draf gagal disimpan"));
  });
  database.close();
}

export async function getEvidenceDraft(ownerId: string, taskId: string): Promise<OfflineEvidenceDraft | null> {
  const database = await openDatabase();
  const draft = await new Promise<OfflineEvidenceDraft | null>((resolve, reject) => {
    const index = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("owner_task");
    const request = index.get([ownerId, taskId]);
    request.onsuccess = () => resolve((request.result as OfflineEvidenceDraft | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Draf gagal dibaca"));
  });
  database.close();
  return draft;
}

export async function getPendingDrafts(ownerId: string): Promise<OfflineEvidenceDraft[]> {
  const database = await openDatabase();
  const allDrafts = await new Promise<OfflineEvidenceDraft[]>((resolve, reject) => {
    const index = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("owner_user_id");
    const request = index.getAll(ownerId);
    request.onsuccess = () => resolve((request.result as OfflineEvidenceDraft[]).filter(d => d.status === "pending_sync" || d.status === "failed"));
    request.onerror = () => reject(request.error ?? new Error("Draf gagal dibaca"));
  });
  database.close();
  return allDrafts;
}

export async function getAllDrafts(ownerId: string): Promise<OfflineEvidenceDraft[]> {
  const database = await openDatabase();
  const allDrafts = await new Promise<OfflineEvidenceDraft[]>((resolve, reject) => {
    const index = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("owner_user_id");
    const request = index.getAll(ownerId);
    request.onsuccess = () => resolve(
      (request.result as OfflineEvidenceDraft[]).sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    );
    request.onerror = () => reject(request.error ?? new Error("Draf gagal dibaca"));
  });
  database.close();
  return allDrafts;
}

export async function deleteEvidenceDraft(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Draf gagal dihapus"));
  });
  database.close();
}
