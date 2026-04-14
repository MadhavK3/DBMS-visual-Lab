import { motion, AnimatePresence } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'
import VisualTable from './VisualTable'
import DependencyArrows from './DependencyArrows'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'
import { useCallback, useEffect, useRef } from 'react'

/**
 * NormalizationStepView — Shows the current normalization step
 * with before/after tables and animated transitions.
 */
export default function NormalizationStepView() {
  const {
    currentStep,
    normalizationResult,
    currentDataset,
    teacherMode,
    isAnimating,
    setAnimating,
    nextStep,
    goToStep,
    resetSteps,
  } = useNormalizationStore()

  const { soundEnabled, speed } = useSimulationStore()
  const autoPlayRef = useRef(null)

  const currentStepData = normalizationResult?.steps?.[currentStep]

  // Auto-advance in learn mode (non-teacher)
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)

    setAnimating(true)
    goToStep(0)
    if (soundEnabled) playSound('processing')

    let step = 0
    const interval = teacherMode ? 5000 : 2500
    autoPlayRef.current = setInterval(() => {
      step++
      if (step <= 3) {
        goToStep(step)
        if (soundEnabled) playSound('step')
      } else {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
        setAnimating(false)
        if (soundEnabled) playSound('success')
      }
    }, interval / speed)
  }, [teacherMode, soundEnabled, speed, goToStep, setAnimating])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [])

  const handleStartNormalization = () => {
    resetSteps()
    setTimeout(() => startAutoPlay(), 100)
  }

  const handleStepClick = (stepIdx) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
      setAnimating(false)
    }
    goToStep(stepIdx)
    if (soundEnabled) playSound('step')
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStartNormalization}
          disabled={isAnimating}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          {isAnimating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.span>
              Normalizing...
            </>
          ) : (
            <>▶ Start Normalization</>
          )}
        </motion.button>

        {currentStep >= 0 && !isAnimating && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleStepClick(Math.max(0, currentStep - 1))}
              disabled={currentStep <= 0}
              className="btn-secondary text-sm disabled:opacity-30"
            >
              ← Previous
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleStepClick(Math.min(3, currentStep + 1))}
              disabled={currentStep >= 3}
              className="btn-secondary text-sm disabled:opacity-30"
            >
              Next →
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { resetSteps(); if (soundEnabled) playSound('click') }}
              className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2"
            >
              ↺ Reset
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Original table (always shown) */}
      {currentStep < 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Original Table: {currentDataset.tableName}
          </h3>
          <VisualTable
            table={{
              name: currentDataset.tableName,
              columns: currentDataset.columns,
              rows: currentDataset.rows,
              primaryKey: currentDataset.primaryKey,
            }}
            primaryKey={currentDataset.primaryKey}
            fds={currentDataset.functionalDependencies}
            showDepColors={true}
          />

          {/* Dependency diagram */}
          <div className="mt-4">
            <DependencyArrows
              fds={currentDataset.functionalDependencies}
              primaryKey={currentDataset.primaryKey}
              columns={currentDataset.columns}
            />
          </div>
        </motion.div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Step header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-lg"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(99,102,241,0)',
                    '0 0 15px 3px rgba(99,102,241,0.3)',
                    '0 0 0 0 rgba(99,102,241,0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {['📋', '1️⃣', '2️⃣', '3️⃣'][currentStep]}
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {currentStepData.explanation.title}
                </h3>
                <p className="text-xs text-white/40">
                  Step {currentStep + 1} of 4
                </p>
              </div>
            </div>

            {/* UNF step — show original table with flashing duplicates */}
            {currentStep === 0 && currentStepData.table && (
              <div className="space-y-4">
                <VisualTable
                  table={currentStepData.table}
                  primaryKey={currentDataset.primaryKey}
                  fds={currentDataset.functionalDependencies}
                  highlightedRows={currentStepData.duplicateRowIndices || []}
                  flashDuplicates={true}
                  showDepColors={true}
                />
                {/* Issues */}
                {currentStepData.issues && (
                  <div className="glass-card p-4 rounded-xl">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                      ⚠️ Issues Detected
                    </h4>
                    {currentStepData.issues.map((issue, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="text-xs text-red-300/60 flex items-center gap-2 mt-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {issue}
                      </motion.p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 1NF, 2NF, 3NF — show decomposed tables */}
            {currentStep >= 1 && currentStepData.tables && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStepData.tables.map((table, idx) => (
                    <VisualTable
                      key={`${table.name}-${idx}`}
                      table={table}
                      index={idx}
                      primaryKey={table.primaryKey}
                      showDepColors={currentStep < 3}
                      fds={currentDataset.functionalDependencies}
                    />
                  ))}
                </div>

                {/* Show what was decomposed */}
                {currentStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-4 rounded-xl"
                  >
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>✅</span>
                      {currentStep === 2 ? 'Partial Dependencies Removed' : 'Transitive Dependencies Removed'}
                    </h4>
                    {(currentStep === 2 ? currentStepData.partialDeps : currentStepData.transitiveDeps)?.map((dep, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-xs font-mono text-white/50 mt-1 flex items-center gap-2"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${currentStep === 2 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                        {dep.from.join(', ')} → {dep.to.join(', ')}
                        <span className="text-white/20">
                          (moved to new table)
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
            {/* Explicit Reason & Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 border-l-2 border-primary-500 bg-primary-500/10 rounded-r-xl"
            >
              <p className="text-sm text-white/90 font-medium leading-relaxed">
                <span className="mr-2">💡</span>
                {currentStepData.explanation.description}
              </p>
              {currentStepData.explanation.details && currentStepData.explanation.details.length > 0 && (
                <ul className="mt-3 space-y-1.5 ml-6">
                  {currentStepData.explanation.details.map((detail, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 mt-1 rounded-full bg-primary-500/50 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
