import { InterfaceMusicPlayingInfo } from "../Interface/music";

const initData = {
  id: '',
  playing: false,
  duration: 0,
  currentTime: 0,
  change: false,
  min: true
}

const reducer = (state: InterfaceMusicPlayingInfo, actions: { type: string, data: any }) => {
  switch (actions.type) {
    case 'change':
      return {
        ...state,
        ...actions.data
      }
    default:
      return {
        ...state,
        ...actions.data
      }
  }
}

export {
  reducer,
  initData
};