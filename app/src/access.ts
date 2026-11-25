const masterCodeHash: string | undefined = import.meta.env.VITE_MASTER_CODE_HASH
const masterSessionCookie = 'seal_kickerturnier_master_session=1'

export function hasMasterCode(): boolean {
  return /^[a-f0-9]{64}$/i.test(masterCodeHash ?? '')
}

export function hasMasterSession(): boolean {
  return hasMasterCode() && document.cookie.split(';').some((cookie) => cookie.trim() === masterSessionCookie)
}

export function rememberMasterSession(): boolean {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${masterSessionCookie}; Path=${import.meta.env.BASE_URL}; SameSite=Lax${secure}`
  return hasMasterSession()
}

async function hashCode(code: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function verifyMasterCode(code: string): Promise<boolean> {
  if (!hasMasterCode()) {
    throw new Error('Master-Zugang ist nicht konfiguriert.')
  }

  return await hashCode(code) === masterCodeHash?.toLowerCase()
}
