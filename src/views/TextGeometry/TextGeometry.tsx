import React, { useEffect, useState } from 'react'
import { Font, Geometry, TextGeometryParameters, TextGeometry } from 'three'
import { FaceType } from '../../models/face'
import { useGlobalState } from '../../modules/global'
import { ORIENTATION_INDICATOR } from '../../models/orientationIndicator'
import { addBarIndicator, addPeriodIndicator } from '../../utils/addOrientationIndicator'

type Props = {
  font: Font | null
  face: FaceType
  dieFontScale: number
  dieSize: number
}

const TextGeometry2: React.FC<Props> = ({ font, face, dieFontScale, dieSize }: Props) => {
  const [globalScale] = useGlobalState('globalScale')
  const [globalFontScale] = useGlobalState('globalFontScale')
  const [globalDepth] = useGlobalState('globalDepth')
  const [orientationIndicator] = useGlobalState('orientationIndicator')
  const [orientationIndicatorSize] = useGlobalState('orientationIndicatorSize')
  const [orientationIndicatorSpace] = useGlobalState('orientationIndicatorSpace')
  const [orientationIndicatorOnD8D6] = useGlobalState('orientationIndicatorOnD6D8')
  const [die] = useGlobalState('die')
  const [geometry, setGeometry] = useState<Geometry>(new Geometry())

  useEffect(() => {
    let config: null | TextGeometryParameters = null
    let geometry: Geometry = new Geometry()
    if (font) {
      config = {
        font,
        size: globalScale * globalFontScale * dieFontScale * dieSize,
        height: globalDepth + 0.02,
        curveSegments: 6,
        bevelEnabled: false,
        bevelThickness: 0.01,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 8,
      }
      geometry = new TextGeometry(face.text, config)
      geometry.center()
      if (
        orientationIndicator !== ORIENTATION_INDICATOR.NONE &&
        (face.text === '6' || face.text === '9') &&
        (orientationIndicatorOnD8D6 || (die !== 'd6' && die !== 'd8'))
      ) {
        if (orientationIndicator === ORIENTATION_INDICATOR.PERIOD)
          addPeriodIndicator(
            globalScale,
            globalFontScale,
            globalDepth,
            dieFontScale,
            dieSize,
            geometry,
            config,
            orientationIndicatorSize,
            orientationIndicatorSpace,
          )
        if (orientationIndicator === ORIENTATION_INDICATOR.BAR)
          addBarIndicator(
            globalScale,
            globalFontScale,
            globalDepth,
            dieFontScale,
            dieSize,
            geometry,
            orientationIndicatorSize,
            orientationIndicatorSpace,
          )
      }
    }

    if (!geometry) throw new Error('There must be at least one number for the D4 face generator.')

    setGeometry(geometry)
  }, [
    font,
    globalScale,
    globalFontScale,
    globalDepth,
    face,
    dieFontScale,
    dieSize,
    die,
    orientationIndicator,
    orientationIndicatorOnD8D6,
    orientationIndicatorSize,
    orientationIndicatorSpace,
  ])

  return <primitive object={geometry} attach="geometry" />
}

export default TextGeometry2
