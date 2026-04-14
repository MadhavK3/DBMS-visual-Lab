import { motion } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'

export default function TeacherModeToggle() {
  const { teacherMode, toggleTeacherMode } = useNormalizationStore()
  const { soundEnabled } = useSimulationStore()

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        toggleTeacherMode()
        if (soundEnabled) playSound('click')
      }}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
        teacherMode
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
      }`}
    >
      <span className="text-lg">{teacherMode ? '👨‍🏫' : '👤'}</span>
      <span className="text-sm font-semibold">
        {teacherMode ? 'Teacher Mode ON' : 'Teacher Mode'}
      </span>
      {/* Toggle switch */}
      <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
        teacherMode ? 'bg-amber-500/30' : 'bg-white/10'
      }`}>
        <motion.div
          className={`absolute top-0.5 w-4 h-4 rounded-full ${
            teacherMode ? 'bg-amber-400' : 'bg-white/30'
          }`}
          animate={{ left: teacherMode ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </div>
    </motion.button>
  )
}
