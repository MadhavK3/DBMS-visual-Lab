import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '../../sound/soundManager'

export default function IntroSplash({ onComplete }) {
    // -1: wait for click, 0: black, 1: logo, 2: text, 3: tagline, 4: fadeout
    const [phase, setPhase] = useState(0)
    const [done, setDone] = useState(false)
    const sequenceStarted = useRef(false)

    useEffect(() => {
        startSequence()
    }, [])

    const startSequence = () => {
        if (sequenceStarted.current) return
        sequenceStarted.current = true

        // Play a silent sound to unlock Web Audio API on iOS/Chrome
        playSound('click')

        setPhase(0)

        // Phase 0: darkness (300ms)
        const t1 = setTimeout(() => {
            setPhase(1)
            playSound('intro_whoosh')
        }, 300)

        // Phase 1: Logo appears (after 300ms)
        const t2 = setTimeout(() => {
            setPhase(2)
            playSound('intro_reveal')
        }, 1200)

        // Phase 2: "Team Hustlers' Production" text
        const t3 = setTimeout(() => {
            setPhase(3)
            playSound('intro_shimmer')
        }, 2400)

        // Phase 3: tagline "presents"
        const t4 = setTimeout(() => {
            setPhase(4)
        }, 3800)

        // Phase 4: fade out
        const t5 = setTimeout(() => {
            setDone(true)
            onComplete?.()
        }, 4800)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(t4)
            clearTimeout(t5)
        }
    }

    // Skip on double click
    const handleSkip = () => {
        if (phase >= 0) {
            setDone(true)
            onComplete?.()
        }
    }

    if (done) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                onDoubleClick={handleSkip}
                initial={{ opacity: 1 }}
                animate={{ opacity: phase === 4 ? 0 : 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    background: 'radial-gradient(ellipse at center, #0d0d2b 0%, #030312 50%, #000000 100%)',
                }}
            >


                {/* Animated particles/stars background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-white"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: phase >= 1 ? [0, 0.6, 0.2, 0.8, 0.3] : 0,
                                scale: phase >= 1 ? [0, 1, 0.5, 1.2, 0.8] : 0,
                            }}
                            transition={{
                                duration: 3,
                                delay: Math.random() * 1.5,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                        />
                    ))}
                </div>

                {/* Horizontal lens flare line */}
                <motion.div
                    className="absolute left-0 right-0 h-[2px] pointer-events-none"
                    style={{
                        top: '50%',
                        background: 'linear-gradient(90deg, transparent 0%, transparent 20%, rgba(99,102,241,0.6) 40%, rgba(168,85,247,0.9) 50%, rgba(99,102,241,0.6) 60%, transparent 80%, transparent 100%)',
                    }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                        opacity: phase >= 1 ? [0, 1, 0.3] : 0,
                        scaleX: phase >= 1 ? [0, 1.2, 0.8] : 0,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Center glow orb */}
                <motion.div
                    className="absolute w-48 h-48 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)',
                        filter: 'blur(30px)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: phase >= 1 ? [0, 2, 1.5] : 0,
                        opacity: phase >= 1 ? [0, 0.8, 0.4] : 0,
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                {/* Main content */}
                <div className="relative z-10 text-center pointer-events-none">
                    {/* Logo letter M */}
                    <motion.div
                        className="relative inline-block mb-8"
                        initial={{ scale: 0, rotateY: -180, opacity: 0 }}
                        animate={{
                            scale: phase >= 1 ? 1 : 0,
                            rotateY: phase >= 1 ? 0 : -180,
                            opacity: phase >= 1 ? 1 : 0,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 80,
                            damping: 15,
                            duration: 0.8,
                        }}
                    >
                        <div
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-6xl sm:text-7xl font-black text-white relative"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                                boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(168,85,247,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
                            }}
                        >
                            H
                            {/* Shimmer effect */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
                                }}
                                initial={{ x: '-100%' }}
                                animate={phase >= 2 ? { x: '200%' } : {}}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>

                    {/* "Team Hustlers'" text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, letterSpacing: '0.5em' }}
                        animate={{
                            opacity: phase >= 2 ? 1 : 0,
                            y: phase >= 2 ? 0 : 20,
                            letterSpacing: phase >= 2 ? '0.2em' : '0.8em',
                        }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="mb-2"
                    >
                        <span
                            className="text-4xl sm:text-6xl font-black uppercase"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 30%, #a5b4fc 60%, #818cf8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))',
                            }}
                        >
                            HUSTLERS
                        </span>
                    </motion.div>

                    {/* "PRODUCTION" text */}
                    <motion.div
                        initial={{ opacity: 0, y: 15, scaleX: 0.8 }}
                        animate={{
                            opacity: phase >= 2 ? 1 : 0,
                            y: phase >= 2 ? 0 : 15,
                            scaleX: phase >= 2 ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        className="mb-10"
                    >
                        <span
                            className="text-xl sm:text-3xl font-medium tracking-[0.5em] uppercase"
                            style={{
                                color: 'rgba(168,85,247,0.9)',
                                textShadow: '0 0 20px rgba(168,85,247,0.5)',
                            }}
                        >
                            PRODUCTION
                        </span>
                    </motion.div>

                    {/* Decorative line */}
                    <motion.div
                        className="w-48 h-[1px] mx-auto mb-8 pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)',
                        }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                            scaleX: phase >= 3 ? 1 : 0,
                            opacity: phase >= 3 ? 1 : 0,
                        }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* "presents" tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: phase >= 3 ? 1 : 0,
                            y: phase >= 3 ? 0 : 10,
                        }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span
                            className="text-base sm:text-lg tracking-[0.4em] uppercase italic text-zinc-400 block mb-8"
                        >
                            presents
                        </span>
                    </motion.div>

                    {/* Developer Credit */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                            opacity: phase >= 3 ? 1 : 0,
                            y: phase >= 3 ? 0 : 10 
                        }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
                            <span className="text-xs sm:text-sm tracking-widest uppercase text-primary-300 font-mono">
                                Designed & Developed by Team Hustlers
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Skip hint */}
                <motion.div
                    className="absolute bottom-8 text-xs tracking-widest uppercase text-zinc-500 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase >= 1 ? 1 : 0 }}
                    transition={{ delay: 1.5 }}
                >
                    double click to skip
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
