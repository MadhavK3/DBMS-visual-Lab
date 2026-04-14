import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import { parseQuery } from '../../utils/queryParser'
import SimulationControls from '../../components/SimulationControls/SimulationControls'
import StepPanel from '../../components/StepPanel/StepPanel'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

const datasets = {
    students: {
        name: 'Students',
        data: [
            { id: 1, name: 'Alice', course: 'DBMS', marks: 92 },
            { id: 2, name: 'Bob', course: 'OS', marks: 67 },
            { id: 3, name: 'Charlie', course: 'DBMS', marks: 85 },
            { id: 4, name: 'Diana', course: 'CN', marks: 74 },
            { id: 5, name: 'Eve', course: 'DBMS', marks: 55 },
            { id: 6, name: 'Frank', course: 'OS', marks: 91 },
            { id: 7, name: 'Grace', course: 'CN', marks: 88 },
            { id: 8, name: 'Hank', course: 'DBMS', marks: 43 },
        ],
        queries: [
            "SELECT * FROM students WHERE marks > 80",
            "SELECT name, marks FROM students WHERE course = 'DBMS'",
            "SELECT * FROM students WHERE marks > 60 ORDER BY marks",
        ]
    },
    employees: {
        name: 'Employees',
        data: [
            { id: 101, name: 'John', dept: 'Engineering', salary: 85000 },
            { id: 102, name: 'Sarah', dept: 'Marketing', salary: 65000 },
            { id: 103, name: 'Mike', dept: 'Sales', salary: 72000 },
            { id: 104, name: 'Lisa', dept: 'Engineering', salary: 92000 },
            { id: 105, name: 'Tom', dept: 'HR', salary: 55000 },
        ],
        queries: [
            "SELECT * FROM employees WHERE salary > 70000",
            "SELECT name, salary FROM employees WHERE dept = 'Engineering'",
            "SELECT * FROM employees WHERE salary < 60000",
        ]
    },
    products: {
        name: 'Products',
        data: [
            { id: 1, name: 'Laptop', category: 'Electronics', price: 1200, stock: 45 },
            { id: 2, name: 'Desk', category: 'Furniture', price: 300, stock: 15 },
            { id: 3, name: 'Mouse', category: 'Accessories', price: 45, stock: 120 },
            { id: 4, name: 'Chair', category: 'Furniture', price: 150, stock: 30 },
            { id: 5, name: 'Monitor', category: 'Electronics', price: 250, stock: 60 },
        ],
        queries: [
            "SELECT * FROM products WHERE category = 'Electronics'",
            "SELECT name, price FROM products WHERE price > 200",
            "SELECT * FROM products WHERE stock < 50",
        ]
    }
}

export default function SQLVisualizer() {
    const [activeDatasetKey, setActiveDatasetKey] = useState('students')
    const [query, setQuery] = useState(datasets.students.queries[0])
    const [parsedQuery, setParsedQuery] = useState(null)
    const [currentStep, setCurrentStep] = useState(-1)
    const [processedRows, setProcessedRows] = useState([])
    const [filteredRows, setFilteredRows] = useState([])
    const [resultRows, setResultRows] = useState([])
    const [isRunning, setIsRunning] = useState(false)

    const { soundEnabled, speed, addPoints, completeModule } = useSimulationStore()

    const runQuery = useCallback(() => {
        const parsed = parseQuery(query)
        if (parsed.type === 'UNKNOWN') {
            if (soundEnabled) playSound('error')
            return
        }

        setParsedQuery(parsed)
        setCurrentStep(-1)
        setProcessedRows([])
        setFilteredRows([])
        setResultRows([])
        setIsRunning(true)

        if (soundEnabled) playSound('processing')

        // Animate through steps
        const steps = parsed.steps
        let step = 0
        const interval = setInterval(() => {
            setCurrentStep(step)

            if (steps[step]?.id === 'scan') {
                // Show all rows being scanned
                setProcessedRows([...datasets[activeDatasetKey].data])
                if (soundEnabled) playSound('step')
            } else if (steps[step]?.id === 'filter') {
                // Filter rows based on WHERE clause
                const filtered = applyFilter(datasets[activeDatasetKey].data, parsed.whereClause)
                setFilteredRows(filtered)
                setProcessedRows(filtered)
                if (soundEnabled) playSound('step')
            } else if (steps[step]?.id === 'sort') {
                if (soundEnabled) playSound('step')
            } else if (steps[step]?.id === 'project') {
                if (soundEnabled) playSound('step')
            } else if (steps[step]?.id === 'result') {
                const filtered = parsed.whereClause ? applyFilter(datasets[activeDatasetKey].data, parsed.whereClause) : datasets[activeDatasetKey].data
                setResultRows(filtered)
                if (soundEnabled) playSound('success')
                addPoints(10)
                completeModule('sql')
            }

            step++
            if (step >= steps.length) {
                clearInterval(interval)
                setIsRunning(false)
            }
        }, 1200 / speed)

        return () => clearInterval(interval)
    }, [query, activeDatasetKey, soundEnabled, speed, addPoints, completeModule])

    const handleReset = () => {
        setCurrentStep(-1)
        setProcessedRows([])
        setFilteredRows([])
        setResultRows([])
        setIsRunning(false)
        setParsedQuery(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-4xl">📊</span>
                        SQL Query Visualizer
                    </h1>
                    <p className="text-white/40 mt-1">Watch queries execute through the database pipeline</p>
                </div>
                <div className="flex bg-surface-900 border border-white/10 rounded-xl p-1 gap-1">
                    {Object.entries(datasets).map(([key, dataset]) => (
                        <button
                            key={key}
                            onClick={() => { 
                                setActiveDatasetKey(key)
                                setQuery(dataset.queries[0])
                                handleReset()
                                if(soundEnabled) playSound('click')
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeDatasetKey === key
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            {dataset.name}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Editor + Controls */}
                <div className="lg:col-span-2 space-y-4">
                    {/* SQL Editor */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-5 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">SQL Query</h3>
                            <div className="flex gap-2">
                                {datasets[activeDatasetKey].queries.map((sq, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setQuery(sq); if (soundEnabled) playSound('click') }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all border border-white/5"
                                    >
                                        Example {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input-field h-24 resize-none text-sm"
                            placeholder="Type your SQL query here..."
                        />
                        <div className="flex items-center gap-3 mt-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={runQuery}
                                disabled={isRunning}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span>
                                        Executing...
                                    </>
                                ) : (
                                    <>▶ Execute Query</>
                                )}
                            </motion.button>
                            <button onClick={handleReset} className="btn-secondary">Reset</button>
                        </div>
                    </motion.div>

                    {/* Pipeline Visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="simulation-container rounded-2xl"
                    >
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                            Execution Pipeline
                        </h3>

                        {parsedQuery ? (
                            <div className="space-y-6">
                                {/* Pipeline stages */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    {parsedQuery.steps.map((step, i) => (
                                        <div key={step.id} className="flex items-center gap-2 sm:gap-4">
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{
                                                    scale: i <= currentStep ? 1 : 0.9,
                                                    opacity: i <= currentStep ? 1 : 0.4,
                                                }}
                                                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-center min-w-[80px] sm:min-w-[100px] transition-all ${i < currentStep
                                                        ? 'bg-neon-green/20 border border-neon-green/30'
                                                        : i === currentStep
                                                            ? 'bg-primary-500/20 border border-primary-500/40 neon-border'
                                                            : 'bg-white/5 border border-white/10'
                                                    }`}
                                            >
                                                <div className="text-lg sm:text-xl mb-1">{step.icon}</div>
                                                <div className="text-xs font-medium text-white/70">{step.name}</div>
                                            </motion.div>
                                            {i < parsedQuery.steps.length - 1 && (
                                                <motion.div
                                                    animate={{
                                                        color: i < currentStep ? '#10b981' : '#ffffff20',
                                                    }}
                                                    className="text-xl hidden sm:block"
                                                >
                                                    →
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Data Table */}
                                <div className="overflow-x-auto w-full pb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                {Object.keys(datasets[activeDatasetKey].data[0] || {}).map(col => {
                                                    const projectIndex = parsedQuery.steps.findIndex(s => s.id === 'project')
                                                    const isProjected = projectIndex !== -1 && currentStep >= projectIndex
                                                    const showCol = !isProjected || parsedQuery.columns.includes('*') || parsedQuery.columns.some(c => c.toLowerCase() === col.toLowerCase())
                                                    return showCol ? (
                                                        <th key={col} className="text-left py-2 px-3 text-white/50 font-medium capitalize">{col}</th>
                                                    ) : null
                                                })}
                                                <th className="text-left py-2 px-3 text-white/50 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {(() => {
                                                    let displayData = [...datasets[activeDatasetKey].data]
                                                    const sortIndex = parsedQuery.steps.findIndex(s => s.id === 'sort')
                                                    if (sortIndex !== -1 && currentStep >= sortIndex && parsedQuery.orderBy) {
                                                        const sortBy = parsedQuery.orderBy.toLowerCase()
                                                        displayData.sort((a, b) => {
                                                            const valA = a[sortBy]; const valB = b[sortBy];
                                                            return valA < valB ? -1 : valA > valB ? 1 : 0
                                                        })
                                                    }
                                                    return displayData.map((row, i) => {
                                                    const isFiltered = filteredRows.length > 0 && !filteredRows.find(r => r.id === row.id)
                                                    const isResult = resultRows.find(r => r.id === row.id)
                                                    const isScanned = processedRows.find(r => r.id === row.id)
                                                    const columns = Object.keys(row)

                                                    return (
                                                        <motion.tr
                                                            key={row.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{
                                                                opacity: isFiltered ? 0.2 : 1,
                                                                x: 0,
                                                                backgroundColor: isResult
                                                                    ? 'rgba(16,185,129,0.1)'
                                                                    : isScanned && !isFiltered
                                                                        ? 'rgba(99,102,241,0.05)'
                                                                        : 'transparent',
                                                            }}
                                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                                            className="border-b border-white/5"
                                                        >
                                                            {columns.map(col => {
                                                                const projectIndex = parsedQuery.steps.findIndex(s => s.id === 'project')
                                                                const isProjected = projectIndex !== -1 && currentStep >= projectIndex
                                                                const showCol = !isProjected || parsedQuery.columns.includes('*') || parsedQuery.columns.some(c => c.toLowerCase() === col.toLowerCase())
                                                                return showCol ? (
                                                                    <td key={col} className={`py-2.5 px-3 ${col === 'id' ? 'text-white/70 font-mono' : 'text-white/90'}`}>
                                                                        {row[col]}
                                                                    </td>
                                                                ) : null
                                                            })}
                                                            <td className="py-2.5 px-3">
                                                                {isResult ? (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green">✓ Match</span>
                                                                ) : isFiltered ? (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-red/20 text-neon-red">✗ Filtered</span>
                                                                ) : isScanned ? (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300">Scanning...</span>
                                                                ) : (
                                                                    <span className="text-xs text-white/20">Waiting</span>
                                                                )}
                                                            </td>
                                                        </motion.tr>
                                                    )
                                                })})()}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-white/20">
                                <span className="text-5xl mb-4">📊</span>
                                <p className="text-lg">Execute a query to see the pipeline</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right: Steps + Explanation */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {parsedQuery && (
                            <StepPanel steps={parsedQuery.steps} currentStep={currentStep >= 0 ? currentStep : -1} />
                        )}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <ExplanationPanel
                            step={parsedQuery?.steps?.[currentStep]}
                            stepIndex={currentStep}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function applyFilter(data, whereClause) {
    if (!whereClause) return data
    try {
        const upper = whereClause.toUpperCase()
        // Simple parsing for column op value
        const match = whereClause.match(/(\w+)\s*(>|<|>=|<=|=|!=)\s*['"]?(\w+)['"]?/i)
        if (!match) return data
        const [, col, op, val] = match
        const colLower = col.toLowerCase()
        return data.filter(row => {
            const rowVal = row[colLower]
            if (rowVal === undefined) return false
            const numVal = Number(val)
            const isNum = !isNaN(numVal) && !isNaN(rowVal)
            switch (op) {
                case '>': return isNum ? rowVal > numVal : String(rowVal) > val
                case '<': return isNum ? rowVal < numVal : String(rowVal) < val
                case '>=': return isNum ? rowVal >= numVal : String(rowVal) >= val
                case '<=': return isNum ? rowVal <= numVal : String(rowVal) <= val
                case '=': return isNum ? rowVal === numVal : String(rowVal).toLowerCase() === val.toLowerCase()
                case '!=': return isNum ? rowVal !== numVal : String(rowVal).toLowerCase() !== val.toLowerCase()
                default: return true
            }
        })
    } catch {
        return data
    }
}
