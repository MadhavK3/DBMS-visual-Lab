import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'

const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/sql', label: 'SQL', icon: '📊' },
    { path: '/normalization', label: 'Norm Lab+', icon: '🧬' },
    { path: '/er-builder', label: 'ER Builder', icon: '🔗' },
]

export default function Navbar() {
    const location = useLocation()
    const { points, soundEnabled } = useSimulationStore()

    return (
        <motion.nav
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group"
                        onClick={() => soundEnabled && playSound('click')}
                    >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-neon-purple flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                            D
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:block">
                            DBMS Visual Lab
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => soundEnabled && playSound('click')}
                                    className={`relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                                            ? 'text-white'
                                            : 'text-white/50 hover:text-white/80'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-primary-500/20 border border-primary-500/30 rounded-lg"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative flex items-center gap-1.5">
                                        <span className="hidden lg:inline">{link.icon}</span>
                                        {link.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Points & Branding */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/20 to-neon-purple/20 border border-primary-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <span className="text-xs font-bold text-primary-300 tracking-widest uppercase">
                                By Team Hustlers
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-orange/10 border border-neon-orange/20">
                            <span className="text-sm">⭐</span>
                            <span className="text-sm font-semibold text-neon-orange">{points}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
