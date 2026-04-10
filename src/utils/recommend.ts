import type { InterfaceMusicInfo } from '../Interface/music'
import { formatDateKey, getGlobalStats, getMusicStatsIndex, getMusicStatsMap, type MusicStats } from './stats'

export type RecommendedAlbum = {
  albumName: string
  songs: InterfaceMusicInfo[]
  cover: string
  artist: string
  score: number
}

export type TodayRecommendations = {
  dateKey: string
  songs: InterfaceMusicInfo[]
  albums: RecommendedAlbum[]
}

const fallbackCover = '/images/music-no.jpeg'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

const hashString = (value: string) => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const seededRand01 = (seed: number) => {
  // xorshift32
  let x = seed || 1
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return ((x >>> 0) % 10000) / 10000
}

const normMinMax = (values: number[]) => {
  const finite = values.filter(v => Number.isFinite(v))
  const min = finite.length ? Math.min(...finite) : 0
  const max = finite.length ? Math.max(...finite) : 0
  const range = max - min
  return (v: number) => {
    if (!Number.isFinite(v)) return 0
    if (range <= 0) return 0
    return clamp01((v - min) / range)
  }
}

const getCover = (music?: InterfaceMusicInfo | null) => {
  return music?.picture?.[0] || music?.pictureUrl || fallbackCover
}

const computeAffinityRaw = (stats?: MusicStats | null) => {
  const playCount = Number(stats?.playCount || 0)
  const totalMin = Number(stats?.totalPlayMs || 0) / 60000
  return Math.log1p(playCount) * 0.6 + Math.log1p(totalMin) * 0.4
}

export const getTodayRecommendations = async (params: {
  songs: InterfaceMusicInfo[]
  albumMap: Map<string, InterfaceMusicInfo[]>
  dateKey?: string
  takeSongs?: number
  takeAlbums?: number
}): Promise<TodayRecommendations> => {
  const dateKey = params.dateKey || formatDateKey(Date.now())
  const takeSongs = params.takeSongs ?? 20
  const takeAlbums = params.takeAlbums ?? 10

  const allSongs = params.songs.filter(item => Boolean(item?.id))
  const ids = allSongs.map(item => item.id || '').filter(Boolean)

  const [global, statsIndex] = await Promise.all([
    getGlobalStats(),
    getMusicStatsIndex()
  ])

  const hasEnoughPlays = Number(global.playCount || 0) >= 20
  const trackedIds = statsIndex.filter(id => ids.includes(id))
  const statsMap = await getMusicStatsMap(trackedIds)

  // Cold-start: mostly unplayed + some newly imported (list tail as proxy).
  if (!hasEnoughPlays) {
    const byNew = [...allSongs].reverse()
    const unplayed = allSongs.filter(song => {
      const st = statsMap.get(song.id || '')
      return !st || (st.playCount || 0) === 0
    })
    const seed = hashString(`${dateKey}-cold-start`)
    const shuffle = <T>(arr: T[]) => {
      const next = [...arr]
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(seededRand01(seed + i * 997) * (i + 1))
        const tmp = next[i]
        next[i] = next[j]
        next[j] = tmp
      }
      return next
    }
    const picked: InterfaceMusicInfo[] = []
    shuffle(unplayed).some(song => {
      if (picked.length >= Math.floor(takeSongs * 0.7)) return true
      picked.push(song)
      return false
    })
    byNew.some(song => {
      if (picked.length >= takeSongs) return true
      if (picked.some(s => s.id === song.id)) return false
      picked.push(song)
      return false
    })

    const albums = Array.from(params.albumMap.entries())
      .map(([albumName, songs]) => {
        const head = songs[0] || null
        return {
          albumName,
          songs,
          cover: getCover(head),
          artist: head?.artist || '未知歌手',
          score: seededRand01(hashString(`${dateKey}:${albumName}`))
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, takeAlbums)

    return { dateKey, songs: picked.slice(0, takeSongs), albums }
  }

  // Build top artists from affinity.
  const artistAffinity = new Map<string, number>()
  allSongs.forEach(song => {
    const id = song.id || ''
    if (!id) return
    const st = statsMap.get(id) || null
    const a = computeAffinityRaw(st)
    if (!a) return
    const artist = song.artist || '未知歌手'
    artistAffinity.set(artist, (artistAffinity.get(artist) || 0) + a)
  })
  const topArtists = Array.from(artistAffinity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(item => item[0])

  const now = Date.now()
  const thirtyDaysMs = 30 * 24 * 3600 * 1000

  // Raw feature extraction
  const affinityRaw: number[] = []
  const recencyRaw: number[] = []
  const exploreRaw: number[] = []
  const finishRaw: number[] = []
  const skipRaw: number[] = []

  const features = allSongs.map(song => {
    const id = song.id || ''
    const st = statsMap.get(id) || null
    const affinity = computeAffinityRaw(st)

    const lastPlayedAt = Number(st?.lastPlayedAt || 0)
    const daysSince = lastPlayedAt > 0 ? (now - lastPlayedAt) / (24 * 3600 * 1000) : 999
    const recencyBoost = 1 - Math.exp(-daysSince / 7)

    const playCount = Number(st?.playCount || 0)
    const skipCount = Number(st?.skipCount || 0)
    const skipPenalty = clamp01(skipCount / Math.max(1, playCount))

    const lastFinishedAt = Number(st?.lastFinishedAt || 0)
    const finishedRecently = lastFinishedAt > 0 && (now - lastFinishedAt) <= thirtyDaysMs ? 1 : 0

    const exploreBoost = playCount <= 1 && topArtists.includes(song.artist || '未知歌手') ? 1 : 0

    affinityRaw.push(affinity)
    recencyRaw.push(recencyBoost)
    exploreRaw.push(exploreBoost)
    finishRaw.push(finishedRecently)
    skipRaw.push(skipPenalty)

    return {
      song,
      id,
      affinity,
      recencyBoost,
      exploreBoost,
      finishBoost: finishedRecently,
      skipPenalty
    }
  })

  const nAffinity = normMinMax(affinityRaw)
  const nRecency = normMinMax(recencyRaw)
  const nExplore = normMinMax(exploreRaw)
  const nFinish = normMinMax(finishRaw)
  const nSkip = normMinMax(skipRaw)

  // Score songs
  const scored = features.map(item => {
    const seed = hashString(`${dateKey}:${item.id}`)
    const eps = (seededRand01(seed) - 0.5) * 0.06 // +/- 0.03
    const score =
      0.55 * nAffinity(item.affinity) +
      0.20 * nRecency(item.recencyBoost) +
      0.15 * nExplore(item.exploreBoost) +
      0.10 * nFinish(item.finishBoost) -
      0.35 * nSkip(item.skipPenalty) +
      eps
    return { song: item.song, id: item.id, score }
  }).sort((a, b) => b.score - a.score)

  // Diversity re-rank (artist <= 3, album <= 4)
  const artistCount = new Map<string, number>()
  const albumCount = new Map<string, number>()
  const pickedSongs: InterfaceMusicInfo[] = []
  const overflow: InterfaceMusicInfo[] = []

  const pushWithConstraint = (song: InterfaceMusicInfo) => {
    const artist = song.artist || '未知歌手'
    const album = song.album || '未命名专辑'
    const aCount = artistCount.get(artist) || 0
    const alCount = albumCount.get(album) || 0
    if (aCount >= 3 || alCount >= 4) {
      overflow.push(song)
      return
    }
    pickedSongs.push(song)
    artistCount.set(artist, aCount + 1)
    albumCount.set(album, alCount + 1)
  }

  scored.slice(0, 60).forEach(item => {
    if (pickedSongs.length >= takeSongs) return
    pushWithConstraint(item.song)
  })
  overflow.forEach(song => {
    if (pickedSongs.length >= takeSongs) return
    if (pickedSongs.some(s => s.id === song.id)) return
    pickedSongs.push(song)
  })

  // Album recommendation via aggregation
  const albumEntries = Array.from(params.albumMap.entries())
    .map(([albumName, songs]) => {
      const head = songs[0] || null
      const artist = head?.artist || '未知歌手'
      const cover = getCover(head)

      const songScores = songs
        .map(song => {
          const id = song.id || ''
          const hit = scored.find(s => s.id === id)
          return hit?.score ?? 0
        })
        .sort((a, b) => b - a)
      const top3Avg = songScores.length ? (songScores.slice(0, 3).reduce((sum, v) => sum + v, 0) / Math.min(3, songScores.length)) : 0

      const totalAlbumMs = songs.reduce((sum, song) => {
        const id = song.id || ''
        const st = id ? statsMap.get(id) : null
        return sum + Number(st?.totalPlayMs || 0)
      }, 0)

      const novelty = songs.length
        ? songs.filter(song => {
            const st = statsMap.get(song.id || '')
            const playCount = Number(st?.playCount || 0)
            return playCount <= 1 && topArtists.includes(song.artist || '未知歌手')
          }).length / songs.length
        : 0

      return { albumName, songs, cover, artist, top3Avg, totalAlbumMs, novelty }
    })

  const nTop3 = normMinMax(albumEntries.map(a => a.top3Avg))
  const nAlbumMs = normMinMax(albumEntries.map(a => a.totalAlbumMs))
  const nNovelty = normMinMax(albumEntries.map(a => a.novelty))

  const scoredAlbums = albumEntries.map(a => {
    const seed = hashString(`${dateKey}:album:${a.albumName}`)
    const eps = (seededRand01(seed) - 0.5) * 0.04
    const score =
      0.55 * nTop3(a.top3Avg) +
      0.35 * nAlbumMs(a.totalAlbumMs) +
      0.10 * nNovelty(a.novelty) +
      eps
    return {
      albumName: a.albumName,
      songs: a.songs,
      cover: a.cover,
      artist: a.artist,
      score
    }
  }).sort((a, b) => b.score - a.score)

  const albumArtistCount = new Map<string, number>()
  const pickedAlbums: RecommendedAlbum[] = []
  const overflowAlbums: RecommendedAlbum[] = []

  const pushAlbum = (album: RecommendedAlbum) => {
    const artist = album.artist || '未知歌手'
    const count = albumArtistCount.get(artist) || 0
    if (count >= 2) {
      overflowAlbums.push(album)
      return
    }
    pickedAlbums.push(album)
    albumArtistCount.set(artist, count + 1)
  }

  scoredAlbums.slice(0, 40).forEach(album => {
    if (pickedAlbums.length >= takeAlbums) return
    pushAlbum(album)
  })
  overflowAlbums.forEach(album => {
    if (pickedAlbums.length >= takeAlbums) return
    if (pickedAlbums.some(a => a.albumName === album.albumName)) return
    pickedAlbums.push(album)
  })

  return {
    dateKey,
    songs: pickedSongs.slice(0, takeSongs),
    albums: pickedAlbums.slice(0, takeAlbums)
  }
}

