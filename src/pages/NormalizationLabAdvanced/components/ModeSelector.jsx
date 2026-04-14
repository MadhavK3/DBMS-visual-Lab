import { motion } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'

const modes = [
  { id: 'learn', label: 'Learn Mode', icon: '📖', description: 'Step-by-step guided explanation', color: 'from-blue-500 to-cyan-400' },
  { id: 'practice', label: 'Practice Mode', icon: '✏️', description: 'Normalize tables yourself', color: 'from-green-500 to-emerald-400' },
  { id: 'quiz', label: 'Quiz Mode', icon: '🧪', description: 'Test your knowledge', color: 'from-purple-500 to-violet-400' },
]

export default function ModeSelector() {
  const { mode, setMode } = useNormalizationStore()
  const { soundEnabled } = useSimulationStore()

  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <motion.button
          key={m.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setMode(m.id)
            if (soundEnabled) playSound('click')
          }}
          className={`flex-1 relative px-4 py-3 rounded-xl border transition-all duration-300 text-left ${
            mode === m.id
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5 hover:text-white/60'
          }`}
        >
          {mode === m.id && (
            <motion.div
              layoutId="mode-glow"
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${m.color} opacity-10`}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-lg">{m.icon}</span>
            <span>
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="block text-[10px] text-white/30">{m.description}</span>
            </span>
          </span>
        </motion.button>
      ))}
    </div>
  )
}
