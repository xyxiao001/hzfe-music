import React, { useEffect, useRef, useState } from "react"
import { InterfaceLrcWord, InterfaceMusicInfo } from "../../Interface/music"
import { formatLrcProgress, getChooseLrcWordIndex, getWordLineProgress} from "../../utils"
import './index-word.scss'
// 逐字渲染的歌词

const LrcWord = (props: {
  lrc: string,
  currentInfo: InterfaceMusicInfo | null,
  currentTime: number,
  isPlaying: boolean,
  setCurrentLrc: Function
}) => {
  // 保存当前渲染的歌词列表
  const [lrcList, setLrcList] = useState<InterfaceLrcWord[][]>([])

  // 需要渲染的歌词
  const [lrcIndex, setLrcIndex] = useState(-1)

  // 歌词滚动容器
  const lrcScroll = useRef(null);

  // 当前是否可以进行歌词的自动滚动
  const [canScroll, setCanScroll] = useState(true)

  // 当前进度
  const [bg, setBg] = useState({
    backgroundImage: ''
  })

  // 当前每行滚动的高度
  const [lineHeight, setLineHeight] = useState(0)

  const topLine = 4
   
  useEffect(() => {
    setLrcList(formatLrcProgress(props.lrc))
  }, [props.lrc])

  useEffect(() => {
    setLrcIndex(
      getChooseLrcWordIndex(lrcList, props.currentTime)
    )
    if (lrcList[lrcIndex] && lrcList[lrcIndex].length) {
      const text = lrcList[lrcIndex].map(item => {
        return item.text
      })
      props.setCurrentLrc(text.join(''))
    }
    const key = getWordLineProgress(lrcList[lrcIndex], props.currentTime)
    setBg(
      {
        backgroundImage: `-webkit-linear-gradient(left,rgb(49, 194, 124) ${key}%,#ffffff ${key}%)`
      }
    )
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
      }
    }
  }, [canScroll, lineHeight, lrcIndex, props.isPlaying])

  const getLrcChooseName = (index: number) => {
    return lrcIndex === index ? 'choose-lrc-line' : ''
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
    <section className="music-lrc-word"
      ref={lrcScroll}
      onMouseEnter={() => {
        setCanScroll(false)
      }}
      onMouseLeave={() => {
        setCanScroll(true)
        if (!props.isPlaying) return
        const target: any = lrcScroll.current
        const top = lineHeight * (lrcIndex - topLine) || 0
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
          lrcList.map((lrcItem: InterfaceLrcWord[], index) => (
            <section key={ index } className="lrc-line">
              <p className={getLrcChooseName(index)} style={lrcIndex === index ? bg : {}}>
                {
                  lrcItem.map((word: InterfaceLrcWord, i) => (
                    <span key={ i }>{word.text}</span>
                  ))
                }
              </p>
            </section>
          ))
        }
      </section>
    </section>
  )
}

export default LrcWord