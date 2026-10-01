import * as THREE from 'three'
import './styles/main.css'
import { ChaseCamera } from './game/racing/camera'
import { RaceInput } from './game/racing/input'
import { RaceWorld } from './game/racing/world'
import { Vehicle } from './game/racing/vehicle'
import { RacingHud } from './game/racing/hud'

const canvas = document.querySelector<HTMLCanvasElement>('#game')
const hudRoot = document.querySelector<HTMLElement>('#ui')

if (!canvas || !hudRoot) {
  throw new Error('Dirtline could not find its game canvas or HUD root.')
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.12

const scene = new THREE.Scene()
scene.background = new THREE.Color('#d8a36c')
scene.fog = new THREE.Fog('#d8a36c', 105, 360)

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 500)
const input = new RaceInput()
const world = new RaceWorld(scene)
const vehicle = new Vehicle()
const chaseCamera = new ChaseCamera(camera)
const hud = new RacingHud(hudRoot)

scene.add(vehicle.root)

function resize(): void {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resize)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) input.clear()
})

const clock = new THREE.Clock()
let elapsed = 0

function frame(): void {
  const delta = Math.min(clock.getDelta(), 0.05)
  elapsed += delta

  vehicle.update(input, delta)
  world.update(elapsed, vehicle)
  chaseCamera.update(vehicle, delta)
  hud.update(vehicle)

  renderer.render(scene, camera)
  requestAnimationFrame(frame)
}

;(window as unknown as { __dirtline?: unknown }).__dirtline = {
  vehicle,
  world,
  input,
  renderer,
}

resize()
chaseCamera.snapTo(vehicle)
frame()
