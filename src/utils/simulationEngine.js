/**
 * Simulation Engine - reusable step-based simulation controller
 * Uses requestAnimationFrame for smooth animations.
 */
export class SimulationEngine {
    constructor({ steps = [], onStep, onComplete, speed = 1 }) {
        this.steps = steps
        this.onStep = onStep
        this.onComplete = onComplete
        this.speed = speed
        this.currentStep = 0
        this.isRunning = false
        this.isPaused = false
        this.lastTime = 0
        this.elapsed = 0
        this.stepDuration = 1000 // ms per step at speed 1
        this._rafId = null
    }

    setSpeed(speed) {
        this.speed = speed
    }

    setSteps(steps) {
        this.steps = steps
        this.currentStep = 0
    }

    start() {
        if (this.steps.length === 0) return
        this.isRunning = true
        this.isPaused = false
        this.lastTime = performance.now()
        this.elapsed = 0
        this._loop(this.lastTime)
    }

    pause() {
        this.isPaused = true
        if (this._rafId) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
    }

    resume() {
        if (!this.isRunning) return
        this.isPaused = false
        this.lastTime = performance.now()
        this._loop(this.lastTime)
    }

    reset() {
        this.isRunning = false
        this.isPaused = false
        this.currentStep = 0
        this.elapsed = 0
        if (this._rafId) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
    }

    stepForward() {
        if (this.currentStep < this.steps.length) {
            this.onStep?.(this.steps[this.currentStep], this.currentStep)
            this.currentStep++
            if (this.currentStep >= this.steps.length) {
                this.isRunning = false
                this.onComplete?.()
            }
        }
    }

    _loop(now) {
        if (!this.isRunning || this.isPaused) return

        const delta = now - this.lastTime
        this.lastTime = now
        this.elapsed += delta * this.speed

        if (this.elapsed >= this.stepDuration) {
            this.elapsed = 0
            this.stepForward()
        }

        if (this.isRunning && !this.isPaused) {
            this._rafId = requestAnimationFrame((t) => this._loop(t))
        }
    }

    destroy() {
        this.reset()
    }
}
