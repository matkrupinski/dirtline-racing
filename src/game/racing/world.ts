import * as THREE from 'three'
import type { Vehicle } from './vehicle'

const TRACK_LENGTH = 520
const SIDE_Z = [-238, -198, -160, -118, -72, -28, 18, 64, 112, 158, 204, 246]

export class RaceWorld {
  private readonly props = new THREE.Group()
  private readonly dust = new THREE.Group()

  constructor(private readonly scene: THREE.Scene) {
    this.buildLighting()
    this.buildGround()
    this.buildTrack()
    this.buildRoadsideProps()
    scene.add(this.props, this.dust)
  }

  update(elapsed: number, vehicle: Vehicle): void {
    // Small, deterministic dust puffs keep the road alive without a particle system dependency.
    this.dust.visible = vehicle.driftAmount > 0.22 && vehicle.velocity.length() > 8
    this.dust.position.copy(vehicle.position)
    this.dust.position.y = 0.2
    this.dust.rotation.y = elapsed * 0.3
  }

  private buildLighting(): void {
    const hemi = new THREE.HemisphereLight('#ffe3b1', '#263f38', 2.1)
    this.scene.add(hemi)

    const sun = new THREE.DirectionalLight('#ffd19b', 3.8)
    sun.position.set(-40, 75, 70)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -60
    sun.shadow.camera.right = 60
    sun.shadow.camera.top = 100
    sun.shadow.camera.bottom = -100
    sun.shadow.camera.near = 10
    sun.shadow.camera.far = 260
    this.scene.add(sun)

    const rim = new THREE.DirectionalLight('#9ca5bc', 0.55)
    rim.position.set(55, 24, -80)
    this.scene.add(rim)
  }

  private buildGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(190, TRACK_LENGTH, 1, 12),
      new THREE.MeshStandardMaterial({ color: '#4d6240', roughness: 1, flatShading: true }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.z = 0
    ground.receiveShadow = true
    this.scene.add(ground)

    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 160),
      new THREE.MeshBasicMaterial({ color: '#d8a36c' }),
    )
    horizon.rotation.x = -Math.PI / 2
    horizon.position.set(0, -0.06, -300)
    this.scene.add(horizon)

    for (let index = 0; index < 34; index += 1) {
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(THREE.MathUtils.randFloat(0.55, 2.2), 6),
        new THREE.MeshStandardMaterial({ color: index % 2 ? '#596f44' : '#3f5639', roughness: 1, flatShading: true }),
      )
      patch.rotation.x = -Math.PI / 2
      patch.position.set(THREE.MathUtils.randFloatSpread(78), 0.015, THREE.MathUtils.randFloat(-250, 250))
      patch.scale.y = THREE.MathUtils.randFloat(0.35, 0.9)
      this.scene.add(patch)
    }
  }

  private buildTrack(): void {
    const track = new THREE.Mesh(
      new THREE.PlaneGeometry(17.5, TRACK_LENGTH, 2, 18),
      new THREE.MeshStandardMaterial({ color: '#a26c3a', roughness: 1, flatShading: true }),
    )
    track.rotation.x = -Math.PI / 2
    track.position.y = 0.04
    track.receiveShadow = true
    this.scene.add(track)

    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: '#c48b51', roughness: 1, flatShading: true })
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, TRACK_LENGTH), shoulderMaterial)
      shoulder.position.set(side * 9.1, 0.065, 0)
      shoulder.receiveShadow = true
      this.scene.add(shoulder)
    }

    const rutMaterial = new THREE.MeshStandardMaterial({ color: '#7f522f', roughness: 1, flatShading: true })
    for (let z = -250; z < 260; z += 14) {
      for (const x of [-3.6, 3.6]) {
        const rut = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 5.2), rutMaterial)
        rut.position.set(x, 0.12, z)
        rut.rotation.y = (z % 28 === 0 ? 0.035 : -0.02)
        this.scene.add(rut)
      }
    }

    const startStripe = new THREE.Mesh(
      new THREE.BoxGeometry(17.3, 0.035, 0.65),
      new THREE.MeshStandardMaterial({ color: '#e8ceb0', roughness: 0.95, flatShading: true }),
    )
    startStripe.position.set(0, 0.13, 70)
    this.scene.add(startStripe)
  }

  private buildRoadsideProps(): void {
    for (let index = 0; index < SIDE_Z.length; index += 1) {
      const z = SIDE_Z[index]
      const side = index % 2 === 0 ? -1 : 1
      const offset = 15 + (index % 3) * 2
      if (index % 3 === 0) this.addStall(side * offset, z, index)
      else if (index % 3 === 1) this.addTent(side * offset, z, index)
      else this.addBanner(side * offset, z, index)

      this.addShrub(-side * (17 + (index % 4) * 2), z - 12, index)
    }

    this.addBanner(-14, -10, 20)
    this.addBanner(14, -10, 21)
  }

  private addStall(x: number, z: number, seed: number): void {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.rotation.y = seed % 2 ? -0.14 : 0.14

    const wood = new THREE.MeshStandardMaterial({ color: '#49382c', roughness: 1, flatShading: true })
    const canvas = new THREE.MeshStandardMaterial({ color: seed % 2 ? '#d77c4f' : '#6e8e9d', roughness: 0.92, flatShading: true })
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.55, 2.2), wood)
    counter.position.y = 0.82
    counter.castShadow = true
    group.add(counter)

    const awning = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 2.7), canvas)
    awning.position.y = 2.25
    awning.rotation.z = seed % 2 ? -0.02 : 0.02
    awning.castShadow = true
    group.add(awning)

    for (const px of [-2.55, 2.55]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6), wood)
      pole.position.set(px, 1.2, 0)
      pole.castShadow = true
      group.add(pole)
    }

    this.props.add(group)
  }

  private addTent(x: number, z: number, seed: number): void {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.rotation.y = seed * 0.15

    const fabric = new THREE.MeshStandardMaterial({ color: seed % 2 ? '#385364' : '#c6774e', roughness: 1, flatShading: true })
    const tent = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3.25, 4), fabric)
    tent.rotation.y = Math.PI / 4
    tent.position.y = 1.62
    tent.scale.set(1.25, 1, 0.88)
    tent.castShadow = true
    group.add(tent)

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.8, 1.15),
      new THREE.MeshStandardMaterial({ color: '#634838', roughness: 1, flatShading: true }),
    )
    table.position.set(0, 0.42, 2.25)
    table.castShadow = true
    group.add(table)
    this.props.add(group)
  }

  private addBanner(x: number, z: number, seed: number): void {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    const poleMaterial = new THREE.MeshStandardMaterial({ color: '#ece0c0', roughness: 0.8, flatShading: true })
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.2, 6), poleMaterial)
    pole.position.y = 3.1
    pole.castShadow = true
    group.add(pole)

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 2.2),
      new THREE.MeshStandardMaterial({ color: seed % 2 ? '#f1d2a0' : '#e26e4e', side: THREE.DoubleSide, flatShading: true }),
    )
    flag.position.set(0.7, 4.55, 0)
    flag.rotation.y = Math.PI / 2
    group.add(flag)
    this.props.add(group)
  }

  private addShrub(x: number, z: number, seed: number): void {
    const bush = new THREE.Mesh(
      new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.65, 1.25), 0),
      new THREE.MeshStandardMaterial({ color: seed % 2 ? '#2f4939' : '#3d5940', roughness: 1, flatShading: true }),
    )
    bush.position.set(x, 0.75, z)
    bush.scale.y = THREE.MathUtils.randFloat(0.7, 1.25)
    bush.castShadow = true
    this.props.add(bush)
  }
}
