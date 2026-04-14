import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNormalizationStore } from './store/useNormalizationStore'
import { useSimulationStore } from '../../store/useSimulationStore'
import DatasetSelector from './components/DatasetSelector'
import ProgressBar from './components/ProgressBar'
import ModeSelector from './components/ModeSelector'
import TeacherModeToggle from './components/TeacherModeToggle'
import NormalizationStepView from './components/NormalizationStepView'
import ExplanationSidebar from './components/ExplanationSidebar'
import PracticeMode from './components/PracticeMode'
import QuizMode from './components/QuizMode'
import FinalSchema from './components/FinalSchema'

export default function NormalizationLabAdvanced() {
  const { mode, currentStep, normalizationResult, initialize, teacherMode } = useNormalizationStore()
  const { addPoints, completeModule } = useSimulationStore()

  // Initialize normalization data on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Award points when completing 3NF in learn mode
  useEffect(() => {
    if (currentStep === 3 && mode === 'learn') {
      addPoints(25)
      completeModule('normalization-advanced')
    }
  }, [currentStep, mode, addPoints, completeModule])

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Background accent */}
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 -right-20 w-80 h-80 rounded-full bg-blue-500/8 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30"
                animate={{ boxShadow: ['0 10px 30px rgba(168,85,247,0.3)', '0 10px 50px rgba(168,85,247,0.5)', '0 10px 30px rgba(168,85,247,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🧬
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Normalization Lab
                  <span className="text-sm font-medium text-primary-400 ml-2">Advanced</span>
                </h1>
                <p className="text-white/40 text-sm">
                  Master database normalization through interactive visual transformations
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TeacherModeToggle />
            {/* Sound toggle indicator */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white/40">
                {teacherMode ? '0.5×' : '1×'} Speed
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dataset Selector */}
      <DatasetSelector />

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ModeSelector />
      </motion.div>

      {/* Progress Bar (Learn mode only) */}
      {mode === 'learn' && currentStep >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressBar />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area — 2 columns */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {mode === 'learn' && (
            <>
              <NormalizationStepView />
              {currentStep === 3 && normalizationResult && (
                <FinalSchema />
              )}
            </>
          )}

          {mode === 'practice' && <PracticeMode />}
          {mode === 'quiz' && <QuizMode />}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <ExplanationSidebar />
        </div>
      </div>

      {/* Tooltip definitions */}
      <TermTooltips />
    </div>
  )
}

/**
 * Floating tooltips overlay for DBMS terms
 */
function TermTooltips() {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="group"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 transition-shadow"
          title="Quick Reference"
        >
          ?
        </motion.button>

        {/* Tooltip popup on hover */}
        <div className="hidden group-hover:block absolute bottom-12 right-0 w-72 glass-card p-4 rounded-xl text-xs space-y-2 border border-white/20 shadow-xl">
          <h4 className="font-semibold text-white text-sm mb-2">📖 Quick Reference</h4>

          <div className="space-y-1.5">
            <div>
              <span className="text-blue-400 font-semibold">Primary Key (PK):</span>
              <span className="text-white/50 ml-1">Uniquely identifies each row</span>
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">Partial Dependency:</span>
              <span className="text-white/50 ml-1">Non-key depends on part of composite PK</span>
            </div>
            <div>
              <span className="text-red-400 font-semibold">Transitive Dependency:</span>
              <span className="text-white/50 ml-1">Non-key → Non-key chain</span>
            </div>
            <div>
              <span className="text-green-400 font-semibold">1NF:</span>
              <span className="text-white/50 ml-1">Atomic values, no repeating groups</span>
            </div>
            <div>
              <span className="text-green-400 font-semibold">2NF:</span>
              <span className="text-white/50 ml-1">1NF + no partial dependencies</span>
            </div>
            <div>
              <span className="text-green-400 font-semibold">3NF:</span>
              <span className="text-white/50 ml-1">2NF + no transitive dependencies</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
