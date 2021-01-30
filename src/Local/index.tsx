import React, { useState } from "react"
import Upload from "../Components/Upload"
import { Button, message, Tabs } from 'antd';
import LrcList from "../Components/LrcList";
import { useHistory, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MusicList from "../Components/MusicList";
import { MusicRelatedLrc } from "../utils/local";
import common from "../store/common";

const { TabPane } = Tabs;

const Locale = () => {

  const history = useHistory()

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery()

  const params = useLocation()

  const tabCallback = (key: string) => {
    history.push(`${params.pathname}?type=${key}`)
  }
  const [key, setKey] = useState('')

  const handleRelated = async () => {
    await MusicRelatedLrc()
    message.success('关联成功')
    common.updateLocalMusicList()
    common.updateLocalMusicLrcList()
  }

  useEffect(() => {
    const list = ['music', 'lrc']
    if (query) {
      const key = query.get('type') || ''
      if (list.includes(key)) {
        setKey(key)
      } else {
        setKey('music')
      }
    }
  }, [query])

  return (
    <section className="page-local">
      <section className="local-upload">
        <Upload></Upload>
        <section>
          <Button onClick={handleRelated}>自动关联歌词</Button>
          <p className="tips">关联规则: 当前歌曲没有歌词，同时可以找到歌词名，包含完整歌曲名</p>
        </section>
      </section>
      <section className="local-content">
        <Tabs activeKey={key} onChange={tabCallback}>
          <TabPane tab="音乐列表" key="music">
            <MusicList />
          </TabPane>
          <TabPane tab="歌词列表" key="lrc">
            <LrcList />
          </TabPane>
        </Tabs>
      </section>
    </section>
  )
}

export default Locale