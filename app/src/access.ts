const masterCodeHash: string | undefined = import.meta.env.VITE_MASTER_CODE_HASH

export function hasMasterCode(): boolean {
  return /^[a-f0-9]{64}$/i.test(masterCodeHash ?? '')
}

export async function verifyMasterCode(code: string): Promise<boolean> {
  if (!hasMasterCode()) {
    throw new Error('Master-Zugang ist nicht konfiguriert.')
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

  return hash === masterCodeHash?.toLowerCase()
}
