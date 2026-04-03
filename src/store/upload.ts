import { makeAutoObservable } from 'mobx';
import { uploadRun } from '../utils/upload'

class Upload {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  // 当前是否处于数据库写入的状态中, 同一时刻，只能进行一个读写操作
  // 文件上传的处理
  isUploading: boolean = false

  uploadList: Array<() => Promise<void>> = []

  addUploadTask = (File: File) => {
    this.addTask(async () => {
      await uploadRun(File)
    })
  }

  addTask = (task: () => Promise<void>) => {
    this.uploadList.push(task)
    this.checkUpload()
  }

  // 检查是否处于上传的状态
  checkUpload = async () => {
    if (!this.isUploading && this.uploadList.length) {
      this.handleUpload()
    }
  }

  // 处理上传的数据
  handleUpload = async () => {
    const target = this.uploadList.shift()
    if (!target) {
      return
    }
    try {
      this.isUploading = true
      await target()
    } catch (error) {
      console.log(error)
    } finally {
      this.isUploading = false
      this.checkUpload()
    }
  }
}

const upload = new Upload()


 
export default upload
