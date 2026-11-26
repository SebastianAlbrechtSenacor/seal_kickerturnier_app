import { describe, expect, it } from 'vitest'
import { avatars, isPlayerList, validatePlayerDraft } from './players'

describe('Spielendendaten', () => {
  const alex = { id: 'alex', nickname: 'Alex', avatar: '🐶' }

  it('bereinigt nur aeussere Leerzeichen und erlaubt Wiederverwendung in anderen Turnieren', () => {
    expect(validatePlayerDraft({ nickname: '  Alex am  Kicker  ', avatar: '🐶' }, []))
      .toEqual({ player: { nickname: 'Alex am  Kicker', avatar: '🐶' } })
    expect(validatePlayerDraft(alex, [])).toEqual({ player: { nickname: 'Alex', avatar: '🐶' } })
    expect(validatePlayerDraft(alex, [alex], alex.id).errors).toBeUndefined()
  })

  it('vergleicht Namen deutsch ohne Gross-/Kleinschreibung und beachtet Unicode-Aequivalenz', () => {
    const players = [alex, { id: 'mueller', nickname: 'Müller', avatar: '🐱' }]
    expect(validatePlayerDraft({ nickname: ' alex ', avatar: '🐭' }, players).errors?.nickname).toContain('bereits vergeben')
    expect(validatePlayerDraft({ nickname: 'MU\u0308LLER', avatar: '🐭' }, players).errors?.nickname).toContain('bereits vergeben')
    expect(validatePlayerDraft({ nickname: 'Muller', avatar: '🐭' }, players).errors).toBeUndefined()
  })

  it('weist leere Namen, fehlende/fremde und belegte Avatare zurueck', () => {
    expect(validatePlayerDraft({ nickname: '  ', avatar: '' }, []).errors)
      .toMatchObject({ nickname: expect.any(String), avatar: expect.any(String) })
    expect(validatePlayerDraft({ nickname: 'Andere Person', avatar: '🐶' }, [alex]).errors?.avatar).toContain('bereits vergeben')
    expect(validatePlayerDraft({ nickname: 'Andere Person', avatar: 'kein Emoji' }, []).errors?.avatar).toContain('Palette')
  })

  it('erlaubt genau 64 eindeutige Avatare und gibt sie nach Entfernen wieder frei', () => {
    const full = avatars.map((avatar, index) => ({ id: `player-${index}`, nickname: `Person ${index}`, avatar: avatar.emoji }))
    expect(full).toHaveLength(64)
    expect(isPlayerList(full)).toBe(true)
    for (const avatar of avatars) {
      expect(validatePlayerDraft({ nickname: 'Weitere Person', avatar: avatar.emoji }, full).errors?.avatar).toContain('bereits vergeben')
    }
    expect(isPlayerList([...full, { id: 'overflow', nickname: 'Overflow', avatar: '🐶' }])).toBe(false)
    expect(validatePlayerDraft({ nickname: 'Neue Person', avatar: full[0].avatar }, full.slice(1)).errors).toBeUndefined()
  })

  it('akzeptiert alte Avatare im Bestand, aber nur den eigenen zum Beibehalten', () => {
    const legacy = { id: 'legacy', nickname: 'Biber', avatar: '🦫' }
    expect(isPlayerList([alex, legacy])).toBe(true)
    expect(isPlayerList([legacy, { ...alex, avatar: legacy.avatar }])).toBe(false)
    expect(validatePlayerDraft(legacy, [], legacy.id).errors?.avatar).toContain('Palette')
    expect(validatePlayerDraft({ ...alex, avatar: legacy.avatar }, [alex, legacy], alex.id).errors?.avatar).toContain('Palette')
    expect(validatePlayerDraft(legacy, [alex, legacy], legacy.id).errors).toBeUndefined()
  })

  it.each([
    null,
    {},
    [{ id: 'a', nickname: '  ', avatar: '🐶' }],
    [{ id: '', nickname: 'Alex', avatar: '🐶' }],
    [{ id: 'a', nickname: ' Alex ', avatar: '🐶' }],
    [{ id: 'a', nickname: 'Alex', avatar: '👾' }],
    [{ id: 'a', nickname: 'Alex', avatar: '🐶', unknown: true }],
    [alex, { id: 'alex', nickname: 'Andere Person', avatar: '🐱' }],
    [alex, { id: 'other', nickname: 'alex', avatar: '🐱' }],
    [alex, { id: 'other', nickname: 'Andere Person', avatar: '🐶' }],
  ].map((value) => ({ value })))('weist ungueltige gespeicherte Spielendenlisten ab: %j', ({ value }) => {
    expect(isPlayerList(value)).toBe(false)
  })
})
