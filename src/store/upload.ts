import { observable } from 'mobx';

class Upload {
  @observable
  // 当前是否处于数据库写入的状态中, 同一时刻，只能进行一个读写操作
  uploadStatus:boolean = false
}

const upload = new Upload()


 
export default upload

