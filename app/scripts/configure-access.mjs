import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const envFile = fileURLToPath(new URL('../.env.local', import.meta.url))
const terminal = createInterface({ input: process.stdin, output: process.stdout })

try {
  console.log('Nur einen eigenen Office-Zugangscode verwenden, kein echtes oder wiederverwendetes Passwort.')
  const code = await terminal.question('Master-Zugangscode (Eingabe sichtbar, wird nicht gespeichert): ')
  if (!code.trim()) throw new Error('Der Zugangscode darf nicht leer sein.')
  const hash = createHash('sha256').update(code).digest('hex')
  let existing = ''
  try {
    existing = await readFile(envFile, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const otherLines = existing.split(/\r?\n/).filter((line) =>
    !/^\s*VITE_MASTER_CODE_HASH\s*=/.test(line),
  ).join('\n').trimEnd()
  await writeFile(envFile, `${otherLines ? `${otherLines}\n` : ''}VITE_MASTER_CODE_HASH=${hash}\n`)
  console.log('Pruefwert in app\\.env.local gespeichert. Laufenden Dev-Server neu starten.')
  console.log(`GitHub-Actions-Repositoryvariable MASTER_CODE_HASH:\n${hash}`)
} catch (error) {
  console.error(`Zugangskonfiguration fehlgeschlagen: ${error.message}`)
  process.exitCode = 1
} finally {
  terminal.close()
}
