import { motion, AnimatePresence } from 'framer-motion'

export default function StepPanel({ steps, currentStep }) {
    return (
        <div className="glass-card p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Pipeline Steps
            </h3>
            <div className="space-y-2">
                {steps.map((step, i) => {
                    const status = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending'
                    return (
                        <motion.div
                            key={step.id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`step-indicator ${status === 'completed'
                                    ? 'step-completed'
                                    : status === 'active'
                                        ? 'step-active'
                                        : 'step-pending'
                                }`}
                        >
                            <span className="text-base">{step.icon || (status === 'completed' ? '✅' : status === 'active' ? '⏳' : '⬜')}</span>
                            <span className="text-sm font-medium">{step.name}</span>
                            {status === 'active' && (
                                <motion.div
                                    className="ml-auto w-2 h-2 rounded-full bg-primary-400"
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
