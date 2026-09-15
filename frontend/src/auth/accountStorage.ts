let memberId: string | null = null;
export function setStorageMember(id: string | null) { memberId = id; }
export const accountStorage = {
  getItem(key: string): string | null { return memberId ? localStorage.getItem(key + ':member:' + memberId) : null; },
  setItem(key: string, value: string) { if (memberId) localStorage.setItem(key + ':member:' + memberId, value); },
};
export function clearMemberStorage() {
  if (!memberId) return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('incheonguro-') && key.endsWith(':member:' + memberId)) localStorage.removeItem(key);
  }
}
