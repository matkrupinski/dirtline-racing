export class RaceInput {
  private readonly keys = new Set<string>()

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  get throttle(): number {
    return this.isDown('KeyW') || this.isDown('ArrowUp') ? 1 : 0
  }

  get brake(): number {
    return this.isDown('KeyS') || this.isDown('ArrowDown') ? 1 : 0
  }

  get steer(): number {
    const left = this.isDown('KeyA') || this.isDown('ArrowLeft')
    const right = this.isDown('KeyD') || this.isDown('ArrowRight')
    return Number(right) - Number(left)
  }

  clear(): void {
    this.keys.clear()
  }

  isDown(code: string): boolean {
    return this.keys.has(code)
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault()
    }
    this.keys.add(event.code)
  }

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code)
  }
}
