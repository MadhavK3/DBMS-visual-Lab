import { motion, AnimatePresence } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'

/**
 * ExplanationSidebar — Dynamic context-aware explanation panel
 * Shows detailed, step-by-step explanations with teacher mode narration.
 */
export default function ExplanationSidebar() {
  const {
    currentStep,
    normalizationResult,
    teacherMode,
    currentDataset,
    dependencies,
  } = useNormalizationStore()

  const step = normalizationResult?.steps?.[currentStep]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Current Step Explanation */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>💡</span> Explanation
        </h3>
        <AnimatePresence mode="wait">
          {step ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl mt-0.5">
                  {['📋', '1️⃣', '2️⃣', '3️⃣'][currentStep]}
                </span>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {step.explanation.title}
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {step.explanation.description}
                  </p>
                </div>
              </div>

              {/* Details list */}
              <div className="space-y-2 mt-4">
                {step.explanation.details.map((detail, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-xs text-white/50"
                  >
                    <span className="text-primary-400 mt-0.5">›</span>
                    <span>{detail}</span>
                  </motion.div>
                ))}
              </div>

              {/* Teacher narration box */}
              {teacherMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">👨‍🏫</span>
                    <span className="text-xs font-semibold text-amber-300">Teacher Note</span>
                  </div>
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    {getTeacherNarration(currentStep, currentDataset)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-white/30 text-sm italic">
                Click "Start Normalization" to begin the step-by-step process...
              </p>
              <div className="mt-3 space-y-2">
                <div className="text-xs text-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Blue = Primary Key columns
                </div>
                <div className="text-xs text-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Yellow = Partial Dependency
                </div>
                <div className="text-xs text-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Red = Transitive Dependency
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Functional Dependencies Panel */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>📏</span> Functional Dependencies
        </h3>
        <div className="space-y-2">
          {currentDataset?.functionalDependencies?.map((fd, i) => {
            const pkSet = new Set(currentDataset.primaryKey)
            const isPartial = fd.from.length < currentDataset.primaryKey.length &&
              fd.from.every(a => pkSet.has(a)) &&
              fd.to.some(a => !pkSet.has(a))
            const isTransitive = fd.from.every(a => !pkSet.has(a)) &&
              fd.to.every(a => !pkSet.has(a))

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`text-xs font-mono px-3 py-2 rounded-lg border flex items-center justify-between ${
                  isPartial
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                    : isTransitive
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <span>{fd.from.join(', ')} → {fd.to.join(', ')}</span>
                {isPartial && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 ml-2">
                    PARTIAL
                  </span>
                )}
                {isTransitive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 ml-2">
                    TRANSITIVE
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Key Info */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>🔑</span> Key Information
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-white/50">
            <span>Primary Key</span>
            <span className="font-mono text-blue-400">
              ({currentDataset?.primaryKey?.join(', ')})
            </span>
          </div>
          <div className="flex items-center justify-between text-white/50">
            <span>Key Type</span>
            <span className="font-mono text-white/70">
              {currentDataset?.primaryKey?.length > 1 ? 'Composite' : 'Simple'}
            </span>
          </div>
          <div className="flex items-center justify-between text-white/50">
            <span>Total Columns</span>
            <span className="font-mono text-white/70">
              {currentDataset?.columns?.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-white/50">
            <span>Total Rows</span>
            <span className="font-mono text-white/70">
              {currentDataset?.rows?.length}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function getTeacherNarration(step, dataset) {
  const pk = dataset?.primaryKey?.join(', ')
  const narrations = [
    `Let's start by examining the "${dataset?.tableName}" table. Notice how data is repeated across rows — for example, the same ${dataset?.primaryKey?.[0]} appears in multiple rows. This is the unnormalized form. In a classroom setting, ask students to identify which values are being repeated and why this causes problems like update anomalies.`,
    `First Normal Form requires all values to be atomic — no multi-valued attributes or repeating groups. Our table already has atomic values, so it satisfies 1NF. The primary key (${pk}) uniquely identifies each row. Ask students: "Can you identify the candidate key?"`,
    `Now we look for partial dependencies. Remember: a partial dependency exists when a non-key attribute depends on PART of a composite key. Look at the functional dependencies — which attributes depend on only one part of (${pk})? These must be extracted into separate tables.`,
    `Finally, we check for transitive dependencies: A → B → C, where B is not a key. Non-key attributes shouldn't determine other non-key attributes. By extracting these, we achieve 3NF. Ask students: "Why is this important for data integrity?"`,
  ]
  return narrations[step] || 'Observe the current step carefully.'
}
