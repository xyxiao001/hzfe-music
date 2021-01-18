import React, { useEffect, useRef, useState } from "react"
import { InterfaceLrc, InterfaceMusicInfo } from "../../Interface/music"
import { formatLrc, getChooseLrcIndex } from "../../utils"
import './index.scss'
const Lrc = (props: {
  lrc: string,
  currentInfo: InterfaceMusicInfo | null,
  currentTime: number
}) => {
  // 保存当前渲染的歌词列表
  const [lrcList, setLrcList] = useState<InterfaceLrc[]>([])

  // 需要渲染的歌词
  const [lrcIndex, setLrcIndex] = useState(-1)

  // 歌词滚动容器
  const lrcScroll = useRef(null);

  // 当前是否可以进行歌词的自动滚动
  const [canScroll, setCanScroll] = useState(true)

   
  useEffect(() => {
    setLrcList(formatLrc(props.lrc))
  }, [props.lrc])

  useEffect(() => {
    setLrcIndex(
      getChooseLrcIndex(lrcList, props.currentTime)
    )
  }, [lrcList, props.currentTime])

  useEffect(() => {
    if (lrcScroll && canScroll) {
      // 计算当前歌词应该需要滚动的场景
      const target: any = lrcScroll.current
      const top = 41 * (lrcIndex - 2) || 0
      if (target) {
        target.scrollTo({
          top,
          behavior: 'smooth'
        })
      }
    }
  }, [canScroll, lrcIndex])

  const getLrcChooseName = (index: number) => {
    return lrcIndex === index ? 'choose-lrc' : ''
  }

  return (
    <section className="music-lrc"
      ref={lrcScroll}
      onMouseEnter={() => {
        setCanScroll(false)
      }}
      onMouseLeave={() => {
        setCanScroll(true)
        const target: any = lrcScroll.current
        const top = 41 * (lrcIndex - 2) || 0
        if (target) {
          target.scrollTo({
            top,
            behavior: 'auto'
          })
        }
      }}>
      {/* 渲染歌词列表 */}
      <section className="lrc-list">
        {
          lrcList.map((lrcItem: InterfaceLrc, index) => (
            <p key={ lrcItem.time } className={getLrcChooseName(index)}>{ lrcItem.text}</p>
          ))
        }
      </section>
    </section>
  )
}

export default Lrc