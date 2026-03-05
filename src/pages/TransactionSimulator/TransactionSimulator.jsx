import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import { detectCycle } from '../../utils/graphUtils'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

const LOCK_TYPES = { SHARED: 'S', EXCLUSIVE: 'X' }

const sampleTransactions = [
    {
        id: 'T1',
        color: '#6366f1',
        operations: [
            { type: 'READ', resource: 'A', lock: LOCK_TYPES.SHARED },
            { type: 'WRITE', resource: 'A', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'COMMIT' },
        ],
    },
    {
        id: 'T2',
        color: '#10b981',
        operations: [
            { type: 'READ', resource: 'A', lock: LOCK_TYPES.SHARED },
            { type: 'WRITE', resource: 'B', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'COMMIT' },
        ],
    },
]

const deadlockTransactions = [
    {
        id: 'T1',
        color: '#6366f1',
        operations: [
            { type: 'READ', resource: 'A', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'READ', resource: 'B', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'COMMIT' },
        ],
    },
    {
        id: 'T2',
        color: '#ef4444',
        operations: [
            { type: 'READ', resource: 'B', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'READ', resource: 'A', lock: LOCK_TYPES.EXCLUSIVE },
            { type: 'COMMIT' },
        ],
    },
]

export default function TransactionSimulator() {
    const [transactions, setTransactions] = useState(sampleTransactions)
    const [timeline, setTimeline] = useState([])
    const [locks, setLocks] = useState({})
    const [waitGraph, setWaitGraph] = useState({})
    const [deadlock, setDeadlock] = useState(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [explanation, setExplanation] = useState(null)
    const [scenario, setScenario] = useState('normal')
    const canvasRef = useRef(null)

    const { soundEnabled, speed, addPoints, completeModule } = useSimulationStore()

    const runSimulation = useCallback(() => {
        const txns = scenario === 'deadlock' ? deadlockTransactions : sampleTransactions
        setTransactions(txns)
        setTimeline([])
        setLocks({})
        setWaitGraph({})
        setDeadlock(null)
        setIsSimulating(true)

        if (soundEnabled) playSound('processing')

        const currentLocks = {}
        const currentWaitGraph = {}
        const timelineEntries = []
        let stepIdx = 0

        // Interleave operations
        const maxOps = Math.max(...txns.map(t => t.operations.length))
        const allOps = []
        for (let i = 0; i < maxOps; i++) {
            txns.forEach(txn => {
                if (txn.operations[i]) {
                    allOps.push({ txnId: txn.id, color: txn.color, op: txn.operations[i] })
                }
            })
        }

        const interval = setInterval(() => {
            if (stepIdx >= allOps.length) {
                clearInterval(interval)
                setIsSimulating(false)
                if (soundEnabled) playSound('success')
                addPoints(15)
                completeModule('transactions')
                return
            }

            const { txnId, color, op } = allOps[stepIdx]
            const entry = { txnId, color, op, time: stepIdx, status: 'executed' }

            if (op.type === 'READ' || op.type === 'WRITE') {
                const resource = op.resource
                const lockType = op.lock

                if (currentLocks[resource]) {
                    const holder = currentLocks[resource]
                    if (holder.txnId !== txnId) {
                        // Lock conflict
                        if (holder.type === LOCK_TYPES.EXCLUSIVE || lockType === LOCK_TYPES.EXCLUSIVE) {
                            entry.status = 'blocked'
                            currentWaitGraph[txnId] = [...(currentWaitGraph[txnId] || []), holder.txnId]
                            setWaitGraph({ ...currentWaitGraph })

                            // Check for deadlock
                            const cycle = detectCycle(currentWaitGraph)
                            if (cycle) {
                                setDeadlock(cycle)
                                entry.status = 'deadlock'
                                setExplanation({
                                    icon: '💀',
                                    name: 'Deadlock Detected!',
                                    description: `Circular wait detected: ${cycle.join(' → ')}. Both transactions are waiting for resources held by each other.`,
                                })
                                if (soundEnabled) playSound('error')
                                clearInterval(interval)
                                setIsSimulating(false)
                                timelineEntries.push(entry)
                                setTimeline([...timelineEntries])
                                return
                            }

                            setExplanation({
                                icon: '⏳',
                                name: `${txnId} Waiting`,
                                description: `${txnId} is waiting for ${holder.type} lock on resource ${resource} held by ${holder.txnId}.`,
                            })
                            if (soundEnabled) playSound('lock')
                        }
                    }
                }

                if (entry.status !== 'blocked' && entry.status !== 'deadlock') {
                    currentLocks[resource] = { txnId, type: lockType }
                    setLocks({ ...currentLocks })
                    setExplanation({
                        icon: lockType === LOCK_TYPES.EXCLUSIVE ? '🔒' : '🔓',
                        name: `${txnId}: ${op.type} ${resource}`,
                        description: `${txnId} acquired ${lockType === LOCK_TYPES.EXCLUSIVE ? 'EXCLUSIVE' : 'SHARED'} lock on resource ${resource}.`,
                    })
                    if (soundEnabled) playSound('lock')
                }
            } else if (op.type === 'COMMIT') {
                // Release all locks from this transaction
                Object.keys(currentLocks).forEach(res => {
                    if (currentLocks[res]?.txnId === txnId) {
                        delete currentLocks[res]
                    }
                })
                setLocks({ ...currentLocks })
                setExplanation({
                    icon: '✅',
                    name: `${txnId}: COMMIT`,
                    description: `${txnId} committed. All locks released.`,
                })
                if (soundEnabled) playSound('success')
            }

            timelineEntries.push(entry)
            setTimeline([...timelineEntries])
            stepIdx++
        }, 1200 / speed)

        return () => clearInterval(interval)
    }, [scenario, soundEnabled, speed, addPoints, completeModule])

    const handleReset = () => {
        setTimeline([])
        setLocks({})
        setWaitGraph({})
        setDeadlock(null)
        setIsSimulating(false)
        setExplanation(null)
    }

    // Draw wait-for graph
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const rect = canvas.parentElement.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = 200

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const nodes = [...new Set([...Object.keys(waitGraph), ...Object.values(waitGraph).flat()])]
        if (nodes.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)'
            ctx.textAlign = 'center'
            ctx.font = '14px Inter'
            ctx.fillText('Wait-For Graph will appear here', canvas.width / 2, 100)
            return
        }

        const positions = {}
        const cx = canvas.width / 2
        const cy = 100
        const radius = 60
        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
            positions[node] = {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
            }
        })

        // Draw edges
        Object.entries(waitGraph).forEach(([from, tos]) => {
            tos.forEach(to => {
                if (positions[from] && positions[to]) {
                    const isDeadlockEdge = deadlock && deadlock.includes(from) && deadlock.includes(to)
                    ctx.strokeStyle = isDeadlockEdge ? '#ef4444' : 'rgba(99,102,241,0.5)'
                    ctx.lineWidth = isDeadlockEdge ? 3 : 1.5
                    ctx.beginPath()
                    ctx.moveTo(positions[from].x, positions[from].y)
                    ctx.lineTo(positions[to].x, positions[to].y)
                    ctx.stroke()

                    // Arrowhead
                    const angle = Math.atan2(positions[to].y - positions[from].y, positions[to].x - positions[from].x)
                    const ax = positions[to].x - Math.cos(angle) * 25
                    const ay = positions[to].y - Math.sin(angle) * 25
                    ctx.beginPath()
                    ctx.moveTo(ax, ay)
                    ctx.lineTo(ax - 8 * Math.cos(angle - 0.5), ay - 8 * Math.sin(angle - 0.5))
                    ctx.lineTo(ax - 8 * Math.cos(angle + 0.5), ay - 8 * Math.sin(angle + 0.5))
                    ctx.closePath()
                    ctx.fillStyle = isDeadlockEdge ? '#ef4444' : '#6366f1'
                    ctx.fill()
                }
            })
        })

        // Draw nodes
        nodes.forEach(node => {
            const pos = positions[node]
            const isInDeadlock = deadlock && deadlock.includes(node)
            ctx.fillStyle = isInDeadlock ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'
            ctx.strokeStyle = isInDeadlock ? '#ef4444' : '#6366f1'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = 'bold 13px Inter'
            ctx.fillText(node, pos.x, pos.y)
        })

        if (deadlock) {
            ctx.fillStyle = '#ef4444'
            ctx.textAlign = 'center'
            ctx.font = 'bold 14px Inter'
            ctx.fillText('⚠ DEADLOCK DETECTED', canvas.width / 2, canvas.height - 10)
        }
    }, [waitGraph, deadlock])

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🔄</span>
                    Transaction Simulator
                </h1>
                <p className="text-white/40 mt-1">Simulate concurrent transactions, locks, and deadlocks</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={scenario}
                                onChange={(e) => { setScenario(e.target.value); handleReset() }}
                                className="input-field w-auto font-sans"
                            >
                                <option value="normal">Normal Execution</option>
                                <option value="deadlock">Deadlock Scenario</option>
                            </select>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runSimulation} disabled={isSimulating} className="btn-primary disabled:opacity-50">
                                {isSimulating ? '⚙️ Simulating...' : '▶ Run Simulation'}
                            </motion.button>
                            <button onClick={handleReset} className="btn-secondary">Reset</button>
                        </div>
                    </motion.div>

                    {/* Transaction definitions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 rounded-2xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Transactions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {transactions.map(txn => (
                                <div key={txn.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: txn.color }} />
                                        <span className="font-bold text-white">{txn.id}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {txn.operations.map((op, i) => (
                                            <div key={i} className="text-xs font-mono text-white/50 flex items-center gap-2">
                                                <span>{op.type === 'READ' ? '📖' : op.type === 'WRITE' ? '✏️' : '✅'}</span>
                                                <span>{op.type}{op.resource ? ` ${op.resource}` : ''}</span>
                                                {op.lock && <span className="text-primary-400">({op.lock}-Lock)</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="simulation-container rounded-2xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Execution Timeline</h3>
                        {timeline.length > 0 ? (
                            <div className="space-y-2">
                                {timeline.map((entry, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${entry.status === 'deadlock'
                                                ? 'bg-neon-red/10 border border-neon-red/30'
                                                : entry.status === 'blocked'
                                                    ? 'bg-neon-orange/10 border border-neon-orange/30'
                                                    : 'bg-white/5 border border-white/5'
                                            }`}
                                    >
                                        <span className="text-xs text-white/30 font-mono w-6">t{entry.time}</span>
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                        <span className="font-mono font-semibold text-white/80">{entry.txnId}</span>
                                        <span className="text-white/40">
                                            {entry.op.type}{entry.op.resource ? ` ${entry.op.resource}` : ''}
                                        </span>
                                        {entry.op.lock && (
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300">{entry.op.lock}</span>
                                        )}
                                        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${entry.status === 'deadlock'
                                                ? 'bg-neon-red/20 text-neon-red'
                                                : entry.status === 'blocked'
                                                    ? 'bg-neon-orange/20 text-neon-orange'
                                                    : 'bg-neon-green/20 text-neon-green'
                                            }`}>
                                            {entry.status === 'deadlock' ? '💀 DEADLOCK' : entry.status === 'blocked' ? '⏳ BLOCKED' : '✓'}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-white/20">
                                <span className="text-5xl mb-4">🔄</span>
                                <p className="text-lg">Run a simulation to see the timeline</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    <ExplanationPanel step={explanation} stepIndex={0} />

                    {/* Lock status */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Active Locks</h3>
                        <div className="space-y-1.5">
                            {Object.entries(locks).length > 0 ? (
                                Object.entries(locks).map(([resource, lock]) => (
                                    <div key={resource} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                                        <span className="font-mono text-sm text-white/70">Resource {resource}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lock.type === LOCK_TYPES.EXCLUSIVE
                                                ? 'bg-neon-red/20 text-neon-red'
                                                : 'bg-neon-blue/20 text-neon-blue'
                                            }`}>
                                            {lock.type === LOCK_TYPES.EXCLUSIVE ? '🔒 X-Lock' : '🔓 S-Lock'} ({lock.txnId})
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-white/20 italic">No active locks</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Wait-For Graph */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Wait-For Graph</h3>
                        <div className="relative w-full" style={{ minHeight: 200 }}>
                            <canvas ref={canvasRef} className="w-full" style={{ height: 200 }} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
