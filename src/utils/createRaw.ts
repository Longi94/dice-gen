import {
  Mesh,
  BoxGeometry,
  TetrahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  Geometry,
  CylinderGeometry,
} from 'three'
import { getGlobalState } from '../modules/global'
import { isFaceOption } from '../models/face'
import { PentagonalTrapezohedronGeometry } from '../models/pentagonalTrapezohedron'
import { isDiceOption } from '../models/dice'
import { CrystalD4Geometry } from '../models/crystalD4'
import { AdjustableOctahedronGeometry } from '../models/adjustableOctahedron'

export function createRaw(die?: string): { die: Mesh; numbers: Mesh } {
  let mesh = null

  const globalScale = getGlobalState().globalScale
  if (!die) die = getGlobalState().die
  const dieSizeKey = die + 'Size'
  if (!isDiceOption(dieSizeKey)) throw new Error(die + ' does not have state keys for scale.')
  const dieSize = getGlobalState()[dieSizeKey]
  const size = globalScale * dieSize

  let dieNumber = 4

  if (die === 'd2') {
    dieNumber = 2
    const d2Radius = getGlobalState().d2Radius
    const d2Sides = getGlobalState().d2Sides
    mesh = new Mesh(new CylinderGeometry(d2Radius * globalScale, d2Radius * globalScale, size, d2Sides))
  }
  if (die === 'd4') {
    dieNumber = 4
    mesh = new Mesh(new TetrahedronGeometry(size))
  } else if (die === 'd4Crystal') {
    dieNumber = 4
    mesh = new Mesh(
      new CrystalD4Geometry(
        size,
        getGlobalState().d4CrystalHeight * globalScale,
        getGlobalState().d4CrystalPointHeight * globalScale,
      ),
    )
  } else if (die === 'd4Shard') {
    dieNumber = 4
    mesh = new Mesh(
      new AdjustableOctahedronGeometry(
        size,
        getGlobalState().d4ShardTopPointHeight,
        getGlobalState().d4ShardBottomPointHeight,
      ),
    )
  } else if (die === 'd6') {
    dieNumber = 6
    mesh = new Mesh(new BoxGeometry(size, size, size))
  } else if (die === 'd8') {
    dieNumber = 8
    mesh = new Mesh(new AdjustableOctahedronGeometry(size, getGlobalState().d8Height, getGlobalState().d8Height))
  } else if (die === 'd10' || die === 'd100') {
    dieNumber = 10
    mesh = new Mesh(new PentagonalTrapezohedronGeometry(size, getGlobalState().d10Height))
  } else if (die === 'd12') {
    dieNumber = 12
    mesh = new Mesh(new DodecahedronGeometry(size))
  } else if (die === 'd20') {
    dieNumber = 20
    mesh = new Mesh(new IcosahedronGeometry(size))
  }

  if (!mesh) throw new Error(`D${die} has not been programmed into the subtractSolid function.`)

  mesh.position.x = 0
  mesh.position.y = 0
  mesh.position.z = 0

  const numbers = new Geometry()
  for (let i = 1; i <= dieNumber; i++) {
    let key = `${die}f${i}`
    if (key === 'd10f10') key = 'd10f0'
    if (key === 'd100f10') key = 'd100f0'
    if (!isFaceOption(key)) throw new Error(`Key "${key}" is not a valid die/face combination.`)
    const face = getGlobalState()[key]
    const faceMesh = face.ref
    if (!faceMesh || (faceMesh.geometry instanceof Geometry && !faceMesh.geometry.faces.length)) continue
    const clone = face.ref.clone()
    clone.updateMatrix()
    numbers.merge(clone.geometry as Geometry, clone.matrix)
  }

  return { die: mesh, numbers: new Mesh(numbers) }
}
