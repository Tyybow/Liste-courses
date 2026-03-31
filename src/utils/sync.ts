const ROOM_CODE_KEY = 'liste-courses-room-code';

export function getRoomCode(): string | null {
  return localStorage.getItem(ROOM_CODE_KEY);
}

export function setRoomCode(code: string) {
  localStorage.setItem(ROOM_CODE_KEY, code.toUpperCase());
}

export function clearRoomCode() {
  localStorage.removeItem(ROOM_CODE_KEY);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

export interface SyncData {
  ingredients: unknown[];
  recipes: unknown[];
  meals: unknown[];
  shoppingList: unknown[];
  manualShoppingItems: unknown[];
  nonFoodItems: unknown[];
  shoppingNonFood: unknown[];
  lastModified: number;
}

export async function loadFromCloud(roomCode: string): Promise<SyncData | null> {
  try {
    const res = await fetch(`/api/sync?room=${encodeURIComponent(roomCode)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur de chargement');
    }
    const { data } = await res.json();
    return data as SyncData;
  } catch (err) {
    console.error('Erreur chargement cloud:', err);
    throw err;
  }
}

export async function saveToCloud(roomCode: string, data: SyncData): Promise<void> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomCode, data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur de sauvegarde');
    }
  } catch (err) {
    console.error('Erreur sauvegarde cloud:', err);
  }
}
