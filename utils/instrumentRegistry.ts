import { UserInstrument } from '../types';
import { loadConfig } from './persistence';

const DB_NAME = 'guitar-architect-instruments';
const DB_VERSION = 2;
const STORE_NAME = 'instruments';

const getCurrentUserId = (): string => {
  try {
    const config = loadConfig();
    return config?.currentUser || 'guest';
  } catch {
    return 'guest';
  }
};

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    const store = db.objectStoreNames.contains(STORE_NAME)
      ? request.transaction?.objectStore(STORE_NAME)
      : db.createObjectStore(STORE_NAME, { keyPath: 'id' });

    if (store && !store.indexNames.contains('userId')) {
      store.createIndex('userId', 'userId', { unique: false });
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

export const listInstruments = async (userId?: string): Promise<UserInstrument[]> => {
  const currentUserId = userId || getCurrentUserId();
  const result = await runStore<UserInstrument[]>('readonly', store => {
    if (store.indexNames.contains('userId')) {
      const index = store.index('userId');
      return index.getAll(IDBKeyRange.only(currentUserId));
    }

    return store.getAll();
  });
  return ((result || []) as UserInstrument[])
    .filter(i => i.userId === currentUserId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const saveInstrument = async (instrument: UserInstrument, userId?: string): Promise<void> => {
  const currentUserId = userId || getCurrentUserId();
  const instrumentWithUser = { ...instrument, userId: currentUserId };
  await runStore('readwrite', store => {
    store.put(instrumentWithUser);
  });
};

export const replaceInstruments = async (instruments: UserInstrument[], userId?: string): Promise<void> => {
  const currentUserId = userId || getCurrentUserId();

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const putAll = () => {
      instruments.forEach(instrument => {
        store.put({ ...instrument, userId: currentUserId });
      });
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);

    if (store.indexNames.contains('userId')) {
      const cursorRequest = store.index('userId').openCursor(IDBKeyRange.only(currentUserId));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
          return;
        }
        putAll();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      return;
    }

    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
      (getAllRequest.result as UserInstrument[])
        .filter(instrument => instrument.userId === currentUserId)
        .forEach(instrument => store.delete(instrument.id));
      putAll();
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);
  }).finally(() => {
    db.close();
  });
};

export const deleteInstrument = async (id: string, userId?: string): Promise<void> => {
  const currentUserId = userId || getCurrentUserId();
  const allResults = await runStore<UserInstrument[]>('readonly', store => store.get(id));
  const instrument = allResults as unknown as UserInstrument | undefined;
  
  // Only delete if it belongs to current user
  if (instrument && instrument.userId === currentUserId) {
    await runStore('readwrite', store => {
      store.delete(id);
    });
  } else if (!instrument) {
    // Instrument doesn't exist - that's ok
    return;
  } else {
    // Attempt to delete instrument from different user - security violation
    console.warn('[GA] Security: Attempted to delete instrument from different user account');
  }
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
