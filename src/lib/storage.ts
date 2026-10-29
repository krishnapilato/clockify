const ALGORITHM = { name: "AES-GCM", length: 256 } as const;
const IV_LENGTH = 12;

const request = async <T>(action: IDBRequest<T>): Promise<T> => {
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  action.addEventListener("success", () => {
    resolve(action.result);
  });
  action.addEventListener("error", () => {
    reject(action.error ?? new Error("IndexedDB request failed"));
  });
  return promise;
};

const openKeyStore = async (): Promise<IDBDatabase> => {
  const opening = indexedDB.open("clockify", 1);
  opening.addEventListener("upgradeneeded", () => {
    opening.result.createObjectStore("keys");
  });
  return request(opening);
};

const loadKey = async (): Promise<CryptoKey> => {
  const database = await openKeyStore();
  const saved: unknown = await request(
    database.transaction("keys").objectStore("keys").get("settings"),
  );
  if (saved instanceof CryptoKey) return saved;
  const key = await crypto.subtle.generateKey(ALGORITHM, false, ["encrypt", "decrypt"]);
  await request(database.transaction("keys", "readwrite").objectStore("keys").put(key, "settings"));
  return key;
};

let settingsKey: Promise<CryptoKey> | undefined;

const getKey = async (): Promise<CryptoKey> => (settingsKey ??= loadKey());

export const saveSetting = async (name: string, value: string): Promise<void> => {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const sealed = await crypto.subtle.encrypt(
      { name: ALGORITHM.name, iv },
      await getKey(),
      new TextEncoder().encode(value),
    );
    localStorage.setItem(name, new Uint8Array([...iv, ...new Uint8Array(sealed)]).toBase64());
  } catch {
    localStorage.removeItem(name);
  }
};

export const readSetting = async (name: string): Promise<string | undefined> => {
  const stored = localStorage.getItem(name);
  if (stored === null) return undefined;
  try {
    const bytes = Uint8Array.fromBase64(stored);
    const opened = await crypto.subtle.decrypt(
      { name: ALGORITHM.name, iv: bytes.subarray(0, IV_LENGTH) },
      await getKey(),
      bytes.subarray(IV_LENGTH),
    );
    return new TextDecoder().decode(opened);
  } catch {
    localStorage.removeItem(name);
    return undefined;
  }
};
