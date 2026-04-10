import localforage from 'localforage'

export type MusicStats = {
  musicId: string
  playCount: number
  totalPlayMs: number
  lastPlayedAt: number
  lastFinishedAt?: number
  skipCount: number
}

export type DailyStats = {
  date: string // YYYY-MM-DD
  playCount: number
  playMs: number
  uniqueSongs: number
}

export type GlobalStats = {
  playCount: number
  playMs: number
  uniqueSongsEver: number
  lastUpdatedAt: number
}

const MUSIC_STATS_PREFIX = 'music-stats:'
const DAILY_STATS_PREFIX = 'stats-daily:'
const DAILY_SONG_SET_PREFIX = 'stats-daily-songs:'
const UNIQUE_SONG_SET_KEY = 'stats-unique-songs'
const GLOBAL_STATS_KEY = 'stats-global'
const MUSIC_STATS_INDEX_KEY = 'music-stats-index'

export const formatDateKey = (ts: number) => {
  const date = new Date(ts)
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const readJson = async <T>(key: string): Promise<T | null> => {
  const value = await localforage.getItem(key)
  return (value as T | null) ?? null
}

const writeJson = async <T>(key: string, value: T) => {
  await localforage.setItem(key, value)
}

export const getMusicStats = async (musicId: string): Promise<MusicStats | null> => {
  if (!musicId) return null
  return readJson<MusicStats>(`${MUSIC_STATS_PREFIX}${musicId}`)
}

export const upsertMusicStats = async (musicId: string, patch: Partial<MusicStats>) => {
  if (!musicId) return
  const key = `${MUSIC_STATS_PREFIX}${musicId}`
  const current = (await readJson<MusicStats>(key)) || {
    musicId,
    playCount: 0,
    totalPlayMs: 0,
    lastPlayedAt: 0,
    skipCount: 0
  }
  const next: MusicStats = {
    ...current,
    ...patch,
    musicId
  }
  await writeJson(key, next)
}

export const getDailyStats = async (dateKey: string): Promise<DailyStats> => {
  const key = `${DAILY_STATS_PREFIX}${dateKey}`
  const current = await readJson<DailyStats>(key)
  return current || { date: dateKey, playCount: 0, playMs: 0, uniqueSongs: 0 }
}

const setDailyStats = async (dateKey: string, next: DailyStats) => {
  await writeJson(`${DAILY_STATS_PREFIX}${dateKey}`, next)
}

export const getGlobalStats = async (): Promise<GlobalStats> => {
  const current = await readJson<GlobalStats>(GLOBAL_STATS_KEY)
  return current || { playCount: 0, playMs: 0, uniqueSongsEver: 0, lastUpdatedAt: 0 }
}

const setGlobalStats = async (next: GlobalStats) => {
  await writeJson(GLOBAL_STATS_KEY, next)
}

const ensureIndexContains = async (musicId: string) => {
  const list = (await readJson<string[]>(MUSIC_STATS_INDEX_KEY)) || []
  if (list.includes(musicId)) return
  list.push(musicId)
  await writeJson(MUSIC_STATS_INDEX_KEY, list)
}

export const addPlayTime = async (musicId: string, deltaMs: number, ts: number) => {
  if (!musicId) return
  const ms = Math.max(0, Math.floor(deltaMs))
  if (!ms) return

  const dateKey = formatDateKey(ts)
  const [daily, global, currentMusic] = await Promise.all([
    getDailyStats(dateKey),
    getGlobalStats(),
    getMusicStats(musicId)
  ])

  await Promise.all([
    setDailyStats(dateKey, {
      ...daily,
      playMs: daily.playMs + ms
    }),
    setGlobalStats({
      ...global,
      playMs: global.playMs + ms,
      lastUpdatedAt: ts
    }),
    upsertMusicStats(musicId, {
      totalPlayMs: (currentMusic?.totalPlayMs || 0) + ms
    })
  ])
}

export const incrementPlayCount = async (musicId: string, ts: number) => {
  if (!musicId) return
  const dateKey = formatDateKey(ts)

  const [daily, global, currentMusic] = await Promise.all([
    getDailyStats(dateKey),
    getGlobalStats(),
    getMusicStats(musicId)
  ])

  // Update unique song sets only when a valid play is counted.
  const daySetKey = `${DAILY_SONG_SET_PREFIX}${dateKey}`
  const [daySongIds, allSongIds] = await Promise.all([
    readJson<string[]>(daySetKey).then(v => v || []),
    readJson<string[]>(UNIQUE_SONG_SET_KEY).then(v => v || [])
  ])

  const nextDaySongIds = daySongIds.includes(musicId) ? daySongIds : [...daySongIds, musicId]
  const nextAllSongIds = allSongIds.includes(musicId) ? allSongIds : [...allSongIds, musicId]

  await Promise.all([
    setDailyStats(dateKey, {
      ...daily,
      playCount: daily.playCount + 1,
      uniqueSongs: nextDaySongIds.length
    }),
    setGlobalStats({
      ...global,
      playCount: global.playCount + 1,
      uniqueSongsEver: nextAllSongIds.length,
      lastUpdatedAt: ts
    }),
    writeJson(daySetKey, nextDaySongIds),
    writeJson(UNIQUE_SONG_SET_KEY, nextAllSongIds),
    upsertMusicStats(musicId, {
      playCount: (currentMusic?.playCount || 0) + 1,
      lastPlayedAt: ts
    }),
    ensureIndexContains(musicId)
  ])
}

export const incrementSkipCount = async (musicId: string) => {
  if (!musicId) return
  const currentMusic = await getMusicStats(musicId)
  await upsertMusicStats(musicId, {
    skipCount: (currentMusic?.skipCount || 0) + 1
  })
}

export const markFinished = async (musicId: string, ts: number) => {
  if (!musicId) return
  await upsertMusicStats(musicId, { lastFinishedAt: ts })
}

export const getTopMusicStats = async (limit = 10, sortBy: 'playMs' | 'playCount' = 'playMs') => {
  const index = (await readJson<string[]>(MUSIC_STATS_INDEX_KEY)) || []
  const ids = index.filter(Boolean)
  if (!ids.length) return []
  const statsList = await Promise.all(ids.map(id => getMusicStats(id)))
  const list = statsList.filter(Boolean) as MusicStats[]

  const sorted = list.sort((a, b) => {
    if (sortBy === 'playCount') return (b.playCount || 0) - (a.playCount || 0)
    return (b.totalPlayMs || 0) - (a.totalPlayMs || 0)
  })
  return sorted.slice(0, Math.max(0, limit))
}

export const getMusicStatsIndex = async (): Promise<string[]> => {
  const index = (await readJson<string[]>(MUSIC_STATS_INDEX_KEY)) || []
  return index.filter(Boolean)
}

export const getMusicStatsMap = async (musicIds: string[]): Promise<Map<string, MusicStats>> => {
  const map = new Map<string, MusicStats>()
  const ids = Array.from(new Set(musicIds.filter(Boolean)))
  if (!ids.length) return map
  const list = await Promise.all(ids.map(id => getMusicStats(id)))
  list.forEach(item => {
    if (item?.musicId) {
      map.set(item.musicId, item)
    }
  })
  return map
}
