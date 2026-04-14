import { motion, AnimatePresence } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'

export default function QuizMode() {
  const {
    quizQuestions,
    quizAnswers,
    quizSubmitted,
    quizScore,
    setQuizAnswer,
    submitQuiz,
    resetQuiz,
    currentDataset,
  } = useNormalizationStore()

  const { soundEnabled } = useSimulationStore()

  const allAnswered = quizQuestions.every(q => quizAnswers[q.id])

  if (quizSubmitted) {
    const percentage = Math.round((quizScore / quizQuestions.length) * 100)
    const grade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'F'

    return (
      <div className="space-y-6">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
          >
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </motion.div>

          <h3 className="text-3xl font-bold text-white mb-2">
            {quizScore} / {quizQuestions.length}
          </h3>
          <p className="text-white/50 mb-4">
            {percentage >= 80 ? 'Excellent! You really understand normalization!' :
             percentage >= 60 ? 'Good job! Keep practicing to master normalization.' :
             'Keep studying — review the explanations below.'}
          </p>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-black ${
                percentage >= 80 ? 'text-neon-green' : percentage >= 60 ? 'text-neon-blue' : 'text-neon-orange'
              }`}>
                {percentage}%
              </div>
              <div className="text-xs text-white/30">Score</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-black ${
                grade === 'A' ? 'text-neon-green' : grade === 'B' ? 'text-neon-blue' : 'text-neon-orange'
              }`}>
                {grade}
              </div>
              <div className="text-xs text-white/30">Grade</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              resetQuiz()
              if (soundEnabled) playSound('click')
            }}
            className="btn-primary"
          >
            ↺ Retake Quiz
          </motion.button>
        </motion.div>

        {/* Answer review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Answer Review</h3>
          {quizQuestions.map((q, qi) => {
            const userAnswer = quizAnswers[q.id]
            const isCorrect = userAnswer === q.correctAnswer

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.1 }}
                className={`glass-card p-4 rounded-xl border-l-4 ${
                  isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{isCorrect ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium mb-2">{q.question}</p>
                    <p className="text-xs text-white/40 mb-1">
                      Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{userAnswer}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-green-400/70">
                        Correct: {q.correctAnswer}
                      </p>
                    )}
                    <p className="text-xs text-white/30 mt-2 italic">{q.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz header */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>🧪</span> Normalization Quiz
          </h3>
          <p className="text-xs text-white/30 mt-0.5">
            Based on: {currentDataset.tableName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            {Object.keys(quizAnswers).length} / {quizQuestions.length} answered
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              submitQuiz()
              if (soundEnabled) playSound(allAnswered ? 'complete' : 'click')
            }}
            disabled={!allAnswered}
            className="btn-primary text-sm disabled:opacity-40"
          >
            Submit Quiz
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
          animate={{ width: `${(Object.keys(quizAnswers).length / quizQuestions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quizQuestions.map((q, qi) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.08 }}
            className="glass-card p-5 rounded-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">
                {qi + 1}
              </span>
              <div>
                <p className="text-sm text-white font-medium">{q.question}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 mt-1 inline-block">
                  {q.topic}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
              {q.options.map((option, oi) => {
                const isSelected = quizAnswers[q.id] === option

                return (
                  <motion.button
                    key={oi}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setQuizAnswer(q.id, option)
                      if (soundEnabled) playSound('click')
                    }}
                    className={`text-left px-4 py-3 rounded-lg border text-xs font-mono transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-500/15 border-primary-500/40 text-primary-200'
                        : 'bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${
                        isSelected ? 'bg-primary-500 border-primary-400 text-white' : 'border-white/20'
                      }`}>
                        {isSelected && '●'}
                      </span>
                      {option}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
