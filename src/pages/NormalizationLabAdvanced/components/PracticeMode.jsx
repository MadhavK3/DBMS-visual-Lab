import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useNormalizationStore } from '../store/useNormalizationStore'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'
import { findPartialDependencies, findTransitiveDependencies } from '../engine/dependencyDetector'
import VisualTable from './VisualTable'

const practiceSteps = [
  { id: 'identify-pk', title: 'Identify Primary Key', description: 'Select the columns that form the primary key' },
  { id: 'find-partial', title: 'Find Partial Dependencies', description: 'Identify attributes with partial dependencies' },
  { id: 'decompose-2nf', title: 'Decompose to 2NF', description: 'Select columns to extract for 2NF tables' },
  { id: 'find-transitive', title: 'Find Transitive Dependencies', description: 'Identify transitive dependency chains' },
  { id: 'final-check', title: 'Final Check', description: 'Verify your normalization is correct' },
]

export default function PracticeMode() {
  const {
    currentDataset,
    normalizationResult,
  } = useNormalizationStore()

  const { soundEnabled } = useSimulationStore()

  const [practiceStep, setPracticeStep] = useState(0)
  const [selectedCols, setSelectedCols] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [completed, setCompleted] = useState(false)

  const toggleColumn = useCallback((col) => {
    setSelectedCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
    setFeedback(null)
  }, [])

  const checkAnswer = useCallback(() => {
    const pk = currentDataset.primaryKey
    const fds = currentDataset.functionalDependencies
    const columns = currentDataset.columns

    let isCorrect = false

    switch (practiceStep) {
      case 0: {
        // Check if selected columns match primary key
        isCorrect = selectedCols.length === pk.length &&
          pk.every(k => selectedCols.includes(k))
        break
      }
      case 1: {
        // Check if identified partial dependencies are correct
        const partialDeps = findPartialDependencies(pk, columns, fds)
        const partialAttrs = new Set(partialDeps.flatMap(pd => pd.to))
        const selectedSet = new Set(selectedCols)
        isCorrect = partialAttrs.size === selectedSet.size &&
          [...partialAttrs].every(a => selectedSet.has(a))
        break
      }
      case 2: {
        // Check 2NF decomposition columns
        const partialDeps = findPartialDependencies(pk, columns, fds)
        const partialAttrs = new Set(partialDeps.flatMap(pd => [...pd.from, ...pd.to]))
        const selectedSet = new Set(selectedCols)
        // At least the partial dep attributes should be selected
        isCorrect = [...partialAttrs].some(a => selectedSet.has(a))
        break
      }
      case 3: {
        // Check transitive dependencies
        const transitiveDeps = findTransitiveDependencies(pk, columns, fds)
        const transitiveAttrs = new Set(transitiveDeps.flatMap(td => td.to))
        const selectedSet = new Set(selectedCols)
        isCorrect = transitiveAttrs.size === selectedSet.size &&
          [...transitiveAttrs].every(a => selectedSet.has(a))
        break
      }
      case 4: {
        isCorrect = true
        setCompleted(true)
        break
      }
    }

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Correct! Well done! 🎉' })
      setCorrectAnswers(prev => prev + 1)
      if (soundEnabled) playSound('success')

      // Auto-advance after a delay
      setTimeout(() => {
        if (practiceStep < practiceSteps.length - 1) {
          setPracticeStep(prev => prev + 1)
          setSelectedCols([])
          setFeedback(null)
        } else {
          setCompleted(true)
        }
      }, 1500)
    } else {
      setFeedback({ type: 'incorrect', message: 'Not quite right. Try again! Look at the functional dependencies for clues.' })
      if (soundEnabled) playSound('error')
    }
  }, [practiceStep, selectedCols, currentDataset, soundEnabled])

  const resetPractice = () => {
    setPracticeStep(0)
    setSelectedCols([])
    setFeedback(null)
    setCorrectAnswers(0)
    setCompleted(false)
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl text-center"
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          🏆
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Practice Complete!</h3>
        <p className="text-white/50 mb-4">
          You got {correctAnswers} out of {practiceSteps.length} steps correct.
        </p>
        <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-neon-green to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${(correctAnswers / practiceSteps.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetPractice}
          className="btn-primary"
        >
          Try Again
        </motion.button>
      </motion.div>
    )
  }

  const currentPracticeStep = practiceSteps[practiceStep]

  return (
    <div className="space-y-4">
      {/* Practice progress */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>✏️</span> {currentPracticeStep.title}
          </h3>
          <span className="text-xs text-white/30">
            Step {practiceStep + 1} of {practiceSteps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
            animate={{ width: `${(practiceStep / practiceSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-xs text-white/40">{currentPracticeStep.description}</p>
      </div>

      {/* Instruction */}
      <motion.div
        key={practiceStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-xl border-l-4 border-primary-500"
      >
        <p className="text-sm text-white/70">
          {practiceStep === 0 && `Click on the columns that form the primary key of "${currentDataset.tableName}".`}
          {practiceStep === 1 && 'Select the non-key attributes that have partial dependencies (depend on only part of the primary key).'}
          {practiceStep === 2 && 'Select the columns that should be moved to new tables to achieve 2NF.'}
          {practiceStep === 3 && 'Select the attributes involved in transitive dependencies (non-key → non-key).'}
          {practiceStep === 4 && 'Review the final normalized tables below. Click "Check" to complete!'}
        </p>
      </motion.div>

      {/* Interactive table with selectable columns */}
      {practiceStep < 4 && (
        <div className="glass-card p-4 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {currentDataset.columns.map(col => {
                    const isSelected = selectedCols.includes(col)
                    return (
                      <th
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={`text-left py-3 px-3 font-semibold cursor-pointer transition-all duration-200 border-b-2 select-none ${
                          isSelected
                            ? 'text-primary-300 bg-primary-500/15 border-primary-500'
                            : 'text-white/50 border-transparent hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-primary-500 border-primary-400 text-white' : 'border-white/20'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                          {col}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {currentDataset.rows.slice(0, 4).map((row, ri) => (
                  <tr key={ri} className="border-b border-white/5">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`py-2 px-3 font-mono transition-all duration-200 ${
                          selectedCols.includes(currentDataset.columns[ci])
                            ? 'text-primary-300 bg-primary-500/5'
                            : 'text-white/50'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Final check — show normalized tables */}
      {practiceStep === 4 && normalizationResult?.finalTables && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {normalizationResult.finalTables.map((table, idx) => (
            <VisualTable key={`${table.name}-${idx}`} table={table} index={idx} />
          ))}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border text-sm ${
              feedback.type === 'correct'
                ? 'bg-green-500/10 border-green-500/20 text-green-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check button */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={checkAnswer}
          className="btn-primary"
          disabled={practiceStep < 4 && selectedCols.length === 0}
        >
          ✓ Check Answer
        </motion.button>

        {/* Hint button */}
        <HintButton practiceStep={practiceStep} dataset={currentDataset} />
      </div>
    </div>
  )
}

function HintButton({ practiceStep, dataset }) {
  const [showHint, setShowHint] = useState(false)

  const hints = [
    `The primary key should uniquely identify each row. Look for a combination of columns where no two rows have the same values. Try: (${dataset.primaryKey.join(', ')})`,
    `A partial dependency occurs when a column depends on only PART of the composite key. Check: does any attribute depend solely on ${dataset.primaryKey[0]} without needing ${dataset.primaryKey[1]}?`,
    `For 2NF, extract the partially dependent attributes along with the part of the key they depend on into new tables.`,
    `A transitive dependency is when a non-key attribute determines another non-key attribute: A → B → C. Look for chains in the FDs.`,
    'Review all the tables — they should have no partial or transitive dependencies.',
  ]

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowHint(!showHint)}
        className="btn-secondary text-sm"
      >
        💡 Hint
      </motion.button>
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-3 rounded-lg text-xs text-amber-300/70 border-l-2 border-amber-500/30 overflow-hidden"
          >
            💡 {hints[practiceStep]}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
