import * as THREE from 'three'
import type { RaceInput } from './input'

const MPH_PER_WORLD_UNIT = 2.55

export class Vehicle {
  readonly root = new THREE.Group()
  readonly velocity = new THREE.Vector3()
  readonly position = new THREE.Vector3(0, 0.5, 86)

  heading = 0
  speedMph = 0
  gear = 1
  driftAmount = 0
  steering = 0

  private readonly forward = new THREE.Vector3()
  private readonly lateral = new THREE.Vector3()
  private readonly model = new THREE.Group()
  private readonly wheels: THREE.Group[] = []

  constructor() {
    this.root.position.copy(this.position)
    this.root.add(this.model)
    this.buildModel()
  }

  update(input: RaceInput, delta: number): void {
    const throttle = input.throttle
    const brake = input.brake
    const steerTarget = input.steer
    const forwardSpeed = this.velocity.dot(this.getForward(this.forward))
    const absSpeed = this.velocity.length()

    // Steering eases into place rather than snapping, which makes the car feel heavy.
    this.steering = THREE.MathUtils.damp(this.steering, steerTarget, 9, delta)

    if (throttle > 0) {
      this.velocity.addScaledVector(this.forward, 31 * throttle * delta)
    }

    // S / Down brakes at speed and becomes a gentle reverse input near rest.
    if (brake > 0) {
      if (forwardSpeed > 1) this.velocity.addScaledVector(this.forward, -38 * delta)
      else this.velocity.addScaledVector(this.forward, -14 * delta)
    }

    // Rolling drag is always present. Braking adds a little extra weight transfer feel.
    const drag = Math.exp(-(1.55 + brake * 1.7) * delta)
    this.velocity.multiplyScalar(drag)

    const forward = this.getForward(this.forward)
    const longitudinal = forward.clone().multiplyScalar(this.velocity.dot(forward))
    this.lateral.copy(this.velocity).sub(longitudinal)

    // At speed, steering reduces tire grip: lateral velocity survives as a controllable slide.
    const highSpeed = THREE.MathUtils.smoothstep(absSpeed, 7, 25)
    const steeringLoad = Math.min(Math.abs(this.steering), 1) * highSpeed
    const sideGrip = THREE.MathUtils.lerp(15, 4.25, steeringLoad)
    this.lateral.multiplyScalar(Math.exp(-sideGrip * delta))
    this.velocity.copy(longitudinal).add(this.lateral)

    const steerAuthority = THREE.MathUtils.clamp(absSpeed / 9, 0, 1)
    const yawRate = this.steering * (0.48 + steerAuthority * 1.42) * (1 + highSpeed * 0.25)
    this.heading += yawRate * delta

    // Hard speed cap keeps the controller stable while leaving room for future tuning.
    if (this.velocity.length() > 47) this.velocity.setLength(47)

    this.position.addScaledVector(this.velocity, delta)
    this.position.x = THREE.MathUtils.clamp(this.position.x, -6.6, 6.6)
    this.position.y = 0.5

    this.root.position.copy(this.position)
    this.root.rotation.y = this.heading
    this.updateVisuals(delta)

    this.speedMph = Math.max(0, this.velocity.dot(forward) * MPH_PER_WORLD_UNIT)
    this.gear = this.getGear(this.speedMph)
    this.driftAmount = THREE.MathUtils.clamp(this.lateral.length() / 8 + steeringLoad * 0.5, 0, 1)
  }

  getForward(target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(Math.sin(this.heading), 0, -Math.cos(this.heading)).normalize()
  }

  getRight(target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(Math.cos(this.heading), 0, Math.sin(this.heading)).normalize()
  }

  private getGear(speedMph: number): number {
    if (speedMph < 18) return 1
    if (speedMph < 36) return 2
    if (speedMph < 57) return 3
    if (speedMph < 78) return 4
    return 5
  }

  private updateVisuals(delta: number): void {
    this.model.rotation.z = THREE.MathUtils.damp(this.model.rotation.z, -this.steering * 0.06, 8, delta)
    this.model.rotation.x = THREE.MathUtils.damp(this.model.rotation.x, -this.driftAmount * 0.035, 8, delta)
    for (const wheel of this.wheels) {
      wheel.children[0].rotation.x -= this.velocity.length() * delta * 0.8
    }
  }

  private buildModel(): void {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#e9dbc3', roughness: 0.88, flatShading: true })
    const roofMaterial = new THREE.MeshStandardMaterial({ color: '#f6efe5', roughness: 0.8, flatShading: true })
    const accentMaterial = new THREE.MeshStandardMaterial({ color: '#b94b30', roughness: 0.75, flatShading: true })
    const glassMaterial = new THREE.MeshStandardMaterial({ color: '#344553', roughness: 0.45, metalness: 0.1, flatShading: true })
    const tireMaterial = new THREE.MeshStandardMaterial({ color: '#20252a', roughness: 1, flatShading: true })
    const hubMaterial = new THREE.MeshStandardMaterial({ color: '#d4c4a5', roughness: 0.65, flatShading: true })

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.48, 3.7), bodyMaterial)
    body.position.y = 0.37
    body.castShadow = true
    this.model.add(body)

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.18, 0.92), roofMaterial)
    hood.position.set(0, 0.68, -1.07)
    hood.castShadow = true
    this.model.add(hood)

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.57, 1.45), roofMaterial)
    cabin.position.set(0, 0.79, 0.22)
    cabin.rotation.x = -0.05
    cabin.castShadow = true
    this.model.add(cabin)

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.38, 0.06), glassMaterial)
    windshield.position.set(0, 0.83, -0.505)
    windshield.rotation.x = -0.18
    this.model.add(windshield)

    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.34, 0.06), glassMaterial)
    rearGlass.position.set(0, 0.82, 0.93)
    rearGlass.rotation.x = 0.18
    this.model.add(rearGlass)

    const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.13, 0.12), accentMaterial)
    frontStrip.position.set(0, 0.22, -1.88)
    this.model.add(frontStrip)

    const rearStrip = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.12), accentMaterial)
    rearStrip.position.set(0, 0.47, 1.88)
    this.model.add(rearStrip)

    for (const x of [-1.03, 1.03]) {
      for (const z of [-1.12, 1.15]) {
        const wheel = new THREE.Group()
        wheel.position.set(x, 0.22, z)
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 10), tireMaterial)
        tire.rotation.z = Math.PI / 2
        tire.castShadow = true
        wheel.add(tire)
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 8), hubMaterial)
        hub.rotation.z = Math.PI / 2
        wheel.add(hub)
        this.model.add(wheel)
        this.wheels.push(wheel)
      }
    }
  }
}
