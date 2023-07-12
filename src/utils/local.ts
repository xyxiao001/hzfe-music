/**
 * 所有对数据操作的集合，包括存储数据， 查询数据
 * 
 * 1. 歌曲的储存方式
 *   MusicList  InterfaceMusicInfo  
 *   id -> 名称生成的hash 值
 *   lrc ->   歌词，在列表进行操作关联
 *   music -> 歌曲的 blob，播放时进行查询关联
 *    
 * 
 *   music-名称生成的hash 值, 随机储存, 播放通过歌曲信息的 hash 值获取具体文件流
 * 
 *   LrcList  InterfaceLrcInfo  id -> 名称生成的hash 值, 文件本身存在列表里面
 * 
 */

import localforage from 'localforage'
import { dataURLtoBlob } from '.'
import { InterfaceLrcInfo, InterfaceMusicInfo } from '../Interface/music'
import { EnumPlayingType } from './enmus'

 /**
  * 添加歌词的存储方法
  * key: music-lrc-list
  */
 export const addLrc = async (lrc: InterfaceLrcInfo):Promise<any> => {
    const key = 'music-lrc-list'
    // 歌词，直接拉出列表，然后塞进去，储存
    const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
    // 这里需要判断下是否已经存在
    let noExist = list.every(item => item.fileName !== lrc.fileName)
    if (noExist) {
      list.push(lrc)
    }
    return localforage.setItem('music-lrc-list', list)
}

// 获取歌词列表
export const getLrcList = async ():Promise<InterfaceLrcInfo[]>  => {
  const key = 'music-lrc-list'
  const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
  return list
}

/**
 * 添加歌曲列表方法
 * music-list
 * 具体流地址 music-名称生成的hash 值
 */

export const addMusic = async (musicInfo: InterfaceMusicInfo, blob: Blob):Promise<any> => {
  const key = 'music-list'
  // 歌曲，直接拉出列表，然后塞进去，储存
  const list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
  // 这里需要判断下是否已经存在
  let noExist = list.every(item => item.fileName !== musicInfo.fileName)
  if (noExist) {
    // 这里需要去存储文件流
    const musicHash = `${musicInfo.fileName}-${Math.random() * 100}-${Date.now()}`
    musicInfo.id = musicHash
    await localforage.setItem(musicHash, blob)
    list.push(musicInfo)
  }
  return localforage.setItem('music-list', list)
}

// 通过 id 删除歌曲
export const removeMusic = async (id: string):Promise<Boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = 'music-list'
      // 拉出歌曲列表
      let list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
      list = list.filter(item => item.id !== id)
      await localforage.setItem('music-list', list)
      await localforage.removeItem(id)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

// 获取歌曲列表
export const getMusicList = async ():Promise<InterfaceMusicInfo[]>  => {
  const key = 'music-list'
  const list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
  return list
}

// 获取单首歌词信息
export const getMusicInfoFromLocal = async (id: string): Promise<InterfaceMusicInfo> => {
  return new Promise(async (resolve, reject) => {
    const list = await localforage.getItem('music-list') as InterfaceMusicInfo[] || []
    const cur = list.filter((item: InterfaceMusicInfo) => item.id === id)[0]
    if (!cur) {
      reject('获取歌曲信息失败')
    } else {
      cur.music = await localforage.getItem(id)  as Blob
      if (cur.lrcKey) {
         const lrcList = await getLrcList()
         lrcList.forEach(item => {
           if (item.fileName === cur.lrcKey) {
            cur.lrc = item.content
           }
         })
      }
      // 这里处理下图片 url 的生成
      if (cur.picture.length > 0) {
        cur.pictureUrl = URL.createObjectURL(dataURLtoBlob(cur.picture[0]))
      }
      resolve(cur)
    }
  })
} 

// 通过 id 删除歌词
export const removeLrc = async (id: string):Promise<Boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = 'music-lrc-list'
      // 拉出歌词列表
      let list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
      list = list.filter(item => item.fileName !== id)
      await localforage.setItem('music-lrc-list', list)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

// 自动关联歌曲歌词
export const MusicRelatedLrc = (): Promise<string> => {
  return new Promise(async(resolve, reject) => {
    try {
      let musicList = await getMusicList()
      const lrcList = await getLrcList()
      musicList = musicList.map((item: InterfaceMusicInfo) => {
        lrcList.forEach((lrc: InterfaceLrcInfo) => {
          if (lrc.fileName.includes(item.name)) {
            item.lrcKey = lrc.fileName
          }
        })
        return item
      })
      // console.log(musicList)
      await localforage.setItem('music-list', musicList)
      resolve('success')
    } catch (error) {
      reject(error)
    }
  })
}

// 获取上次播放类型
export const getLastPlayType = async (): Promise<`${EnumPlayingType}`> => {
  const key = 'last-play-type'
  const type = await localforage.getItem(key) as `${EnumPlayingType}` ?? EnumPlayingType.random
  return type
}

// 设置上次播放类型
export const setLastPlayType = async (type: `${EnumPlayingType}`): Promise<`${EnumPlayingType}`> => {
  const key = 'last-play-type'
  await localforage.setItem(key, type)
  return type
}