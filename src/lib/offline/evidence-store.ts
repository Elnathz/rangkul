export type OfflineEvidenceStatus = "pending_sync" | "syncing" | "submitted" | "failed";

export type OfflineEvidenceDraft = {
  id: string;
  task_id: string;
  client_submission_id: string;
  photo: Blob;
  catatan_kondisi: string;
  skor_energi: number;
  skor_mobilitas: number;
  skor_mood: number;
  skor_nafsu_makan: number;
  skor_tidur: number;
  cerita_hari_ini: string;
  status: OfflineEvidenceStatus;
  retry_count: number;
  error_message: string | null;
  updated_at: string;
};

const DATABASE_NAME = "rangkul-offline";
const DATABASE_VERSION = 1;
const STORE_NAME = "evidence-drafts";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia di perangkat ini"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("task_id", "task_id", { unique: false });
        store.createIndex("status", "status", { unique: false });
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

export async function getEvidenceDraft(taskId: string): Promise<OfflineEvidenceDraft | null> {
  const database = await openDatabase();
  const draft = await new Promise<OfflineEvidenceDraft | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("task_id").get(taskId);
    request.onsuccess = () => resolve((request.result as OfflineEvidenceDraft | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Draf gagal dibaca"));
  });
  database.close();
  return draft;
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
