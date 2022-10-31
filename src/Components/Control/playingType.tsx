import React, { useEffect } from "react";
import common from "../../store/common";
import { getLastPlayType } from "../../utils/local";
import { observer } from "mobx-react"
import { EnumPlayingType, typeList } from "../../utils/enmus";
import { Tooltip } from "antd";

const PlayingType = observer(() => {
  const getPrePlayType = async () => {
    const type = await getLastPlayType() as `${EnumPlayingType}`;
    common.playingType = type;
  }

  const currentType = common.playingType;

  const currentTypeOptions = typeList.find(item => item.key === currentType);

  const handleClick = () => {
    common.updatePlayingType(currentType)
  }

  useEffect(() => {
    getPrePlayType();
  }, []);
  return (
    <section className="playing-type">
      <Tooltip placement="topLeft" title={currentTypeOptions?.name} color="#999">
        <svg className="icon" aria-hidden="true" onClick={handleClick}>
            <use xlinkHref={currentTypeOptions?.icon}></use>
        </svg>
      </Tooltip>
    </section>
  )
});

export default PlayingType;