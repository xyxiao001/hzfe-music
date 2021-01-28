import React, { useEffect, useRef, useState } from "react"
import { InterfaceLrc, InterfaceMusicInfo } from "../../Interface/music"
import { formatLrc, getChooseLrcIndex } from "../../utils"
import './index.scss'
const Lrc = (props: {
  lrc: string,
  currentInfo: InterfaceMusicInfo | null,
  currentTime: number,
  isPlaying: boolean,
  setCurrentLrc: Function,
  color?: string
}) => {
  // 保存当前渲染的歌词列表
  const [lrcList, setLrcList] = useState<InterfaceLrc[]>([])

  // 需要渲染的歌词
  const [lrcIndex, setLrcIndex] = useState(-1)

  // 歌词滚动容器
  const lrcScroll = useRef(null);

  // 当前是否可以进行歌词的自动滚动
  const [canScroll, setCanScroll] = useState(true)

  // 当前每行滚动的高度
  const [lineHeight, setLineHeight] = useState(0)

  const topLine = 1
   
  useEffect(() => {
    setLrcList(formatLrc(props.lrc))
  }, [props.lrc])

  useEffect(() => {
    setLrcIndex(
      getChooseLrcIndex(lrcList, props.currentTime)
    )
    if (lrcList.length && lrcList[lrcIndex]) {
      props.setCurrentLrc(lrcList[lrcIndex].text)
    }
  }, [lrcIndex, lrcList, props, props.currentTime])

  useEffect(() => {
    if (lrcScroll && canScroll && props.isPlaying) {
      // 计算当前歌词应该需要滚动的场景
      const target: any = lrcScroll.current
      const top = lineHeight * (lrcIndex - topLine) || 0
      if (target) {
        target.scrollTo({
          top,
          behavior: 'smooth'
        })
        // goScroll(top, target)
      }
    }
  }, [canScroll, lineHeight, lrcIndex, props.isPlaying])

  const getLrcChooseName = (index: number) => {
    // 这里处理下其他的, 最近 10 条显示
    if(lrcIndex === index) {
      return 'choose-lrc'
    }
    // // 下面 10 条
    // if (lrcIndex < index && (index - lrcIndex) < 10) {
    //   return `choose-next-${index - lrcIndex}`

    // }
    // // 上面 5 条
    // if (lrcIndex > index && (lrcIndex - index) < 5) {
    //   return `choose-pre-${lrcIndex - index}`
    // }
    return ''
  }
  
  const resize = () => {
    // 浏览器高除以 高度 + 
    setLineHeight(document.body.offsetHeight * (5 + 2.5) / 100)
  }

  useEffect(() => {
    window.addEventListener('resize', resize)
    resize()
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="music-lrc"
      ref={lrcScroll}
      onMouseEnter={() => {
        setCanScroll(false)
      }}
      onMouseLeave={() => {
        if (!props.isPlaying) {
          setCanScroll(true)
          return
        }
        const target: any = lrcScroll.current
        const top = lineHeight * (lrcIndex - topLine) || 0
        if (target) {
          target.scrollTo({
            top,
            behavior: 'auto'
          })
        }
        setCanScroll(true)
      }}>
      {/* 渲染歌词列表 */}
      <section className="lrc-list">
        {
          lrcList.map((lrcItem: InterfaceLrc, index) => (
            <p 
              key={ `${lrcItem.time}${lrcIndex}${lrcItem.text}`}
              style={{
                color: lrcIndex === index ? props.color : ''
              }}
              className={getLrcChooseName(index)}
            >
              { lrcItem.text}
            </p>
          ))
        }
      </section>
    </section>
  )
}

export default Lrc