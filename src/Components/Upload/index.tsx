import React from 'react';
import { loadFile, transformMusicInfo } from '../../utils';
import * as musicMetadata from 'music-metadata-browser'
import localforage from 'localforage'

const Upload = () => {

  const fileUpload = async (event: any) => {
    event.persist()
    let blob = null
    let result = null
    try {
      blob = await loadFile(event.target.files[0], true)
      result = await musicMetadata.parseBlob(blob)
      const transformData = transformMusicInfo(result)
      localforage.setItem('music', transformData)
      console.log(transformData, blob)
      localforage.setItem('musicData', blob)
    } catch (error) {
      result = await loadFile(event.target.files[0], false)
      // 把数据先本地
      localforage.setItem('musicLrc', result)
    }
  }

  return (
    <section className="page-Upload">
      <input type="file" onChange={(event: any) => fileUpload(event)} />
    </section>
  );
}

export default Upload
