import type { Vehicle } from './vehicle'

export class RacingHud {
  private readonly speed: HTMLElement
  private readonly gear: HTMLElement
  private readonly dots: HTMLElement[]
  private readonly drift: HTMLElement

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <header class="topbar">
        <div class="brand-lockup">
          <span class="brand-mark">D</span>
          <span><b>DIRTLINE</b><small>SPRINT COURSE 01</small></span>
        </div>
        <div class="run-tag"><span class="status-dot"></span> SINGLE DRIVER</div>
      </header>
      <div class="track-label"><span class="track-label__line"></span> WARM-UP LAP <span class="track-label__line"></span></div>
      <section class="hud-bottom" aria-label="Driving telemetry">
        <div class="control-hint"><span class="keys">WASD</span><span>STEER / THROTTLE</span></div>
        <div class="telemetry">
          <div class="speed-readout"><strong data-speed>00</strong><span>mph</span></div>
          <div class="telemetry-divider"></div>
          <div class="gear-readout"><span class="gear-number" data-gear>1</span><div class="gear-dots" data-dots></div></div>
        </div>
        <div class="drift-readout" data-drift>GRIP 100%</div>
      </section>
    `

    this.speed = root.querySelector<HTMLElement>('[data-speed]')!
    this.gear = root.querySelector<HTMLElement>('[data-gear]')!
    this.drift = root.querySelector<HTMLElement>('[data-drift]')!
    const dotRoot = root.querySelector<HTMLElement>('[data-dots]')!
    this.dots = Array.from({ length: 7 }, (_, index) => {
      const dot = document.createElement('i')
      dot.setAttribute('aria-label', `gear ${index + 1}`)
      dotRoot.append(dot)
      return dot
    })
  }

  update(vehicle: Vehicle): void {
    this.speed.textContent = String(Math.round(vehicle.speedMph)).padStart(2, '0')
    this.gear.textContent = String(vehicle.gear)
    this.dots.forEach((dot, index) => dot.classList.toggle('is-active', index < vehicle.gear + 1))
    const grip = Math.round((1 - vehicle.driftAmount * 0.72) * 100)
    this.drift.textContent = vehicle.driftAmount > 0.25 ? `SLIDE ${100 - grip}%` : `GRIP ${grip}%`
    this.drift.classList.toggle('is-sliding', vehicle.driftAmount > 0.25)
  }
}
