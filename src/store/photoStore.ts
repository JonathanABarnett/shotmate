/** Photo pixels live in IndexedDB — far roomier than localStorage. */

const DB_NAME = "shotmate-photos";
const STORE = "photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = op(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

export function savePhotoBlob(id: string, blob: Blob): Promise<IDBValidKey> {
  return run("readwrite", (s) => s.put(blob, id));
}

export function loadPhotoBlob(id: string): Promise<Blob | undefined> {
  return run("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
}

export function deletePhotoBlob(id: string): Promise<undefined> {
  return run("readwrite", (s) => s.delete(id) as IDBRequest<undefined>);
}

export function clearPhotoBlobs(): Promise<undefined> {
  return run("readwrite", (s) => s.clear() as IDBRequest<undefined>);
}

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.85;

/** Downscale a picked image so a year of photos stays lightweight. */
export async function preparePhotoBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", JPEG_QUALITY)
  );
}
