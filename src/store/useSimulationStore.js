import { create } from 'zustand'

export const useSimulationStore = create((set, get) => ({
    // Simulation state
    isPlaying: false,
    speed: 1,
    currentStep: 0,
    totalSteps: 0,
    isStepMode: false,

    // Sound
    soundEnabled: true,

    // Gamification
    points: parseInt(localStorage.getItem('dbms_points') || '0'),
    badges: JSON.parse(localStorage.getItem('dbms_badges') || '[]'),
    completedModules: JSON.parse(localStorage.getItem('dbms_completed') || '[]'),

    // Simulation controls
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    reset: () => set({ isPlaying: false, currentStep: 0 }),
    setSpeed: (speed) => set({ speed }),
    nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps - 1) {
            set({ currentStep: currentStep + 1 })
        } else {
            set({ isPlaying: false })
        }
    },
    setStep: (step) => set({ currentStep: step }),
    setTotalSteps: (total) => set({ totalSteps: total }),
    toggleStepMode: () => set((s) => ({ isStepMode: !s.isStepMode })),

    // Sound controls
    toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

    // Gamification
    addPoints: (pts) => {
        const newPoints = get().points + pts
        localStorage.setItem('dbms_points', String(newPoints))
        set({ points: newPoints })
    },
    addBadge: (badge) => {
        const badges = [...get().badges]
        if (!badges.find(b => b.id === badge.id)) {
            badges.push(badge)
            localStorage.setItem('dbms_badges', JSON.stringify(badges))
            set({ badges })
        }
    },
    completeModule: (moduleId) => {
        const completed = [...get().completedModules]
        if (!completed.includes(moduleId)) {
            completed.push(moduleId)
            localStorage.setItem('dbms_completed', JSON.stringify(completed))
            set({ completedModules: completed })
        }
    },
}))
