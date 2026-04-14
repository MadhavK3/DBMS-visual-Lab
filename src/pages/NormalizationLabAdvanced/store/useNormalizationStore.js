import { create } from 'zustand'
import { datasets, generateQuizQuestions } from '../engine/datasets'
import { runFullNormalization } from '../engine/normalizationEngine'
import { classifyDependencies } from '../engine/dependencyDetector'

export const useNormalizationStore = create((set, get) => ({
  // ─── Dataset ──────────────────────────────────────────────
  currentDatasetId: 'college',
  currentDataset: datasets.college,
  normalizationResult: null,
  dependencies: null,

  // ─── Step Control ─────────────────────────────────────────
  currentStep: -1, // -1 = not started, 0=UNF, 1=1NF, 2=2NF, 3=3NF
  isAnimating: false,
  animationSpeed: 1,

  // ─── Mode ─────────────────────────────────────────────────
  mode: 'learn', // 'learn' | 'practice' | 'quiz'
  teacherMode: false,

  // ─── Quiz State ───────────────────────────────────────────
  quizQuestions: [],
  quizAnswers: {},
  quizSubmitted: false,
  quizScore: 0,

  // ─── Practice State ───────────────────────────────────────
  practiceStep: 0,
  practiceSelections: {},
  practiceFeedback: null,

  // ─── Highlighted Elements ─────────────────────────────────
  highlightedColumns: [],
  highlightedRows: [],
  highlightedDeps: [],

  // ─── Actions ──────────────────────────────────────────────

  setDataset: (datasetId) => {
    const dataset = datasets[datasetId]
    if (!dataset) return

    const result = runFullNormalization(dataset)
    const deps = classifyDependencies(
      dataset.primaryKey,
      dataset.columns,
      dataset.functionalDependencies
    )

    set({
      currentDatasetId: datasetId,
      currentDataset: dataset,
      normalizationResult: result,
      dependencies: deps,
      currentStep: -1,
      isAnimating: false,
      highlightedColumns: [],
      highlightedRows: [],
      highlightedDeps: [],
      quizQuestions: generateQuizQuestions(dataset),
      quizAnswers: {},
      quizSubmitted: false,
      quizScore: 0,
      practiceStep: 0,
      practiceSelections: {},
      practiceFeedback: null,
    })
  },

  // Removed setCustomDataset

  // Initialize on first load
  initialize: () => {
    const dataset = datasets.college
    const result = runFullNormalization(dataset)
    const deps = classifyDependencies(
      dataset.primaryKey,
      dataset.columns,
      dataset.functionalDependencies
    )
    set({
      normalizationResult: result,
      dependencies: deps,
      quizQuestions: generateQuizQuestions(dataset),
    })
  },

  // Step control
  goToStep: (step) => set({ currentStep: step }),
  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 3) {
      set({ currentStep: currentStep + 1 })
    }
  },
  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },
  resetSteps: () => set({ currentStep: -1, isAnimating: false }),

  setAnimating: (val) => set({ isAnimating: val }),

  // Mode switching
  setMode: (mode) => set({
    mode,
    currentStep: -1,
    practiceStep: 0,
    practiceSelections: {},
    practiceFeedback: null,
    quizAnswers: {},
    quizSubmitted: false,
    quizScore: 0,
  }),

  toggleTeacherMode: () => set(s => ({
    teacherMode: !s.teacherMode,
    animationSpeed: !s.teacherMode ? 0.5 : 1,
  })),

  // Highlighting
  setHighlightedColumns: (cols) => set({ highlightedColumns: cols }),
  setHighlightedRows: (rows) => set({ highlightedRows: rows }),
  setHighlightedDeps: (deps) => set({ highlightedDeps: deps }),
  clearHighlights: () => set({
    highlightedColumns: [],
    highlightedRows: [],
    highlightedDeps: [],
  }),

  // Quiz
  setQuizAnswer: (questionId, answer) => set(s => ({
    quizAnswers: { ...s.quizAnswers, [questionId]: answer },
  })),

  submitQuiz: () => {
    const { quizQuestions, quizAnswers } = get()
    let score = 0
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) score++
    })
    set({ quizSubmitted: true, quizScore: score })
  },

  resetQuiz: () => set({
    quizAnswers: {},
    quizSubmitted: false,
    quizScore: 0,
  }),

  // Practice
  setPracticeStep: (step) => set({ practiceStep: step }),
  setPracticeSelection: (key, value) => set(s => ({
    practiceSelections: { ...s.practiceSelections, [key]: value },
  })),
  setPracticeFeedback: (feedback) => set({ practiceFeedback: feedback }),
}))
