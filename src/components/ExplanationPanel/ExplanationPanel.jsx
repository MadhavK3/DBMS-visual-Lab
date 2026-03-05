import { motion, AnimatePresence } from 'framer-motion'

export default function ExplanationPanel({ step, stepIndex }) {
    return (
        <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Explanation
            </h3>
            <AnimatePresence mode="wait">
                {step ? (
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">{step.icon}</span>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">
                                    Step {stepIndex + 1}: {step.name}
                                </h4>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/30 text-sm italic"
                    >
                        Run a simulation to see the explanation...
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
