import { memo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { PlacedSeat } from './layout'
import type { SeatType } from '../types'

export type SeatState = 'free' | 'occupied' | 'selected'

// ---- Общие геометрии и материалы (создаются один раз на всё приложение) ----
const geoCache = new Map<string, THREE.BufferGeometry>()
function rbox(w: number, h: number, d: number, r = 0.05) {
  const key = [w, h, d, r].join('|')
  let g = geoCache.get(key)
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, r)
    geoCache.set(key, g)
  }
  return g
}

export const SEAT_COLORS: Record<SeatType, string> = {
  standard: '#4361a8',
  vip: '#c9962e',
  sofa: '#a63d72',
}
export const SELECTED_COLOR = '#ff4d6d'
export const OCCUPIED_COLOR = '#3a3a46'

const matCache = new Map<string, THREE.MeshStandardMaterial>()
function mat(color: string, emissive = '#000000', emissiveIntensity = 0, roughness = 0.75) {
  const key = [color, emissive, emissiveIntensity, roughness].join('|')
  let m = matCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity, roughness, metalness: 0.05 })
    matCache.set(key, m)
  }
  return m
}
const frameMat = mat('#15151c', '#000', 0, 0.5)
const legMat = mat('#0c0c10', '#000', 0, 0.4)

function lighten(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#ffffff'), amt)
  return '#' + c.getHexString()
}

interface Props {
  seat: PlacedSeat
  state: SeatState
  hovered: boolean
  onHover: (id: string | null) => void
  onToggle: (id: string) => void
  onLook: (id: string) => void
}

function SeatImpl({ seat, state, hovered, onHover, onToggle, onLook }: Props) {
  const group = useRef<THREE.Group>(null)
  const marker = useRef<THREE.Mesh>(null)
  const w = seat.width
  const isSofa = seat.type === 'sofa'
  const isVip = seat.type === 'vip'
  const interactive = state !== 'occupied'

  const base = SEAT_COLORS[seat.type]
  const upholstery =
    state === 'occupied'
      ? mat(OCCUPIED_COLOR, '#000', 0, 0.9)
      : state === 'selected'
        ? mat(SELECTED_COLOR, SELECTED_COLOR, hovered ? 0.9 : 0.6, 0.5)
        : hovered
          ? mat(lighten(base, 0.35), base, 0.45, 0.6)
          : mat(base, base, 0.08)

  const cushionW = isSofa ? w - 0.12 : w - (isVip ? 0.18 : 0.14)
  const backH = isVip || isSofa ? 0.72 : 0.62

  useFrame((st, dt) => {
    const g = group.current
    if (!g) return
    const k = 1 - Math.exp(-dt * 12)
    const targetY = seat.position[1] + (state === 'selected' ? 0.06 : 0)
    const targetS = hovered && interactive ? 1.08 : 1
    g.position.y += (targetY - g.position.y) * k
    g.scale.setScalar(g.scale.x + (targetS - g.scale.x) * k)
    if (marker.current) {
      marker.current.position.y = 1.45 + Math.sin(st.clock.elapsedTime * 3 + seat.indexInRow) * 0.06
      marker.current.rotation.y += dt * 2
    }
  })

  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onHover(seat.id)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          onHover(null)
          document.body.style.cursor = ''
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > 6) return // это было вращение камеры, а не клик
          onToggle(seat.id)
        },
        onDoubleClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onLook(seat.id)
        },
      }
    : {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onHover(seat.id)
          document.body.style.cursor = 'not-allowed'
        },
        onPointerOut: () => {
          onHover(null)
          document.body.style.cursor = ''
        },
      }

  return (
    <group
      ref={group}
      position={seat.position}
      rotation={[0, seat.rotationY, 0]}
      {...handlers}
    >
      {/* хитбокс побольше, чтобы легче попадать курсором */}
      <mesh position={[0, 0.55, 0.05]} visible={false}>
        <boxGeometry args={[w, 1.1, 0.7]} />
      </mesh>
      {/* ножка-основание */}
      <mesh geometry={rbox(Math.min(w * 0.5, 0.5), 0.3, 0.3, 0.03)} material={legMat} position={[0, 0.15, 0.05]} />
      {/* сиденье */}
      <mesh geometry={rbox(cushionW, 0.16, 0.56, 0.07)} material={upholstery} position={[0, 0.4, 0]} />
      {/* спинка */}
      <mesh
        geometry={rbox(cushionW, backH, 0.14, 0.06)}
        material={upholstery}
        position={[0, 0.42 + backH / 2, 0.29]}
        rotation={[-0.12, 0, 0]}
      />
      {isSofa && (
        <mesh geometry={rbox(0.05, 0.5, 0.5, 0.02)} material={frameMat} position={[0, 0.62, 0.02]} />
      )}
      {/* подлокотники */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          geometry={rbox(0.07, 0.3, 0.6, 0.03)}
          material={frameMat}
          position={[s * (w / 2 - 0.035), 0.55, 0.02]}
        />
      ))}
      {state === 'selected' && (
        <mesh ref={marker} position={[0, 1.45, 0.1]} rotation={[Math.PI, 0, 0]} material={mat(SELECTED_COLOR, SELECTED_COLOR, 1.5, 0.3)}>
          <coneGeometry args={[0.12, 0.24, 4]} />
        </mesh>
      )}
    </group>
  )
}

export const Seat3D = memo(SeatImpl)
