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
  { emoji: '🧑‍🚀', label: 'Raumfahrtperson' }, { emoji: '🐶', label: 'Hund' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '⚽', label: 'Fußball' },
  { emoji: '👩🏽‍💻', label: 'Technikerin' }, { emoji: '🐱', label: 'Katze' }, { emoji: '🍓', label: 'Erdbeere' }, { emoji: '🎸', label: 'Gitarre' },
  { emoji: '👨‍🍳', label: 'Koch' }, { emoji: '🐭', label: 'Maus' }, { emoji: '🍿', label: 'Popcorn' }, { emoji: '🚲', label: 'Fahrrad' },
  { emoji: '👩‍🔬', label: 'Wissenschaftlerin' }, { emoji: '🐹', label: 'Hamster' }, { emoji: '🍩', label: 'Donut' }, { emoji: '🎨', label: 'Farbpalette' },
  { emoji: '🥷', label: 'Ninja' }, { emoji: '🐰', label: 'Hase' }, { emoji: '🌮', label: 'Taco' }, { emoji: '🏀', label: 'Basketball' },
  { emoji: '👨‍🎨', label: 'Maler' }, { emoji: '🦊', label: 'Fuchs' }, { emoji: '🍉', label: 'Wassermelone' }, { emoji: '📷', label: 'Kamera' },
  { emoji: '👩‍🚒', label: 'Feuerwehrfrau' }, { emoji: '🐼', label: 'Panda' }, { emoji: '🥨', label: 'Brezel' }, { emoji: '🚀', label: 'Rakete' },
  { emoji: '👨‍🌾', label: 'Landwirt' }, { emoji: '🐸', label: 'Frosch' }, { emoji: '☕', label: 'Kaffee' }, { emoji: '🎲', label: 'Spielwürfel' },
  { emoji: '🧑‍🎤', label: 'Gesangsstar' }, { emoji: '🐧', label: 'Pinguin' }, { emoji: '🥑', label: 'Avocado' }, { emoji: '🏓', label: 'Tischtennis' },
  { emoji: '👩‍✈️', label: 'Pilotin' }, { emoji: '🦉', label: 'Eule' }, { emoji: '🍦', label: 'Softeis' }, { emoji: '🌈', label: 'Regenbogen' },
  { emoji: '🕵️', label: 'Detektiv' }, { emoji: '🦄', label: 'Einhorn' }, { emoji: '🍣', label: 'Sushi' }, { emoji: '🎧', label: 'Kopfhörer' },
  { emoji: '🦸', label: 'Superheld' }, { emoji: '🦋', label: 'Schmetterling' }, { emoji: '🍋', label: 'Zitrone' }, { emoji: '🛹', label: 'Skateboard' },
  { emoji: '🧙', label: 'Magier' }, { emoji: '🐢', label: 'Schildkröte' }, { emoji: '🥐', label: 'Croissant' }, { emoji: '🌻', label: 'Sonnenblume' },
  { emoji: '🤖', label: 'Roboter' }, { emoji: '🐙', label: 'Oktopus' }, { emoji: '🧋', label: 'Bubble Tea' }, { emoji: '🧩', label: 'Puzzleteil' },
  { emoji: '😎', label: 'Sonnenbrillen-Smiley' }, { emoji: '🦦', label: 'Otter' }, { emoji: '🍔', label: 'Burger' }, { emoji: '🪁', label: 'Flugdrachen' },
  { emoji: '👻', label: 'Geist' }, { emoji: '🦒', label: 'Giraffe' }, { emoji: '🥝', label: 'Kiwi' }, { emoji: '🧭', label: 'Kompass' },
] as const

// Retired options remain valid in stored tournaments, but cannot be newly assigned.
const retiredAvatars = [
  { emoji: '🐻', label: 'Bär' }, { emoji: '🐨', label: 'Koala' },
  { emoji: '🐯', label: 'Tiger' }, { emoji: '🦁', label: 'Löwe' },
  { emoji: '🐮', label: 'Kuh' }, { emoji: '🐷', label: 'Schwein' },
  { emoji: '🐵', label: 'Affe' }, { emoji: '🐔', label: 'Huhn' },
  { emoji: '🐦', label: 'Vogel' }, { emoji: '🦆', label: 'Ente' },
  { emoji: '🦇', label: 'Fledermaus' }, { emoji: '🐺', label: 'Wolf' },
  { emoji: '🐴', label: 'Pferd' }, { emoji: '🐝', label: 'Biene' },
  { emoji: '🐞', label: 'Marienkäfer' },
  { emoji: '🐍', label: 'Schlange' }, { emoji: '🦎', label: 'Eidechse' },
  { emoji: '🦖', label: 'Tyrannosaurus' },
  { emoji: '🦑', label: 'Kalmar' }, { emoji: '🦀', label: 'Krabbe' },
  { emoji: '🐠', label: 'Tropenfisch' }, { emoji: '🐬', label: 'Delfin' },
  { emoji: '🐳', label: 'Wal' }, { emoji: '🦈', label: 'Hai' },
  { emoji: '🐊', label: 'Krokodil' }, { emoji: '🐘', label: 'Elefant' },
  { emoji: '🦏', label: 'Nashorn' },
  { emoji: '🦓', label: 'Zebra' }, { emoji: '🦍', label: 'Gorilla' },
  { emoji: '🐪', label: 'Kamel' }, { emoji: '🦙', label: 'Lama' },
  { emoji: '🦘', label: 'Känguru' }, { emoji: '🦥', label: 'Faultier' },
  { emoji: '🦔', label: 'Igel' },
  { emoji: '🐿️', label: 'Eichhörnchen' }, { emoji: '🦜', label: 'Papagei' },
  { emoji: '🦚', label: 'Pfau' }, { emoji: '🦩', label: 'Flamingo' },
  { emoji: '🦢', label: 'Schwan' }, { emoji: '🦭', label: 'Robbe' },
  { emoji: '🦫', label: 'Biber' }, { emoji: '🦬', label: 'Bison' },
  { emoji: '🦌', label: 'Hirsch' }, { emoji: '🐏', label: 'Widder' },
  { emoji: '🐐', label: 'Ziege' }, { emoji: '🐓', label: 'Hahn' },
  { emoji: '🦃', label: 'Truthahn' },
] as const

export function retiredAvatar(emoji: string) {
  return retiredAvatars.find((option) => option.emoji === emoji)
}

const nameCollator = new Intl.Collator('de', { sensitivity: 'accent' })

export function comparePlayerNames(first: string, second: string): number {
  return nameCollator.compare(first, second)
}

export function validatePlayerDraft(
  draft: PlayerDraft,
  players: readonly Player[],
  editingId?: string,
): { player: PlayerDraft; errors?: never } | { errors: PlayerErrors; player?: never } {
  const allowedAvatar = avatars.some((option) => option.emoji === draft.avatar) ||
    (Boolean(retiredAvatar(draft.avatar)) && players.some((player) => player.id === editingId && player.avatar === draft.avatar))
  return validatePlayer(draft, players.filter((player) => player.id !== editingId), allowedAvatar)
}

function validatePlayer(
  draft: PlayerDraft,
  others: readonly Player[],
  allowedAvatar: boolean,
): { player: PlayerDraft; errors?: never } | { errors: PlayerErrors; player?: never } {
  const errors: PlayerErrors = {}
  const nickname = draft.nickname.trim()
  if (!nickname) {
    errors.nickname = 'Bitte einen Spitznamen eingeben.'
  } else if (others.some((player) => comparePlayerNames(player.nickname, nickname) === 0)) {
    errors.nickname = 'Dieser Spitzname ist im Turnier bereits vergeben.'
  }
  if (!allowedAvatar) {
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
        validatePlayer(player, checked, avatars.some((option) => option.emoji === player.avatar) ||
          Boolean(retiredAvatar(player.avatar))).errors) return false
    checked.push(player)
  }
  return true
}
