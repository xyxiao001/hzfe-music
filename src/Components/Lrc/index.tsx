import React, { useEffect, useState } from "react"
import { InterfaceLrc } from "../../Interface/music"
import { formatLrc } from "../../utils"
import './index.scss'
const Lrc = (props: {
  lrc: string
}) => {
  // 保存当前渲染的歌词列表
  const [lrcList, setLrcList] = useState<InterfaceLrc[]>([])
   
  useEffect(() => {
    setLrcList(formatLrc(props.lrc))
  }, [props.lrc])

  return (
    <section className="music-lrc">
      {/* 渲染歌词列表 */}
      <section className="music-list">
        {
          lrcList.map((lrcItem: InterfaceLrc) => (
            <p key={ lrcItem.time }>{ lrcItem.text}</p>
          ))
        }
      </section>
    </section>
  )
}

export default Lrc