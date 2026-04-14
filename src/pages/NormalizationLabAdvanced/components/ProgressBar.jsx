import { motion } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'

const steps = [
  { id: 'unf', label: 'UNF', icon: '📋', description: 'Unnormalized' },
  { id: '1nf', label: '1NF', icon: '1️⃣', description: 'Atomic Values' },
  { id: '2nf', label: '2NF', icon: '2️⃣', description: 'No Partial Deps' },
  { id: '3nf', label: '3NF', icon: '3️⃣', description: 'No Transitive Deps' },
]

export default function ProgressBar() {
  const { currentStep, goToStep, isAnimating } = useNormalizationStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-2xl"
    >
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 mx-16" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-neon-purple -translate-y-1/2 mx-16 transition-all duration-700"
          style={{ width: `${Math.max(0, (currentStep / 3) * (100 - 20))}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index
          const isCurrent = currentStep === index
          const isPending = currentStep < index

          return (
            <motion.button
              key={step.id}
              onClick={() => !isAnimating && currentStep >= index && goToStep(index)}
              disabled={isAnimating || currentStep < index}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
              whileHover={!isAnimating && currentStep >= index ? { scale: 1.05 } : {}}
              whileTap={!isAnimating && currentStep >= index ? { scale: 0.95 } : {}}
            >
              <motion.div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-neon-green/20 border-neon-green/50 text-neon-green shadow-lg shadow-neon-green/20'
                    : isCurrent
                    ? 'bg-primary-500/20 border-primary-500/60 text-primary-300 shadow-lg shadow-primary-500/30'
                    : 'bg-white/5 border-white/10 text-white/30'
                }`}
                animate={isCurrent ? {
                  boxShadow: [
                    '0 0 0 0 rgba(99,102,241,0)',
                    '0 0 20px 4px rgba(99,102,241,0.3)',
                    '0 0 0 0 rgba(99,102,241,0)',
                  ],
                } : {}}
                transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
              >
                {isCompleted ? '✓' : step.icon}
              </motion.div>
              <div className="text-center">
                <span className={`block text-xs font-bold ${
                  isCompleted ? 'text-neon-green' : isCurrent ? 'text-primary-300' : 'text-white/30'
                }`}>
                  {step.label}
                </span>
                <span className={`block text-[10px] ${
                  isCurrent ? 'text-white/50' : 'text-white/20'
                }`}>
                  {step.description}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
