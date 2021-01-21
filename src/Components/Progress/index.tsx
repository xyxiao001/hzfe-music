import React, { useEffect, useState } from "react"
import './index.scss'
import { Slider } from 'antd';

const Progress = (props: {
  range: number,
  handleChanging: Function,
  setChange: Function,
}) => {

  const [value, setValue] = useState(0)

  const [isChanging, setIsChanging] = useState(false)


  useEffect(() => {
    if (!isChanging) {
      setValue(props.range)
    }
  }, [isChanging, props.range])

  const onChange = (value: number) => {
    setIsChanging(true)
    props.setChange(true)
    setValue(value)
    props.handleChanging(value)
  }

  const onAfterChange = (value: number) => {
    // 已经取消拖动，可以同步跳转了
    // console.log('afterChange', value)
    props.setChange(false)
    setIsChanging(false)
  }

  return (
    <section className="progress">
       <Slider defaultValue={0} value={value} onChange={onChange} onAfterChange={onAfterChange} />
    </section>
  )
}

export default Progress