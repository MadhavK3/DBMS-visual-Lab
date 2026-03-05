import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

const presetTables = {
    student: {
        name: 'StudentCourses',
        columns: ['StudentID', 'StudentName', 'Course', 'Professor', 'ProfessorEmail', 'Grade'],
        rows: [
            ['101', 'Alice', 'DBMS', 'Dr. Smith', 'smith@uni.edu', 'A'],
            ['101', 'Alice', 'OS', 'Dr. Lee', 'lee@uni.edu', 'B+'],
            ['102', 'Bob', 'DBMS', 'Dr. Smith', 'smith@uni.edu', 'A-'],
            ['103', 'Charlie', 'CN', 'Dr. Patel', 'patel@uni.edu', 'B'],
        ],
        primaryKey: ['StudentID', 'Course'],
        functionalDeps: [
            { from: ['StudentID'], to: ['StudentName'] },
            { from: ['Course'], to: ['Professor', 'ProfessorEmail'] },
            { from: ['Professor'], to: ['ProfessorEmail'] },
            { from: ['StudentID', 'Course'], to: ['Grade'] },
        ],
    },
    order: {
        name: 'Orders',
        columns: ['OrderID', 'CustomerName', 'CustomerCity', 'Product', 'Price', 'Quantity'],
        rows: [
            ['O1', 'Alice', 'NYC', 'Laptop', '999', '1'],
            ['O2', 'Bob', 'LA', 'Phone', '699', '2'],
            ['O3', 'Alice', 'NYC', 'Tablet', '499', '1'],
        ],
        primaryKey: ['OrderID'],
        functionalDeps: [
            { from: ['OrderID'], to: ['CustomerName', 'CustomerCity', 'Product', 'Price', 'Quantity'] },
            { from: ['CustomerName'], to: ['CustomerCity'] },
        ],
    },
}

const normSteps = [
    {
        id: '1nf',
        name: 'First Normal Form (1NF)',
        icon: '1️⃣',
        description: 'Ensure all columns have atomic values and each row is unique. No repeating groups or arrays.',
        check: 'All values are atomic. Each row uniquely identified by the composite key.',
    },
    {
        id: '2nf',
        name: 'Second Normal Form (2NF)',
        icon: '2️⃣',
        description: 'Remove partial dependencies — attributes that depend on only part of a composite primary key.',
        check: 'Decompose tables to eliminate partial dependencies on composite keys.',
    },
    {
        id: '3nf',
        name: 'Third Normal Form (3NF)',
        icon: '3️⃣',
        description: 'Remove transitive dependencies — non-key attributes that depend on other non-key attributes.',
        check: 'Decompose tables to eliminate transitive dependencies.',
    },
]

export default function NormalizationLab() {
    const [preset, setPreset] = useState('student')
    const [currentStep, setCurrentStep] = useState(-1)
    const [tables, setTables] = useState([])
    const [isAnimating, setIsAnimating] = useState(false)
    const [explanation, setExplanation] = useState(null)

    const { soundEnabled, speed, addPoints, completeModule } = useSimulationStore()

    const tableData = presetTables[preset]

    const startNormalization = useCallback(() => {
        setCurrentStep(-1)
        setTables([])
        setIsAnimating(true)
        if (soundEnabled) playSound('processing')

        // Step 0: Show original table
        setTimeout(() => {
            setCurrentStep(0)
            setTables([{
                name: tableData.name,
                columns: [...tableData.columns],
                rows: [...tableData.rows],
                pk: tableData.primaryKey.join(', '),
                status: '1NF ✓',
            }])
            setExplanation({
                icon: '1️⃣',
                name: '1NF — Atomic Values',
                description: `The table "${tableData.name}" already has atomic values and unique rows. First Normal Form is satisfied.`,
            })
            if (soundEnabled) playSound('step')
        }, 800 / speed)

        // Step 1: 2NF — split partial deps
        setTimeout(() => {
            setCurrentStep(1)
            if (preset === 'student') {
                setTables([
                    {
                        name: 'Students',
                        columns: ['StudentID', 'StudentName'],
                        rows: [['101', 'Alice'], ['102', 'Bob'], ['103', 'Charlie']],
                        pk: 'StudentID',
                        status: 'New — from partial dep',
                    },
                    {
                        name: 'Courses',
                        columns: ['Course', 'Professor', 'ProfessorEmail'],
                        rows: [['DBMS', 'Dr. Smith', 'smith@uni.edu'], ['OS', 'Dr. Lee', 'lee@uni.edu'], ['CN', 'Dr. Patel', 'patel@uni.edu']],
                        pk: 'Course',
                        status: 'New — from partial dep',
                    },
                    {
                        name: 'Enrollments',
                        columns: ['StudentID', 'Course', 'Grade'],
                        rows: [['101', 'DBMS', 'A'], ['101', 'OS', 'B+'], ['102', 'DBMS', 'A-'], ['103', 'CN', 'B']],
                        pk: 'StudentID, Course',
                        status: 'Remaining attributes',
                    },
                ])
            } else {
                setTables([
                    {
                        name: 'Customers',
                        columns: ['CustomerName', 'CustomerCity'],
                        rows: [['Alice', 'NYC'], ['Bob', 'LA']],
                        pk: 'CustomerName',
                        status: 'Extracted',
                    },
                    {
                        name: 'Orders',
                        columns: ['OrderID', 'CustomerName', 'Product', 'Price', 'Quantity'],
                        rows: [['O1', 'Alice', 'Laptop', '999', '1'], ['O2', 'Bob', 'Phone', '699', '2'], ['O3', 'Alice', 'Tablet', '499', '1']],
                        pk: 'OrderID',
                        status: 'Updated',
                    },
                ])
            }
            setExplanation({
                icon: '2️⃣',
                name: '2NF — Remove Partial Dependencies',
                description: preset === 'student'
                    ? 'StudentName depends only on StudentID (partial dep). Professor depends only on Course. Decomposed into Students, Courses, and Enrollments tables.'
                    : 'CustomerCity depends on CustomerName, not the full key OrderID. Extracted into a Customers table.',
            })
            if (soundEnabled) playSound('step')
        }, 2400 / speed)

        // Step 2: 3NF — remove transitive deps
        setTimeout(() => {
            setCurrentStep(2)
            if (preset === 'student') {
                setTables([
                    {
                        name: 'Students',
                        columns: ['StudentID', 'StudentName'],
                        rows: [['101', 'Alice'], ['102', 'Bob'], ['103', 'Charlie']],
                        pk: 'StudentID',
                        status: '3NF ✓',
                    },
                    {
                        name: 'Professors',
                        columns: ['Professor', 'ProfessorEmail'],
                        rows: [['Dr. Smith', 'smith@uni.edu'], ['Dr. Lee', 'lee@uni.edu'], ['Dr. Patel', 'patel@uni.edu']],
                        pk: 'Professor',
                        status: 'New — transitive dep removed',
                    },
                    {
                        name: 'CourseAssignments',
                        columns: ['Course', 'Professor'],
                        rows: [['DBMS', 'Dr. Smith'], ['OS', 'Dr. Lee'], ['CN', 'Dr. Patel']],
                        pk: 'Course',
                        status: 'Updated',
                    },
                    {
                        name: 'Enrollments',
                        columns: ['StudentID', 'Course', 'Grade'],
                        rows: [['101', 'DBMS', 'A'], ['101', 'OS', 'B+'], ['102', 'DBMS', 'A-'], ['103', 'CN', 'B']],
                        pk: 'StudentID, Course',
                        status: '3NF ✓',
                    },
                ])
            }
            setExplanation({
                icon: '3️⃣',
                name: '3NF — Remove Transitive Dependencies',
                description: preset === 'student'
                    ? 'ProfessorEmail transitively depends on Course through Professor. Extracted into a Professors table. All tables are now in 3NF!'
                    : 'The tables are already in 3NF after the 2NF decomposition. No transitive dependencies remain.',
            })
            if (soundEnabled) playSound('success')
            addPoints(15)
            completeModule('normalization')
            setIsAnimating(false)
        }, 4000 / speed)
    }, [preset, tableData, soundEnabled, speed, addPoints, completeModule])

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">📐</span>
                    Normalization Lab
                </h1>
                <p className="text-white/40 mt-1">Watch tables decompose from 1NF to 3NF step by step</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={preset}
                                onChange={(e) => { setPreset(e.target.value); setCurrentStep(-1); setTables([]) }}
                                className="input-field w-auto font-sans"
                            >
                                <option value="student">Student-Course Table</option>
                                <option value="order">Orders Table</option>
                            </select>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startNormalization} disabled={isAnimating} className="btn-primary disabled:opacity-50">
                                {isAnimating ? '⚙️ Normalizing...' : '▶ Start Normalization'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Original table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 rounded-2xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                            Original Table: {tableData.name}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {tableData.columns.map(col => (
                                            <th key={col} className={`text-left py-2 px-3 font-medium ${tableData.primaryKey.includes(col) ? 'text-neon-blue' : 'text-white/50'
                                                }`}>
                                                {col} {tableData.primaryKey.includes(col) && '🔑'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.rows.map((row, i) => (
                                        <tr key={i} className="border-b border-white/5">
                                            {row.map((cell, j) => (
                                                <td key={j} className="py-2 px-3 text-white/70 font-mono text-xs">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 text-xs text-white/30">
                            Primary Key: <span className="text-neon-blue">{tableData.primaryKey.join(', ')}</span>
                        </div>
                    </motion.div>

                    {/* Normalized tables */}
                    <AnimatePresence mode="wait">
                        {tables.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-bold text-white">
                                    {currentStep === 0 ? '1NF Result' : currentStep === 1 ? '2NF Decomposition' : '3NF Decomposition'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tables.map((table, idx) => (
                                        <motion.div
                                            key={`${table.name}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.15 }}
                                            className="glass-card p-4 rounded-xl border-l-4"
                                            style={{ borderLeftColor: ['#6366f1', '#10b981', '#f97316', '#a855f7'][idx % 4] }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-white text-sm">{table.name}</h4>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                                                    {table.status}
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            {table.columns.map(col => (
                                                                <th key={col} className="text-left py-1.5 px-2 text-white/50 font-medium">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table.rows.map((row, ri) => (
                                                            <tr key={ri} className="border-b border-white/5">
                                                                {row.map((cell, ci) => (
                                                                    <td key={ci} className="py-1.5 px-2 text-white/60 font-mono">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-2 text-xs text-white/30">PK: <span className="text-neon-blue">{table.pk}</span></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    {/* Steps */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Normalization Steps</h3>
                        <div className="space-y-2">
                            {normSteps.map((step, i) => (
                                <div key={step.id} className={`step-indicator ${i < currentStep ? 'step-completed' : i === currentStep ? 'step-active' : 'step-pending'
                                    }`}>
                                    <span>{step.icon}</span>
                                    <span className="text-sm">{step.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <ExplanationPanel step={explanation} stepIndex={currentStep} />

                    {/* Functional deps */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Functional Dependencies</h3>
                        <div className="space-y-1.5">
                            {tableData.functionalDeps.map((fd, i) => (
                                <div key={i} className="text-xs font-mono text-white/50 px-2 py-1.5 rounded bg-white/5">
                                    {fd.from.join(', ')} → {fd.to.join(', ')}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
