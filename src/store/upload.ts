import { observable, action } from 'mobx';
import { uploadRun } from '../utils/upload'

class Upload {
  // 当前是否处于数据库写入的状态中, 同一时刻，只能进行一个读写操作
  // 文件上传的处理
  @observable
  isUploading: boolean = false

  @observable
  uploadList: File[] = []

  @action
  addUploadTask = (File: File) => {
    console.log(`有新的上传任务哦`, File)
    this.uploadList.push(File)
    this.checkUpload()
  }

  // 检查是否处于上传的状态
  checkUpload = async () => {
    console.log('检查当前上传的状态')
    if (!this.isUploading && this.uploadList.length) {
      this.handleUpload()
    }
  }

  // 处理上传的数据
  handleUpload = async () => {
    try {
      this.isUploading = true
      console.log('length', this.uploadList.length)
      const target = this.uploadList.shift() as File;
      await uploadRun(target)
      console.log('处理上传的状态')
      this.isUploading = false
      this.checkUpload()
    } catch (error) {
      console.log(error)
    }
  }
}

const upload = new Upload()


 
export default upload

