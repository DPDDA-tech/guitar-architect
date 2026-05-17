import { UserInstrument } from '../types';

const DB_NAME = 'guitar-architect-instruments';
const DB_VERSION = 1;
const STORE_NAME = 'instruments';

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const runStore = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> => {
  const db = await openDb();

  return new Promise<T | void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      transaction.oncomplete = () => resolve(undefined);
    }

    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }).finally(() => db.close());
};

export const listInstruments = async (): Promise<UserInstrument[]> => {
  const result = await runStore<UserInstrument[]>('readonly', store => store.getAll());
  return ((result || []) as UserInstrument[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const saveInstrument = async (instrument: UserInstrument): Promise<void> => {
  await runStore('readwrite', store => {
    store.put(instrument);
  });
};

export const replaceInstruments = async (instruments: UserInstrument[]): Promise<void> => {
  await runStore('readwrite', store => {
    store.clear();
    instruments.forEach(instrument => store.put(instrument));
  });
};

export const deleteInstrument = async (id: string): Promise<void> => {
  await runStore('readwrite', store => {
    store.delete(id);
  });
};

export const createEmptyInstrument = (): UserInstrument => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    brand: '',
    model: '',
    version: '',
    color: '',
    originCountry: '',
    serialNumber: '',
    manufactureYear: '',
    strings: '6',
    purchaseDate: '',
    paidValue: '',
    stringGauge: '',
    nutMaterial: '',
    lastStringChange: '',
    bodyType: '',
    bridgeType: '',
    fretCount: '',
    fretType: '',
    neckShape: '',
    fretboardRadius: '',
    bridgePickup: '',
    middlePickup: '',
    neckPickup: '',
    bodyWood: '',
    topWood: '',
    neckWood: '',
    fretboardWood: '',
    notes: '',
    maintenance: [],
  };
};

export const compressInstrumentPhoto = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = () => reject(new Error('Unable to read image'));
    image.src = String(reader.result || '');
  };

  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});
