import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import { BPlusTree } from '../../utils/treeBuilder'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

export default function IndexSimulator() {
    const [tree] = useState(() => new BPlusTree(4))
    const [treeData, setTreeData] = useState(null)
    const [inputVal, setInputVal] = useState('')
    const [searchPath, setSearchPath] = useState([])
    const [highlightedNode, setHighlightedNode] = useState(null)
    const [operation, setOperation] = useState(null)
    const [explanation, setExplanation] = useState(null)
    const [history, setHistory] = useState([])
    const canvasRef = useRef(null)

    const { soundEnabled, addPoints, completeModule } = useSimulationStore()

    const updateTree = useCallback(() => {
        setTreeData(tree.toJSON())
    }, [tree])

    const handleInsert = useCallback(() => {
        const key = parseInt(inputVal)
        if (isNaN(key)) return
        tree.insert(key)
        updateTree()
        setInputVal('')
        setOperation({ type: 'insert', key })
        setExplanation({
            icon: '➕',
            name: `Insert ${key}`,
            description: `Key ${key} has been inserted into the B+ Tree. The tree automatically balances through node splits if needed.`,
        })
        setHistory(prev => [...prev, `INSERT ${key}`])
        if (soundEnabled) playSound('success')
        addPoints(5)
    }, [inputVal, tree, updateTree, soundEnabled, addPoints])

    const handleSearch = useCallback(() => {
        const key = parseInt(inputVal)
        if (isNaN(key)) return
        const result = tree.search(key)
        setSearchPath(result.path.map(p => p.node.id))
        setOperation({ type: 'search', key, found: result.found })
        setExplanation({
            icon: result.found ? '✅' : '❌',
            name: `Search ${key}`,
            description: result.found
                ? `Key ${key} was found! The search traversed ${result.path.length} node(s) from root to leaf.`
                : `Key ${key} was not found. The search visited ${result.path.length} node(s).`,
        })
        if (soundEnabled) playSound(result.found ? 'success' : 'error')

        // Animate search path
        result.path.forEach((p, i) => {
            setTimeout(() => {
                setHighlightedNode(p.node.id)
                if (soundEnabled) playSound('step')
            }, i * 600)
        })
        setTimeout(() => setHighlightedNode(null), result.path.length * 600 + 1000)
    }, [inputVal, tree, soundEnabled])

    const handleDelete = useCallback(() => {
        const key = parseInt(inputVal)
        if (isNaN(key)) return
        tree.delete(key)
        updateTree()
        setInputVal('')
        setOperation({ type: 'delete', key })
        setExplanation({
            icon: '🗑️',
            name: `Delete ${key}`,
            description: `Key ${key} removed from the B+ Tree. The tree rebalances through merges if needed.`,
        })
        setHistory(prev => [...prev, `DELETE ${key}`])
        if (soundEnabled) playSound('click')
    }, [inputVal, tree, updateTree, soundEnabled])

    const handleBulkInsert = () => {
        const keys = [10, 20, 5, 15, 25, 30, 8, 12, 18, 22]
        keys.forEach((key, i) => {
            setTimeout(() => {
                tree.insert(key)
                updateTree()
                if (soundEnabled) playSound('step')
                if (i === keys.length - 1) {
                    if (soundEnabled) playSound('success')
                    completeModule('index')
                    addPoints(20)
                }
            }, i * 300)
        })
        setHistory(prev => [...prev, `BULK INSERT [${keys.join(', ')}]`])
        setExplanation({
            icon: '📦',
            name: 'Bulk Insert',
            description: `Inserting ${keys.length} keys: ${keys.join(', ')}. Watch the tree grow and split nodes automatically.`,
        })
    }

    // Draw tree on canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const rect = canvas.parentElement.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = 400

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!treeData) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)'
            ctx.textAlign = 'center'
            ctx.font = '16px Inter'
            ctx.fillText('Insert keys to build the B+ Tree', canvas.width / 2, 200)
            return
        }

        // Layout and draw
        const positions = {}
        const nodeWidth = 70
        const nodeHeight = 36
        const levelHeight = 80

        function layoutNode(node, x, y, width) {
            if (!node) return
            positions[node.id] = { x, y, node }
            if (node.children.length > 0) {
                const childWidth = width / node.children.length
                node.children.forEach((child, i) => {
                    layoutNode(child, x - width / 2 + childWidth * i + childWidth / 2, y + levelHeight, childWidth)
                })
            }
        }

        layoutNode(treeData, canvas.width / 2, 50, canvas.width * 0.8)

        // Draw edges
        ctx.strokeStyle = 'rgba(99,102,241,0.3)'
        ctx.lineWidth = 2
        function drawEdges(node) {
            if (!node || !positions[node.id]) return
            const pos = positions[node.id]
            node.children.forEach(child => {
                if (positions[child.id]) {
                    const cPos = positions[child.id]
                    ctx.beginPath()
                    ctx.moveTo(pos.x, pos.y + nodeHeight / 2)
                    ctx.lineTo(cPos.x, cPos.y - nodeHeight / 2)
                    ctx.stroke()
                    drawEdges(child)
                }
            })
        }
        drawEdges(treeData)

        // Draw nodes
        Object.values(positions).forEach(({ x, y, node }) => {
            const isHighlighted = highlightedNode === node.id
            const isInPath = searchPath.includes(node.id)
            const w = Math.max(nodeWidth, node.keys.length * 30 + 20)

            // Node background
            ctx.fillStyle = isHighlighted
                ? 'rgba(168,85,247,0.4)'
                : isInPath
                    ? 'rgba(0,212,255,0.2)'
                    : node.isLeaf
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(99,102,241,0.15)'
            ctx.strokeStyle = isHighlighted
                ? '#a855f7'
                : isInPath
                    ? '#00d4ff'
                    : node.isLeaf
                        ? '#10b98140'
                        : '#6366f140'
            ctx.lineWidth = isHighlighted ? 3 : 1.5

            const rx = x - w / 2
            const ry = y - nodeHeight / 2
            ctx.beginPath()
            ctx.roundRect(rx, ry, w, nodeHeight, 8)
            ctx.fill()
            ctx.stroke()

            // Key text
            ctx.fillStyle = isHighlighted ? '#ffffff' : '#e2e8f0'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = '13px JetBrains Mono'
            ctx.fillText(node.keys.join(' | '), x, y)

            // Leaf indicator
            if (node.isLeaf) {
                ctx.fillStyle = '#10b98160'
                ctx.font = '9px Inter'
                ctx.fillText('leaf', x, y + nodeHeight / 2 + 10)
            }
        })
    }, [treeData, highlightedNode, searchPath])

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🌳</span>
                    Index Visualizer — B+ Tree
                </h1>
                <p className="text-white/40 mt-1">Insert, search, and delete keys to see how B+ Tree indexing works</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="number"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                                className="input-field w-32"
                                placeholder="Key..."
                            />
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInsert} className="btn-primary flex items-center gap-2">
                                ➕ Insert
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch} className="px-4 py-3 rounded-xl font-semibold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 hover:bg-neon-blue/20 transition-all">
                                🔍 Search
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDelete} className="px-4 py-3 rounded-xl font-semibold text-neon-red bg-neon-red/10 border border-neon-red/30 hover:bg-neon-red/20 transition-all">
                                🗑️ Delete
                            </motion.button>
                            <div className="w-px h-8 bg-white/10" />
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBulkInsert} className="btn-secondary text-sm">
                                📦 Bulk Insert Demo
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Tree Canvas */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="simulation-container rounded-2xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">B+ Tree Structure</h3>
                        <div className="relative w-full" style={{ minHeight: 400 }}>
                            <canvas ref={canvasRef} className="w-full" style={{ height: 400 }} />
                        </div>
                        <div className="flex items-center gap-6 mt-3 text-xs text-white/40">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-primary-500/30 border border-primary-500/40" /> Internal Node
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-neon-green/30 border border-neon-green/40" /> Leaf Node
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-neon-purple/30 border border-neon-purple/40" /> Highlighted
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    <ExplanationPanel step={explanation} stepIndex={0} />

                    {/* Operation history */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">History</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-xs text-white/20 italic">No operations yet</p>
                            ) : (
                                history.map((op, i) => (
                                    <div key={i} className="text-xs font-mono text-white/50 px-2 py-1 rounded bg-white/5">
                                        {op}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
