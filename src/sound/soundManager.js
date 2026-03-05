/**
 * Sound Manager — Web Audio API synthesized sounds
 * No external audio files needed. All sounds are generated programmatically.
 */

let audioCtx = null

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return audioCtx
}

// ─── Sound Definitions ────────────────────────────────────────────

function playClick() {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
}

function playSuccess() {
    const ctx = getCtx()
    const notes = [523, 659, 784]  // C5, E5, G5
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.3)
    })
}

function playProcessing() {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.15)
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
}

function playError() {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
}

function playLock() {
    const ctx = getCtx()
    // Metallic click + resonance
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(1200, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(2400, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.15)
}

function playStep() {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
}

function playComplete() {
    const ctx = getCtx()
    const melody = [523, 659, 784, 1047] // C5, E5, G5, C6
    melody.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.4)
    })
}

function playUnlock() {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(500, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
}

// ─── Intro Sounds ─────────────────────────────────────────────────

function playIntroWhoosh() {
    const ctx = getCtx()
    // White noise filtered sweep
    const bufferSize = ctx.sampleRate * 0.8
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(100, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.3)
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.6)
    filter.Q.value = 2

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)

    noise.connect(filter).connect(gain).connect(ctx.destination)
    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.8)
}

function playIntroReveal() {
    const ctx = getCtx()
    // Deep cinematic tone rising
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(80, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.6)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(120, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.6)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 1.2)
    osc2.stop(ctx.currentTime + 1.2)

    // Add subtle shimmer
    const shimmer = ctx.createOscillator()
    const sGain = ctx.createGain()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(1200, ctx.currentTime + 0.2)
    sGain.gain.setValueAtTime(0, ctx.currentTime)
    sGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3)
    sGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
    shimmer.connect(sGain).connect(ctx.destination)
    shimmer.start(ctx.currentTime + 0.2)
    shimmer.stop(ctx.currentTime + 1.0)
}

function playIntroShimmer() {
    const ctx = getCtx()
    // Gentle chime cascade
    const freqs = [880, 1108, 1318, 1568] // A5, C#6, E6, G6
    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.8)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.8)
    })
}

// ─── Sound Map ────────────────────────────────────────────────────

const soundMap = {
    click: playClick,
    success: playSuccess,
    processing: playProcessing,
    error: playError,
    lock: playLock,
    step: playStep,
    complete: playComplete,
    unlock: playUnlock,
    intro_whoosh: playIntroWhoosh,
    intro_reveal: playIntroReveal,
    intro_shimmer: playIntroShimmer,
}

export function playSound(name) {
    try {
        const fn = soundMap[name]
        if (fn) fn()
    } catch (e) {
        // Silently fail — browser may block audio before interaction
    }
}

export function stopSound() {
    // Web Audio API sounds are short and self-stopping
}
