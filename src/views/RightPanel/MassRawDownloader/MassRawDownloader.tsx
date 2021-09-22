import React, { useState, useEffect } from 'react'
import { dispatch, getGlobalState, useGlobalState } from '../../../modules/global'
import { resetFaceRefs } from '../../../modules/actions'

// Style
import { Checkbox, Modal, Row } from 'antd'
import { ActionButton } from '../style'

// Models
import { DiceType, DIE_NAME } from '../../../models/dice'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

// Utils
import { download, generateSTLFromMesh } from '../../../utils/downloader'
import { createRaw } from '../../../utils/createRaw'

type Props = {}

const DIE_LIST: Array<DiceType> = ['d2', 'd4', 'd4Crystal', 'd4Shard', 'd6', 'd8', 'd10', 'd100', 'd12', 'd20']

/**
 * This component renders a button that when clicked opens a modal. That modal allows the user to select all the dice
 * they would like to download. The onOk event for the model then triggers the processing and download of all the
 * selected dice.
 * @constructor
 */
const MassRawDownloader: React.FC<Props> = () => {
  const [dieList, setDieList] = useState<Array<DiceType>>(DIE_LIST)
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadStrings, setDownloadStrings] = useState<Record<string, string>>({})
  const [die, setDie] = useGlobalState('die')
  const [loadingDice, setLoadingDice] = useGlobalState('loadingDice')
  const setLoadingFaces = useGlobalState('loadingFaces')[1]

  const processDie = (): void => {
    const meshes = createRaw()
    const newDownloadStrings = {
      ...downloadStrings,
      [die]: generateSTLFromMesh(meshes.die),
      [die.toString() + 'numbers']: generateSTLFromMesh(meshes.numbers),
    }

    if (dieList.indexOf(die) === dieList.length - 1) {
      download(newDownloadStrings, () => {
        setLoadingDice(null)
        setLoadingFaces(null)
        setDownloading(false)
      })
    } else {
      setDownloadStrings(newDownloadStrings)
      setLoadingDice({ current: loadingDice ? loadingDice.current + 1 : 1, max: dieList.length })
      setLoadingFaces({ current: 0, max: 1 })
      dispatch(resetFaceRefs())
      setDie(dieList[dieList.indexOf(die) + 1])
    }
  }

  /**
   * This function is called when the user confirms their download. The modal is closed and the local downloading state
   * is set to true. The global loading state of how many dice there are to process is set and the current die is set
   * at 1. If the first die to be processed is the currently viewed die, the download starts, else the die is changed
   * in the global state so it is rendered to the screen. processDie() will then be called in the handleEffect function.
   */
  const handleOk = (): void => {
    setOpen(false)
    setDownloading(true)
    setLoadingDice({ current: 1, max: dieList.length })
    if (die === dieList[0]) processDie()
    else setDie(dieList[0])
  }

  /**
   * This effect is triggered whenever the currently viewed die changes. This should only happen while in a downloading
   * state if this component triggered the die to change so that it can process it. The global state contains refs to
   * the geometries of the faces for components. The highest face for the new die is determined and then we check if we
   * have set the name of the geometry to "rendered" (a hacky way for us to make sure it's done rendering). If it is
   * then we process the die (with a short timeout to give three.js time to buffer). If it is not finished rendering
   * then we set a timeout and call this handleEffect function in 1 second to check if it's rendered at that point.
   */
  const handleEffect = (): void => {
    if (downloading) {
      const key = `${die}f${
        die === 'd100' || die === 'd10' ? '0' : die === 'd4Crystal' || die === 'd4Shard' ? '4' : die.replace('d', '')
      }`
      const maxFace = getGlobalState()[key]
      if (maxFace && maxFace.ref && maxFace.ref.name === 'rendered') {
        setTimeout(processDie(), 500)
      } else {
        setTimeout(handleEffect, 1000)
      }
    }
  }

  useEffect(handleEffect, [die])

  const handleChange = (die: DiceType, e: CheckboxChangeEvent): void => {
    const newDieList = dieList.slice()
    if (!e.target.checked) newDieList.splice(newDieList.indexOf(die), 1)
    else newDieList.push(die)
    setDieList(newDieList)
  }

  return (
    <>
      <Modal title="Download Set" visible={open} onCancel={(): void => setOpen(false)} onOk={handleOk}>
        {DIE_LIST.map(die => (
          <Row key={die}>
            <Checkbox checked={dieList.includes(die)} onChange={(e: CheckboxChangeEvent): void => handleChange(die, e)}>
              {DIE_NAME[die]}
            </Checkbox>
          </Row>
        ))}
      </Modal>
      <ActionButton rgbColor={'20,98,115'} onClick={(): void => setOpen(true)}>
        Download Raw Set
      </ActionButton>
    </>
  )
}

export default MassRawDownloader
