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
  setCurrentLrc: Function,
  color?: string,
  onSeekTo?: (time: number) => void
}) => {
  // 保存当前渲染的歌词列表
  const [lrcList, setLrcList] = useState<InterfaceLrcWord[][]>([])

  // 需要渲染的歌词
  const [lrcIndex, setLrcIndex] = useState(-1)

  // 歌词滚动容器
  const lrcScroll = useRef<HTMLElement | null>(null);

  // 当前是否可以进行歌词的自动滚动
  const [canScroll, setCanScroll] = useState(true)
  const [showBackButton, setShowBackButton] = useState(false)
  const [seekFeedbackTime, setSeekFeedbackTime] = useState<number | null>(null)
  const scrollTimerRef = useRef<number | null>(null)
  const autoScrollingRef = useRef(false)
  const seekFeedbackTimerRef = useRef<number | null>(null)

  // 当前进度
  const [bg, setBg] = useState({
    backgroundImage: ''
  })

  const getCurrentScrollTop = () => {
    const target = lrcScroll.current
    if (!target || lrcIndex < 0) return 0
    const currentLine = target.querySelectorAll('.lrc-list p')[lrcIndex] as HTMLElement | undefined
    if (!currentLine) return 0
    const topOffset = Math.max(56, target.clientHeight * 0.18)
    return Math.max(0, currentLine.offsetTop - topOffset)
  }

  const scrollToCurrentLine = (behavior: ScrollBehavior = 'smooth') => {
    const target = lrcScroll.current
    if (!target) return
    autoScrollingRef.current = true
    target.scrollTo({
      top: getCurrentScrollTop(),
      behavior
    })
    window.setTimeout(() => {
      autoScrollingRef.current = false
    }, behavior === 'smooth' ? 420 : 120)
  }

  const clearRestoreTimer = () => {
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = null
    }
  }

  const scheduleRestore = (delay = 4000) => {
    scrollTimerRef.current = window.setTimeout(() => {
      setCanScroll(true)
      setShowBackButton(false)
      scrollToCurrentLine('smooth')
      scrollTimerRef.current = null
    }, delay)
  }

  const enterManualMode = () => {
    if (autoScrollingRef.current) return
    setCanScroll(false)
    setShowBackButton(true)
    clearRestoreTimer()
    scheduleRestore()
  }

  const handleMouseEnter = () => {
    if (autoScrollingRef.current) return
    setCanScroll(false)
    setShowBackButton(true)
    clearRestoreTimer()
  }

  const handleMouseLeave = () => {
    if (autoScrollingRef.current) return
    scheduleRestore(2000)
  }

  const handleSeekClick = (time: number) => {
    props.onSeekTo?.(time)
    setSeekFeedbackTime(time)
    if (seekFeedbackTimerRef.current) {
      window.clearTimeout(seekFeedbackTimerRef.current)
    }
    seekFeedbackTimerRef.current = window.setTimeout(() => {
      setSeekFeedbackTime(null)
    }, 1800)
  }
   
  useEffect(() => {
    setLrcList(formatLrcProgress(props.lrc))
  }, [props.lrc])

  useEffect(() => {
    const nextIndex = getChooseLrcWordIndex(lrcList, props.currentTime)
    setLrcIndex(nextIndex)
    if (lrcList[nextIndex] && lrcList[nextIndex].length) {
      const text = lrcList[nextIndex].map(item => {
        return item.text
      })
      props.setCurrentLrc(text.join(''))
    }
    const key = getWordLineProgress(lrcList[nextIndex], props.currentTime)
    setBg(
      {
        backgroundImage: `-webkit-linear-gradient(left,${props.color} ${key}%,#ffffff ${key}%)`
      }
    )
  }, [lrcList, props.color, props.currentTime, props.isPlaying, props.currentInfo?.id, props.setCurrentLrc])

  useEffect(() => {
    if (lrcScroll && canScroll && props.isPlaying) {
      scrollToCurrentLine('smooth')
    }
  }, [canScroll, lrcIndex, props.isPlaying])

  const getLrcChooseName = (index: number) => {
    return lrcIndex === index ? 'choose-lrc-line' : ''
  }

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current)
      }
      if (seekFeedbackTimerRef.current) {
        window.clearTimeout(seekFeedbackTimerRef.current)
      }
    }
  }, [])


  return (
    <section className="music-lrc-word"
      ref={lrcScroll}
      onWheel={enterManualMode}
      onTouchMove={enterManualMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {showBackButton ? (
        <button className="lyrics-follow-button" onClick={() => {
          setCanScroll(true)
          setShowBackButton(false)
          clearRestoreTimer()
          scrollToCurrentLine('smooth')
        }}>
          回到当前句
        </button>
      ) : null}
      <section className="lrc-list">
        {
          lrcList.map((lrcItem: InterfaceLrcWord[], index) => (
            <section key={ index } className="lrc-line">
              <p
                className={`${getLrcChooseName(index)} ${seekFeedbackTime === (lrcItem[0]?.start || 0) ? 'line-seeked' : ''}`.trim()}
                style={lrcIndex === index ? bg : {}}
                title={props.onSeekTo ? `跳转到 ${(lrcItem[0]?.start || 0).toFixed(2)} 秒` : undefined}
                onClick={() => handleSeekClick(lrcItem[0]?.start || 0)}
                data-time={(lrcItem[0]?.start || 0).toFixed(2)}
              >
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
