import * as THREE from 'three'
import type { Movie } from '../types'

/** Рисует «кадр на экране» из палитры фильма — без внешних картинок. */
export function makeScreenTexture(movie: Movie, aspect: number) {
  const W = 1280
  const H = Math.round(W / aspect)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const [a, b, accent] = movie.palette
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const rg = ctx.createRadialGradient(W * 0.72, H * 0.4, 10, W * 0.72, H * 0.4, H * 0.8)
  rg.addColorStop(0, accent + 'cc')
  rg.addColorStop(1, 'transparent')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, W, H)

  ctx.globalAlpha = 0.18
  ctx.strokeStyle = '#ffffff'
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.arc(W * 0.72, H * 0.4, 60 + i * 55, 0, Math.PI * 2)
    ctx.lineWidth = 2
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = '#ffffff'
  let size = Math.round(H * 0.16)
  ctx.font = `800 ${size}px Manrope, system-ui, sans-serif`
  while (ctx.measureText(movie.title).width > W * 0.86 && size > 20) {
    size -= 4
    ctx.font = `800 ${size}px Manrope, system-ui, sans-serif`
  }
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(movie.title, W * 0.07, H * 0.62)
  ctx.globalAlpha = 0.8
  ctx.font = `500 ${Math.round(H * 0.05)}px Manrope, system-ui, sans-serif`
  ctx.fillText(movie.tagline, W * 0.07, H * 0.74, W * 0.6)
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  // Цилиндр смотрим изнутри — зеркалим по горизонтали
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.x = -1
  tex.offset.x = 1
  tex.anisotropy = 4
  return tex
}
