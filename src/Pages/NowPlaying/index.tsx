import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import common from '../../store/common'

const NowPlayingPage = observer(() => {
  const navigate = useNavigate()
  const prevMinRef = useRef<boolean>(common.musicData.min)

  useEffect(() => {
    prevMinRef.current = common.musicData.min
    if (common.musicData.id) {
      common.updatedMusicData({ min: false })
    }
    return () => {
      // If user hasn't minimized manually, restore previous state when leaving route.
      if (common.musicData.id && common.musicData.min === false) {
        common.updatedMusicData({ min: prevMinRef.current })
      }
    }
  }, [])

  if (!common.musicData.id) {
    return (
      <section style={{ padding: 20 }}>
        <p style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>还没有正在播放的歌曲</p>
        <p style={{ marginTop: 10, color: 'rgba(31, 31, 41, 0.58)' }}>从“资料库/歌曲/专辑”选择一首歌开始播放。</p>
        <Button onClick={() => navigate('/library')}>返回资料库</Button>
      </section>
    )
  }

  // Player 组件本身是 fixed 全屏，这里不需要额外渲染内容。
  return <section />
})

export default NowPlayingPage

