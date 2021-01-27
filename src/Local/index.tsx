import React, { useState } from "react"
import Upload from "../Components/Upload"
import { Tabs } from 'antd';
import LrcList from "../Components/LrcList";
import { useHistory, useLocation } from "react-router-dom";
import { useEffect } from "react";

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
      </section>
      <section className="local-content">
        <Tabs activeKey={key} onChange={tabCallback}>
          <TabPane tab="音乐列表" key="music">
            Content of Tab Pane 1
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