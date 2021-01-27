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
import { InterfaceLrcInfo } from '../Interface/music'

  /**
  * 添加一首歌的存储方法
  */
 export const addMusic =  () => {
   console.log(localforage)
 }

 /**
  * 添加歌词的存储方法
  * key: music-lrc
  */
 export const addLrc = async (lrc: InterfaceLrcInfo):Promise<any> => {
    const key = 'music-lrc'
    // 歌词，直接拉出列表，然后塞进去，储存
    const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
    // 这里需要判断下是否已经存在
    let noExist = list.every(item => item.fileName !== lrc.fileName)
    if (noExist) {
      list.push(lrc)
    }
    return localforage.setItem('music-lrc', list)
}

// 获取歌词列表
export const getLrcList = async ():Promise<InterfaceLrcInfo[]>  => {
  const key = 'music-lrc'
  const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
  return list
}