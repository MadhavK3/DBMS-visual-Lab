import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'

export function PlayPauseButton() {
    const { isPlaying, play, pause, soundEnabled } = useSimulationStore()

    const handleClick = () => {
        if (soundEnabled) playSound('click')
        isPlaying ? pause() : play()
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isPlaying
                    ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/30 shadow-lg shadow-neon-orange/20'
                    : 'bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-lg shadow-neon-green/20'
                }`}
        >
            {isPlaying ? '⏸' : '▶️'}
        </motion.button>
    )
}

export function ResetButton({ onReset }) {
    const { reset, soundEnabled } = useSimulationStore()

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                if (soundEnabled) playSound('click')
                reset()
                onReset?.()
            }}
            className="w-12 h-12 rounded-xl bg-white/5 text-white/60 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 hover:text-white transition-all"
        >
            🔄
        </motion.button>
    )
}

export function StepButton({ onStep }) {
    const { soundEnabled } = useSimulationStore()

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                if (soundEnabled) playSound('step')
                onStep?.()
            }}
            className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center justify-center text-xl hover:bg-primary-500/30 transition-all"
        >
            ⏭
        </motion.button>
    )
}

export function SpeedSlider() {
    const { speed, setSpeed } = useSimulationStore()

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Speed</span>
            <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24 h-1.5 accent-primary-500 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary-500/50"
            />
            <span className="text-sm font-mono text-primary-300 min-w-[2.5rem]">{speed}x</span>
        </div>
    )
}

export function SoundToggle() {
    const { soundEnabled, toggleSound } = useSimulationStore()

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                toggleSound()
                if (!soundEnabled) playSound('click')
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${soundEnabled
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
        >
            {soundEnabled ? '🔊' : '🔇'}
        </motion.button>
    )
}

export default function SimulationControls({ onReset, onStep }) {
    return (
        <div className="flex flex-wrap items-center gap-3 p-4 glass-card rounded-xl">
            <PlayPauseButton />
            <StepButton onStep={onStep} />
            <ResetButton onReset={onReset} />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <SpeedSlider />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <SoundToggle />
        </div>
    )
}
