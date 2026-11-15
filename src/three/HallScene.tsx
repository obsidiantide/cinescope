import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Hall, Movie, Session } from '../types'
import { computeLayout, ROW_DEPTH, type HallLayout } from './layout'
import { Seat3D, type SeatState } from './Seat'
import { makeScreenTexture } from './screenTexture'
import { useBooking } from '../store/booking'
import { currency, seatTypeLabel } from '../lib/format'

export type CameraView = 'overview' | 'top' | 'screen'

interface Props {
  hall: Hall
  movie: Movie
  session: Session
  occupied: Set<string>
  view: CameraView
}

export default function HallScene(props: Props) {
  const layout = useMemo(() => computeLayout(props.hall), [props.hall])
  const back = layout.depth + 6
  const tipRef = useRef<HTMLDivElement>(null)
  return (
    <>
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 16, back + 18], fov: 50, near: 0.05, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => useBooking.getState().setHovered(null)}
    >
      <color attach="background" args={['#07070c']} />
      <fog attach="fog" args={['#07070c', 22, 60]} />
      <Scene {...props} layout={layout} tipRef={tipRef} />
    </Canvas>
    <SeatTooltip ref={tipRef} layout={layout} session={props.session} occupied={props.occupied} />
    </>
  )
}

/** Подсказка — обычный DOM поверх канваса; позицию каждый кадр выставляет TipTracker. */
function SeatTooltip({
  ref,
  layout,
  session,
  occupied,
}: {
  ref: React.RefObject<HTMLDivElement | null>
  layout: HallLayout
  session: Session
  occupied: Set<string>
}) {
  const hovered = useBooking((s) => s.hovered)
  const focusSeat = useBooking((s) => s.focusSeat)
  const seat = hovered ? layout.byId.get(hovered) : undefined
  return (
    <div ref={ref} className="seat-tip" style={{ display: seat && !focusSeat ? undefined : 'none' }}>
      {seat && (
        <>
          <b>
            Ряд {seat.row}, место {seat.number}
          </b>
          <span>{seatTypeLabel[seat.type]}</span>
          {occupied.has(seat.id) ? <em className="taken">Занято</em> : <em>{currency(session.prices[seat.type])}</em>}
        </>
      )}
    </div>
  )
}

const tmpV = new THREE.Vector3()
function TipTracker({ layout, tipRef }: { layout: HallLayout; tipRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera, size } = useThree()
  useFrame(() => {
    const el = tipRef.current
    const id = useBooking.getState().hovered
    const seat = id ? layout.byId.get(id) : undefined
    if (!el || !seat) return
    tmpV.set(seat.position[0], seat.position[1] + 1.5, seat.position[2]).project(camera)
    const x = ((tmpV.x + 1) / 2) * size.width
    const y = ((1 - tmpV.y) / 2) * size.height
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
  })
  return null
}

/** Буква ряда — спрайт с текстурой, всегда повёрнут к камере. */
function RowLabel({ text, position }: { text: string; position: [number, number, number] }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.arc(32, 32, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = '800 34px Manrope, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 32, 34)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [text])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <sprite position={position} scale={0.42}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  )
}

function Scene({
  movie,
  occupied,
  view,
  layout,
  tipRef,
}: Props & { layout: HallLayout; tipRef: React.RefObject<HTMLDivElement | null> }) {
  const selected = useBooking((s) => s.selected)
  const hovered = useBooking((s) => s.hovered)
  const focusSeat = useBooking((s) => s.focusSeat)
  const toggle = useBooking((s) => s.toggle)
  const setHovered = useBooking((s) => s.setHovered)
  const setFocusSeat = useBooking((s) => s.setFocusSeat)
  const controls = useRef<OrbitControlsImpl>(null)


  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#b7c3ff', '#2a1a22', 0.6]} />
      <directionalLight position={[4, 12, 8]} intensity={1.1} />
      <pointLight
        position={[0, layout.screen.y, layout.screen.z + 3]}
        color={movie.palette[1]}
        intensity={2.2}
        distance={45}
        decay={0}
      />

      <Screen movie={movie} layout={layout} />
      <Room layout={layout} />

      {layout.seats.map((seat) => {
        const state: SeatState = occupied.has(seat.id)
          ? 'occupied'
          : selected.includes(seat.id)
            ? 'selected'
            : 'free'
        return (
          <Seat3D
            key={seat.id}
            seat={seat}
            state={state}
            hovered={hovered === seat.id}
            onHover={setHovered}
            onToggle={toggle}
            onLook={setFocusSeat}
          />
        )
      })}

      {layout.rows.map((r) =>
        [r.left - 0.5, r.right + 0.5].map((x, i) => <RowLabel key={r.label + i} text={r.label} position={[x, r.y + 0.6, r.z]} />),
      )}

      <TipTracker layout={layout} tipRef={tipRef} />
      <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />
      <CameraRig layout={layout} view={view} focusSeat={focusSeat} controls={controls} />
    </>
  )
}

function Screen({ movie, layout }: { movie: Movie; layout: HallLayout }) {
  const { width, height, y, z } = layout.screen
  const tex = useMemo(() => makeScreenTexture(movie, width / height), [movie, width, height])
  const R = width * 1.6
  const theta = width / R
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <group position={[0, y, z + R]}>
      <mesh>
        <cylinderGeometry args={[R, R, height, 64, 1, true, Math.PI - theta / 2, theta]} />
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* мягкое свечение вокруг экрана */}
      <mesh position={[0, 0, -0.08]}>
        <cylinderGeometry args={[R + 0.08, R + 0.08, height * 1.12, 64, 1, true, Math.PI - (theta * 1.08) / 2, theta * 1.08]} />
        <meshBasicMaterial color={movie.palette[1]} transparent opacity={0.18} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Room({ layout }: { layout: HallLayout }) {
  const W = layout.width + 2
  const front = layout.screen.z - 1.5
  const backZ = layout.depth + ROW_DEPTH * 1.5
  const len = backZ - front
  const steps = layout.rows
  const wallH = 9
  return (
    <group>
      {/* пол перед первым рядом */}
      <mesh position={[0, -0.05, (front + ROW_DEPTH * -0.5) / 2]} >
        <boxGeometry args={[W, 0.1, -front - ROW_DEPTH * 0.5 + 0.01]} />
        <meshStandardMaterial color="#14101a" roughness={0.95} />
      </mesh>
      {/* ступени амфитеатра */}
      {steps.map((r, i) => {
        const h = r.y + 0.1
        return (
          <group key={r.label}>
            <mesh position={[0, h / 2 - 0.1, r.z]}>
              <boxGeometry args={[W, h, ROW_DEPTH]} />
              <meshStandardMaterial color={i % 2 ? '#1b1422' : '#191220'} roughness={0.95} />
            </mesh>
            {/* светодиодная подсветка ступени */}
            <mesh position={[0, h - 0.09, r.z - ROW_DEPTH / 2 + 0.01]}>
              <boxGeometry args={[W, 0.025, 0.025]} />
              <meshBasicMaterial color="#ff4d6d" toneMapped={false} transparent opacity={0.55} />
            </mesh>
          </group>
        )
      })}
      {/* стены — односторонние плоскости, смотрящие внутрь: снаружи зал виден «в разрезе» */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (W / 2), wallH / 2 - 0.5, front + len / 2]} rotation={[0, -s * Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[len, wallH]} />
            <meshStandardMaterial color="#14111b" roughness={0.9} />
          </mesh>
          {/* акустические панели с подсветкой */}
          {Array.from({ length: Math.floor(len / 3) }).map((_, i) => (
            <group key={i} position={[-len / 2 + 1.5 + i * 3, 0.6, 0.03]}>
              <mesh>
                <planeGeometry args={[2.4, 4.2]} />
                <meshStandardMaterial color="#201a2b" roughness={1} />
              </mesh>
              <mesh position={[0, -2.2, 0.01]}>
                <planeGeometry args={[2.4, 0.04]} />
                <meshBasicMaterial color="#6a7cff" toneMapped={false} transparent opacity={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* задняя стена */}
      <mesh position={[0, wallH / 2 - 0.5, backZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, wallH]} />
        <meshStandardMaterial color="#110e16" roughness={0.9} />
      </mesh>
      {/* стена за экраном */}
      <mesh position={[0, wallH / 2 - 0.5, front - 0.2]}>
        <boxGeometry args={[W, wallH, 0.2]} />
        <meshStandardMaterial color="#09080d" roughness={1} />
      </mesh>
    </group>
  )
}

const EYE_HEIGHT = 1.15

function CameraRig({
  layout,
  view,
  focusSeat,
  controls,
}: {
  layout: HallLayout
  view: CameraView
  focusSeat: string | null
  controls: React.RefObject<OrbitControlsImpl | null>
}) {
  const { camera, size } = useThree()
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; seat: boolean } | null>(null)
  const pending = useRef(true)

  // Ref на OrbitControls появляется не сразу, поэтому сам расчёт цели делаем в useFrame
  useEffect(() => {
    pending.current = true
  }, [view, focusSeat, layout])

  const plan = (c: OrbitControlsImpl) => {
    const screenCenter = new THREE.Vector3(0, layout.screen.y, layout.screen.z)
    const mid = layout.depth / 2
    const lastY = layout.rows[layout.rows.length - 1].y
    let pos: THREE.Vector3
    let target: THREE.Vector3
    let seat = false
    const s = focusSeat ? layout.byId.get(focusSeat) : undefined
    if (s) {
      pos = new THREE.Vector3(s.position[0], s.position[1] + EYE_HEIGHT, s.position[2] + 0.1)
      const dir = screenCenter.clone().sub(pos).normalize()
      target = pos.clone().add(dir.multiplyScalar(0.12))
      seat = true
    } else if (view === 'top') {
      pos = new THREE.Vector3(0, (13 + layout.width * 0.55) * Math.max(1, 1.3 / (size.width / size.height)), mid + 1.5)
      target = new THREE.Vector3(0, 0, mid - 0.5)
    } else if (view === 'screen') {
      pos = new THREE.Vector3(0, layout.screen.y - 0.4, layout.screen.z + 2)
      target = new THREE.Vector3(0, lastY * 0.5, mid)
    } else {
      // на узких (портретных) экранах отодвигаем камеру, чтобы зал поместился по ширине
      const f = Math.max(1, 1.25 / (size.width / size.height))
      pos = new THREE.Vector3(layout.width * 0.2, lastY + 7.5 * f, layout.depth + 9.5 * f)
      target = new THREE.Vector3(0, 0.4, mid - 2.5)
    }
    // во время перелёта снимаем ограничения, чтобы контролы не «дёргали» камеру
    c.minDistance = 0
    c.maxDistance = Infinity
    c.minPolarAngle = 0
    c.maxPolarAngle = Math.PI
    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    c.enabled = false
    goal.current = { pos, target, seat }
  }

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    if (pending.current) {
      pending.current = false
      plan(c)
    }
    const g = goal.current
    if (!g) return
    const k = 1 - Math.exp(-dt * 3.2)
    camera.position.lerp(g.pos, k)
    c.target.lerp(g.target, k)
    c.update()
    if (camera.position.distanceTo(g.pos) < 0.02 && c.target.distanceTo(g.target) < 0.02) {
      camera.position.copy(g.pos)
      c.target.copy(g.target)
      c.enabled = true
      if (g.seat) {
        // «осмотреться» с места: вращение вокруг точки прямо перед глазами
        c.enableZoom = false
        c.enablePan = false
        c.rotateSpeed = -0.35
        c.minDistance = 0.1
        c.maxDistance = 0.14
        const az = c.getAzimuthalAngle()
        const pol = c.getPolarAngle()
        c.minPolarAngle = pol - 0.45
        c.maxPolarAngle = pol + 0.35
        c.minAzimuthAngle = az - 0.9
        c.maxAzimuthAngle = az + 0.9
      } else {
        c.enableZoom = true
        c.enablePan = false
        c.rotateSpeed = 0.6
        c.minDistance = 3
        c.maxDistance = 32
        const az = c.getAzimuthalAngle()
        c.minPolarAngle = 0.05
        c.maxPolarAngle = 1.5
        c.minAzimuthAngle = az - 1.3
        c.maxAzimuthAngle = az + 1.3
      }
      c.update()
      goal.current = null
    }
  })
  return null
}
