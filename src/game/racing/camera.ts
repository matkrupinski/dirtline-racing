import * as THREE from 'three'
import type { Vehicle } from './vehicle'

export class ChaseCamera {
  private readonly lookAt = new THREE.Vector3()
  private readonly desiredPosition = new THREE.Vector3()
  private readonly up = new THREE.Vector3(0, 1, 0)

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  snapTo(vehicle: Vehicle): void {
    const forward = vehicle.getForward()
    this.camera.position.copy(vehicle.position).addScaledVector(forward, -11).add(new THREE.Vector3(0, 7.8, 0))
    this.lookAt.copy(vehicle.position).addScaledVector(forward, 13).add(new THREE.Vector3(0, 0.2, 0))
    this.camera.lookAt(this.lookAt)
  }

  update(vehicle: Vehicle, delta: number): void {
    const forward = vehicle.getForward()
    this.desiredPosition.copy(vehicle.position).addScaledVector(forward, -11.5).add(new THREE.Vector3(0, 7.6, 0))

    const followEase = 1 - Math.exp(-5.5 * delta)
    this.camera.position.lerp(this.desiredPosition, followEase)
    this.lookAt.copy(vehicle.position).addScaledVector(forward, 13).add(new THREE.Vector3(0, 0.3, 0))
    this.camera.lookAt(this.lookAt)
    this.camera.up.lerp(this.up, 1 - Math.exp(-7 * delta))
  }
}
