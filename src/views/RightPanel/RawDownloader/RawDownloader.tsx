import React from 'react'
import { useGlobalState } from '../../../modules/global'

// Style
import { ActionButton } from '../style'

// Utils
import { download, generateSTLFromMesh } from '../../../utils/downloader'
import { createRaw } from '../../../utils/createRaw'

type Props = {}

/**
 * This component renders a button that triggers the processing and download of the currently viewed die.
 * @constructor
 */
const RawDownloader: React.FC<Props> = () => {
  const [die] = useGlobalState('die')

  const handleDownload = (): void => {
    const meshes = createRaw()
    download({
      [die]: generateSTLFromMesh(meshes.die),
      [die.toString() + 'numbers']: generateSTLFromMesh(meshes.numbers),
    })
  }

  return (
    <ActionButton rgbColor={'62,119,84'} onClick={handleDownload}>
      Download Raw
    </ActionButton>
  )
}

export default RawDownloader
