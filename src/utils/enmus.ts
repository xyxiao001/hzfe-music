// 播放枚举值
export enum EnumPlayingType {
  // 顺序播放
  loop = 'loop',
  // 单曲循环
  single = 'single',
  // 随机播放
  random = 'random',
}

// 播放列表
export const typeList = [
  {
    name: '顺序播放',
    key: EnumPlayingType.loop,
    icon: '#icon-shunxubofang'
  },
  {
    name: '单曲循环',
    key: EnumPlayingType.single,
    icon: '#icon-danquxunhuan'
  },
  {
    name: '随机播放',
    key: EnumPlayingType.random,
    icon: '#icon-suiji'
  },
]
