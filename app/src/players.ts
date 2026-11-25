export interface Player {
  id: string
  nickname: string
  avatar: string
}

export interface PlayerDraft {
  nickname: string
  avatar: string
}

export type PlayerErrors = Partial<Record<keyof PlayerDraft, string>>

export const avatars = [
  { emoji: '🐶', label: 'Hund' }, { emoji: '🐱', label: 'Katze' },
  { emoji: '🐭', label: 'Maus' }, { emoji: '🐹', label: 'Hamster' },
  { emoji: '🐰', label: 'Hase' }, { emoji: '🦊', label: 'Fuchs' },
  { emoji: '🐻', label: 'Bär' }, { emoji: '🐼', label: 'Panda' },
  { emoji: '🐨', label: 'Koala' }, { emoji: '🐯', label: 'Tiger' },
  { emoji: '🦁', label: 'Löwe' }, { emoji: '🐮', label: 'Kuh' },
  { emoji: '🐷', label: 'Schwein' }, { emoji: '🐸', label: 'Frosch' },
  { emoji: '🐵', label: 'Affe' }, { emoji: '🐔', label: 'Huhn' },
  { emoji: '🐧', label: 'Pinguin' }, { emoji: '🐦', label: 'Vogel' },
  { emoji: '🦆', label: 'Ente' }, { emoji: '🦉', label: 'Eule' },
  { emoji: '🦇', label: 'Fledermaus' }, { emoji: '🐺', label: 'Wolf' },
  { emoji: '🐴', label: 'Pferd' }, { emoji: '🦄', label: 'Einhorn' },
  { emoji: '🐝', label: 'Biene' }, { emoji: '🦋', label: 'Schmetterling' },
  { emoji: '🐞', label: 'Marienkäfer' }, { emoji: '🐢', label: 'Schildkröte' },
  { emoji: '🐍', label: 'Schlange' }, { emoji: '🦎', label: 'Eidechse' },
  { emoji: '🦖', label: 'Tyrannosaurus' }, { emoji: '🐙', label: 'Oktopus' },
  { emoji: '🦑', label: 'Kalmar' }, { emoji: '🦀', label: 'Krabbe' },
  { emoji: '🐠', label: 'Tropenfisch' }, { emoji: '🐬', label: 'Delfin' },
  { emoji: '🐳', label: 'Wal' }, { emoji: '🦈', label: 'Hai' },
  { emoji: '🐊', label: 'Krokodil' }, { emoji: '🐘', label: 'Elefant' },
  { emoji: '🦏', label: 'Nashorn' }, { emoji: '🦒', label: 'Giraffe' },
  { emoji: '🦓', label: 'Zebra' }, { emoji: '🦍', label: 'Gorilla' },
  { emoji: '🐪', label: 'Kamel' }, { emoji: '🦙', label: 'Lama' },
  { emoji: '🦘', label: 'Känguru' }, { emoji: '🦥', label: 'Faultier' },
  { emoji: '🦦', label: 'Otter' }, { emoji: '🦔', label: 'Igel' },
  { emoji: '🐿️', label: 'Eichhörnchen' }, { emoji: '🦜', label: 'Papagei' },
  { emoji: '🦚', label: 'Pfau' }, { emoji: '🦩', label: 'Flamingo' },
  { emoji: '🦢', label: 'Schwan' }, { emoji: '🦭', label: 'Robbe' },
  { emoji: '🦫', label: 'Biber' }, { emoji: '🦬', label: 'Bison' },
  { emoji: '🦌', label: 'Hirsch' }, { emoji: '🐏', label: 'Widder' },
  { emoji: '🐐', label: 'Ziege' }, { emoji: '🐓', label: 'Hahn' },
  { emoji: '🦃', label: 'Truthahn' }, { emoji: '👩🏽‍💻', label: 'Technikerin' },
] as const

const nameCollator = new Intl.Collator('de', { sensitivity: 'accent' })

export function comparePlayerNames(first: string, second: string): number {
  return nameCollator.compare(first, second)
}

export function validatePlayerDraft(
  draft: PlayerDraft,
  players: readonly Player[],
  editingId?: string,
): { player: PlayerDraft; errors?: never } | { errors: PlayerErrors; player?: never } {
  const errors: PlayerErrors = {}
  const nickname = draft.nickname.trim()
  const others = players.filter((player) => player.id !== editingId)
  if (!nickname) {
    errors.nickname = 'Bitte einen Spitznamen eingeben.'
  } else if (others.some((player) => comparePlayerNames(player.nickname, nickname) === 0)) {
    errors.nickname = 'Dieser Spitzname ist im Turnier bereits vergeben.'
  }
  if (!avatars.some((avatar) => avatar.emoji === draft.avatar)) {
    errors.avatar = 'Bitte einen Emoji-Avatar aus der Palette auswählen.'
  } else if (others.some((player) => player.avatar === draft.avatar)) {
    errors.avatar = 'Dieser Avatar ist im Turnier bereits vergeben.'
  }
  return Object.keys(errors).length ? { errors } : { player: { nickname, avatar: draft.avatar } }
}

function isPlayer(value: unknown): value is Player {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.keys(value).every((key) => ['id', 'nickname', 'avatar'].includes(key)) &&
    'id' in value && typeof value.id === 'string' && Boolean(value.id.trim()) &&
    'nickname' in value && typeof value.nickname === 'string' && value.nickname === value.nickname.trim() &&
    'avatar' in value && typeof value.avatar === 'string'
}

export function isPlayerList(value: unknown): value is Player[] {
  if (!Array.isArray(value) || value.length > avatars.length) return false
  const checked: Player[] = []
  for (const player of value) {
    if (!isPlayer(player) || checked.some((other) => other.id === player.id) ||
        validatePlayerDraft(player, checked).errors) return false
    checked.push(player)
  }
  return true
}
