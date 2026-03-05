import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'

const modules = [
    {
        id: 'sql',
        title: 'SQL Query Engine',
        subtitle: 'Visualize query execution',
        description: 'Watch your SQL queries come to life as data flows through scan, filter, and projection stages.',
        icon: '📊',
        path: '/sql',
        color: 'from-blue-500 to-cyan-400',
        glow: 'shadow-blue-500/30',
        borderColor: 'border-blue-500/30',
        bgIcon: 'bg-blue-500/10',
    },
    {
        id: 'index',
        title: 'Index Visualizer',
        subtitle: 'B+ Tree indexing',
        description: 'Insert, delete, and search keys in a B+ Tree. See node splits, merges, and traversal in real time.',
        icon: '🌳',
        path: '/index',
        color: 'from-emerald-500 to-green-400',
        glow: 'shadow-emerald-500/30',
        borderColor: 'border-emerald-500/30',
        bgIcon: 'bg-emerald-500/10',
    },
    {
        id: 'transactions',
        title: 'Transaction Simulator',
        subtitle: 'Concurrency & locks',
        description: 'Create transactions, observe lock conflicts, and discover deadlocks through interactive timelines.',
        icon: '🔄',
        path: '/transactions',
        color: 'from-orange-500 to-amber-400',
        glow: 'shadow-orange-500/30',
        borderColor: 'border-orange-500/30',
        bgIcon: 'bg-orange-500/10',
    },
    {
        id: 'normalization',
        title: 'Normalization Lab',
        subtitle: '1NF → 2NF → 3NF',
        description: 'Input a table and watch it decompose into normalized forms with animated attribute migrations.',
        icon: '📐',
        path: '/normalization',
        color: 'from-purple-500 to-violet-400',
        glow: 'shadow-purple-500/30',
        borderColor: 'border-purple-500/30',
        bgIcon: 'bg-purple-500/10',
    },
    {
        id: 'er-builder',
        title: 'ER Diagram Builder',
        subtitle: 'Visual schema design',
        description: 'Drag-and-drop entities, attributes, and relationships. Auto-generate SQL schema from your design.',
        icon: '🔗',
        path: '/er-builder',
        color: 'from-pink-500 to-rose-400',
        glow: 'shadow-pink-500/30',
        borderColor: 'border-pink-500/30',
        bgIcon: 'bg-pink-500/10',
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
}

export default function Home() {
    const { points, completedModules, badges, soundEnabled } = useSimulationStore()
    const totalModules = modules.length
    const progress = (completedModules.length / totalModules) * 100

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative text-center py-16 sm:py-24"
            >
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-[100px]"
                        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-[120px]"
                        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-10 left-1/2 w-64 h-64 rounded-full bg-neon-blue/8 blur-[80px]"
                        animate={{ x: [-20, 20, -20] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />
                </div>

                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative z-10"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6"
                        animate={{ boxShadow: ['0 0 0 rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.3)', '0 0 0 rgba(99,102,241,0)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        Interactive Learning Platform
                    </motion.div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                        <span className="text-white">Master Databases</span>
                        <br />
                        <span className="gradient-text">Through Simulation</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        See how databases actually work under the hood. Explore SQL execution, indexing,
                        transactions, normalization, and schema design through immersive visual experiences.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/sql"
                            onClick={() => soundEnabled && playSound('click')}
                            className="btn-primary text-lg px-8 py-4"
                        >
                            Start Learning →
                        </Link>
                        <a
                            href="#modules"
                            className="btn-secondary text-lg px-8 py-4"
                            onClick={() => soundEnabled && playSound('click')}
                        >
                            Explore Modules
                        </a>
                    </div>
                </motion.div>

                {/* Floating stat badges */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 sm:gap-8">
                    {[
                        { label: 'Modules', value: '5', icon: '📦' },
                        { label: 'Simulations', value: '20+', icon: '🎮' },
                        { label: 'Interactive', value: '100%', icon: '✨' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="glass-card px-4 py-3 rounded-xl text-center"
                        >
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-white/40">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Progress Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl"
            >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Your DBMS Mastery</h2>
                        <p className="text-sm text-white/40">Complete all modules to become a database expert</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span className="text-xl font-bold text-neon-orange">{points}</span>
                            <span className="text-sm text-white/40">points</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🏆</span>
                            <span className="text-xl font-bold text-neon-blue">{badges.length}</span>
                            <span className="text-sm text-white/40">badges</span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-3 bg-surface-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 via-neon-purple to-neon-pink"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
                <p className="text-sm text-white/40 mt-2">
                    {completedModules.length} of {totalModules} modules completed ({Math.round(progress)}%)
                </p>
            </motion.section>

            {/* Modules Grid */}
            <motion.section
                id="modules"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Simulation Modules</h2>
                    <p className="text-white/40 text-lg">Choose a module and dive into interactive learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod) => {
                        const isCompleted = completedModules.includes(mod.id)
                        return (
                            <motion.div key={mod.id} variants={itemVariants}>
                                <Link
                                    to={mod.path}
                                    onClick={() => soundEnabled && playSound('click')}
                                    className={`block group glass-card-hover p-6 rounded-2xl relative overflow-hidden`}
                                >
                                    {/* Gradient accent line */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

                                    {/* Background glow */}
                                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${mod.color} opacity-5 group-hover:opacity-10 blur-3xl transition-opacity`} />

                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 rounded-xl ${mod.bgIcon} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                            {mod.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:gradient-text transition-all">
                                            {mod.title}
                                        </h3>
                                        <p className="text-sm text-primary-300/70 font-medium mb-3">{mod.subtitle}</p>
                                        <p className="text-sm text-white/40 leading-relaxed mb-4">{mod.description}</p>

                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isCompleted
                                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                                : 'bg-white/5 text-white/30 border border-white/10'
                                                }`}>
                                                {isCompleted ? '✅ Completed' : '○ Start'}
                                            </span>
                                            <span className="text-white/20 group-hover:text-white/60 transition-colors text-lg">→</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="text-center py-8 border-t border-white/5">
                <p className="text-sm text-white/20">
                    DBMS Visual Lab — Learn databases through simulation
                </p>
            </footer>
        </div>
    )
}
