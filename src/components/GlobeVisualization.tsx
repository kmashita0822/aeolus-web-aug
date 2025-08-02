"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import * as topojson from "topojson-client"

// Import GeoJSON types
import type { Position as GeoJSONPosition } from "geojson"

// Add type definition for TopoJSON Position
type Position = [number, number]

/* ---------- Palette & physics knobs ---------- */
const BASE_COLOR = 0x404040 // Brighter gray for better visibility
const HOVER_COLOR = 0xFFC300 // Yellow accent

const SEVERITIES = [
  { color: 0xFFC300, strength: 0.08 }, // All using yellow
  { color: 0xFFC300, strength: 0.12 }, // All using yellow
  { color: 0xFFC300, strength: 0.18 }, // All using yellow
]

const PULSE_INTERVAL = 400 // ms
const PULSE_BATCH = 3 // pulses per batch
const PULSE_LIFE = 1200 // ms duration
const PULSE_RADIUS = 0.35

const HOVER_RADIUS = 0.5
const HOVER_TANGENT_STR = 0.15
const HOVER_NORMAL_STR = 0.22 // bigger "pop‑out"

/* ---------- Globe class ---------- */
class ParticleGlobe {
  radius = 1.25
  sizes = { width: window.innerWidth, height: window.innerHeight }
  isMobile: boolean

  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  particles!: THREE.Points
  sphere: THREE.Mesh
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  hitPoint = new THREE.Vector3(999, 999, 999)

  pulses: {
    center: THREE.Vector3
    start: number
    col: THREE.Color
    str: number
  }[] = []
  lastPulse = 0

  constructor(canvas: HTMLCanvasElement, isMobile: boolean) {
    this.isMobile = isMobile

    /* Scene + renderer */
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000) // Black background

    this.camera = new THREE.PerspectiveCamera(70, this.sizes.width / this.sizes.height, 1, 1000)
    // Adjust camera position for mobile
    this.camera.position.z = isMobile ? 3.5 : 3

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    /* Raycast sphere */
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 32, 32),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    this.scene.add(this.sphere)

    this.init()
    window.addEventListener("mousemove", this.onMouseMove)
    window.addEventListener("resize", this.onResize)
  }

  /* ---------- Geometry ---------- */
  async init() {
    try {
      const topo = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@1/world/50m.json").then((r) => r.json())

      const mesh = topojson.mesh(topo, topo.objects.land)

      const verts: number[] = []
      const norms: number[] = []
      const tangs: number[] = []
      const colors: number[] = []
      const base = new THREE.Color(BASE_COLOR)

      for (const line of mesh.coordinates) {
        const L = line.length
        for (let i = 0; i < L; i++) {
          const v = this.toSphere(line[i])
          const p1 = this.toSphere(line[(i - 1 + L) % L])
          const p2 = this.toSphere(line[(i + 1) % L])
          const t = p2.clone().sub(p1).normalize() // tangent
          const n = v.clone().normalize() // outward normal

          verts.push(v.x, v.y, v.z)
          norms.push(n.x, n.y, n.z)
          tangs.push(t.x, t.y, t.z)
          colors.push(base.r, base.g, base.b)
        }
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
      geo.setAttribute("initialPosition", new THREE.Float32BufferAttribute([...verts], 3))
      geo.setAttribute("normalOut", new THREE.Float32BufferAttribute(norms, 3))
      geo.setAttribute("tangentOut", new THREE.Float32BufferAttribute(tangs, 3))
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

      this.particles = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          vertexColors: true,
          size: this.isMobile ? 0.007 : 0.005, // Slightly larger points on mobile
          sizeAttenuation: true,
        }),
      )
      this.scene.add(this.particles)

      this.animate()
    } catch (error) {
      console.error("Failed to initialize globe:", error)
    }
  }

  /* ---------- Helpers ---------- */
  toSphere(position: GeoJSONPosition) {
    const [lon, lat] = position as Position
    const λ = (lon * Math.PI) / 180
    const φ = (lat * Math.PI) / 180
    return new THREE.Vector3(
      this.radius * Math.cos(φ) * Math.cos(λ),
      this.radius * Math.sin(φ),
      -this.radius * Math.cos(φ) * Math.sin(λ),
    )
  }

  spawnPulse() {
    const u = Math.random(),
      v = Math.random()
    const θ = 2 * Math.PI * u
    const φ = Math.acos(2 * v - 1)
    const center = new THREE.Vector3(
      this.radius * Math.sin(φ) * Math.cos(θ),
      this.radius * Math.sin(φ) * Math.sin(θ),
      this.radius * Math.cos(φ),
    )
    const sev = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)]
    this.pulses.push({
      center,
      start: performance.now(),
      col: new THREE.Color(sev.color),
      str: sev.strength,
    })
  }

  /* ---------- Events ---------- */
  onMouseMove = (e: MouseEvent) => {
    this.mouse.x = (e.clientX / this.sizes.width) * 2 - 1
    this.mouse.y = -(e.clientY / this.sizes.height) * 2 + 1

    if (this.particles) this.sphere.rotation.copy(this.particles.rotation)

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hit = this.raycaster.intersectObject(this.sphere)[0]
    this.hitPoint.copy(hit ? hit.point : new THREE.Vector3(999, 999, 999))
  }

  onResize = () => {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.sizes.width, this.sizes.height)
  }

  /* ---------- Main loop ---------- */
  animate = () => {
    requestAnimationFrame(this.animate)
    if (!this.particles) return
    this.particles.rotation.y += 0.0008 // Reduced from 0.002 for slower, more fluid movement

    /* spawn bursts */
    const now = performance.now()
    if (now - this.lastPulse > PULSE_INTERVAL) {
      this.lastPulse = now
      for (let i = 0; i < PULSE_BATCH; i++) this.spawnPulse()
    }
    this.pulses = this.pulses.filter((p) => now - p.start < PULSE_LIFE)

    const pos = this.particles.geometry.getAttribute("position")
    const init = this.particles.geometry.getAttribute("initialPosition")
    const norm = this.particles.geometry.getAttribute("normalOut")
    const tang = this.particles.geometry.getAttribute("tangentOut")
    const colA = this.particles.geometry.getAttribute("color")

    const wMat = this.particles.matrixWorld
    const base = new THREE.Color(BASE_COLOR)
    const hover = new THREE.Color(HOVER_COLOR)

    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3
      /* attribute vectors */
      const p = new THREE.Vector3(pos.array[i3], pos.array[i3 + 1], pos.array[i3 + 2])
      const p0 = new THREE.Vector3(init.array[i3], init.array[i3 + 1], init.array[i3 + 2])
      const n = new THREE.Vector3(norm.array[i3], norm.array[i3 + 1], norm.array[i3 + 2])
      const t = new THREE.Vector3(tang.array[i3], tang.array[i3 + 1], tang.array[i3 + 2])

      const wP = p.clone().applyMatrix4(wMat)

      /* hover effect */
      const hDist = wP.distanceTo(this.hitPoint)
      const hAmt = Math.max(0, 1 - hDist / HOVER_RADIUS)
      const hTang = hAmt * HOVER_TANGENT_STR
      const hNorm = hAmt * HOVER_NORMAL_STR

      /* pulse influence (take strongest) */
      let pTang = 0,
        pNorm = 0
      let pColor: THREE.Color | null = null
      for (const pulse of this.pulses) {
        const age = now - pulse.start
        const fade = 1 - age / PULSE_LIFE
        const dist = wP.distanceTo(pulse.center)
        const local = Math.max(0, 1 - dist / PULSE_RADIUS)
        const amt = local * fade * fade * pulse.str
        if (amt > pNorm) {
          // use same strength for tang+norm
          pNorm = amt
          pTang = amt * 0.8 // lateral drift slightly weaker
          pColor = pulse.col
        }
      }

      /* composite displacement */
      const target = p0
        .clone()
        .addScaledVector(t, hTang + pTang)
        .addScaledVector(n, hNorm + pNorm)

      const lerpSpd = hAmt > 0 ? 0.18 : pNorm > 0.001 ? 0.15 : 0.05

      p.lerp(target, lerpSpd)

      pos.array[i3] = p.x
      pos.array[i3 + 1] = p.y
      pos.array[i3 + 2] = p.z

      /* color */
      let tgt = base
      if (hAmt > 0) tgt = hover
      else if (pColor) tgt = pColor

      colA.array[i3] += (tgt.r - colA.array[i3]) * 0.14
      colA.array[i3 + 1] += (tgt.g - colA.array[i3 + 1]) * 0.14
      colA.array[i3 + 2] += (tgt.b - colA.array[i3 + 2]) * 0.14
    }

    pos.needsUpdate = true
    colA.needsUpdate = true
    this.renderer.render(this.scene, this.camera)
  }

  // Clean up resources
  dispose() {
    window.removeEventListener("mousemove", this.onMouseMove)
    window.removeEventListener("resize", this.onResize)

    if (this.particles) {
      this.scene.remove(this.particles)
      this.particles.geometry.dispose()
      ;(this.particles.material as THREE.Material).dispose()
    }

    this.scene.remove(this.sphere)
    this.sphere.geometry.dispose()
    ;(this.sphere.material as THREE.Material).dispose()

    this.renderer.dispose()
  }
}

/* ---------- React wrapper ---------- */
export default function GlobeVisualization() {
  const ref = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ParticleGlobe | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // Assuming a breakpoint for mobile
    }
    updateIsMobile() // Set initial value
    window.addEventListener("resize", updateIsMobile)

    if (ref.current) {
      globeRef.current = new ParticleGlobe(ref.current, isMobile)
    }

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", updateIsMobile)
      if (globeRef.current) {
        globeRef.current.dispose()
        globeRef.current = null
      }
    }
  }, [isMobile])

  return <canvas ref={ref} className="w-full h-full block select-none" />
}
