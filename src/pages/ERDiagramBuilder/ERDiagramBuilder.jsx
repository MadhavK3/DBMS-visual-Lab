import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

let idCounter = 1
const genId = () => `entity_${idCounter++}`

export default function ERDiagramBuilder() {
    const [entities, setEntities] = useState([])
    const [relationships, setRelationships] = useState([])
    const [selectedEntity, setSelectedEntity] = useState(null)
    const [newEntityName, setNewEntityName] = useState('')
    const [newAttrName, setNewAttrName] = useState('')
    const [newRelName, setNewRelName] = useState('')
    const [relFrom, setRelFrom] = useState('')
    const [relTo, setRelTo] = useState('')
    const [relCardinality, setRelCardinality] = useState('1:N')
    const [generatedSQL, setGeneratedSQL] = useState('')
    const [explanation, setExplanation] = useState(null)
    const [dragging, setDragging] = useState(null)
    const canvasRef = useRef(null)

    const { soundEnabled, addPoints, completeModule } = useSimulationStore()

    const addEntity = useCallback(() => {
        if (!newEntityName.trim()) return
        const entity = {
            id: genId(),
            name: newEntityName.trim(),
            attributes: [{ name: `${newEntityName.trim()}ID`, isPK: true }],
            x: 100 + Math.random() * 400,
            y: 100 + Math.random() * 200,
        }
        setEntities(prev => [...prev, entity])
        setNewEntityName('')
        setExplanation({
            icon: '📦',
            name: `Entity: ${entity.name}`,
            description: `Created entity "${entity.name}" with auto-generated primary key "${entity.attributes[0].name}".`,
        })
        if (soundEnabled) playSound('success')
        addPoints(5)
    }, [newEntityName, soundEnabled, addPoints])

    const addAttribute = useCallback(() => {
        if (!selectedEntity || !newAttrName.trim()) return
        setEntities(prev =>
            prev.map(e =>
                e.id === selectedEntity
                    ? { ...e, attributes: [...e.attributes, { name: newAttrName.trim(), isPK: false }] }
                    : e
            )
        )
        setNewAttrName('')
        if (soundEnabled) playSound('click')
    }, [selectedEntity, newAttrName, soundEnabled])

    const addRelationship = useCallback(() => {
        if (!relFrom || !relTo || !newRelName.trim()) return
        const rel = {
            id: genId(),
            name: newRelName.trim(),
            from: relFrom,
            to: relTo,
            cardinality: relCardinality,
        }
        setRelationships(prev => [...prev, rel])
        setNewRelName('')
        setExplanation({
            icon: '🔗',
            name: `Relationship: ${rel.name}`,
            description: `Created ${relCardinality} relationship "${rel.name}" between ${entities.find(e => e.id === relFrom)?.name} and ${entities.find(e => e.id === relTo)?.name}.`,
        })
        if (soundEnabled) playSound('success')
        addPoints(5)
    }, [relFrom, relTo, newRelName, relCardinality, entities, soundEnabled, addPoints])

    const generateSQL = useCallback(() => {
        if (entities.length === 0) return
        let sql = '-- Generated SQL Schema\n\n'

        entities.forEach(entity => {
            sql += `CREATE TABLE ${entity.name} (\n`
            entity.attributes.forEach((attr, i) => {
                sql += `  ${attr.name} ${attr.isPK ? 'INT PRIMARY KEY' : 'VARCHAR(255)'}`
                if (i < entity.attributes.length - 1) sql += ','
                sql += '\n'
            })
            // Add foreign keys from relationships
            const rels = relationships.filter(r => r.to === entity.id)
            rels.forEach(rel => {
                const fromEntity = entities.find(e => e.id === rel.from)
                if (fromEntity) {
                    const fkName = `${fromEntity.name}ID`
                    sql += `  , ${fkName} INT REFERENCES ${fromEntity.name}(${fromEntity.attributes.find(a => a.isPK)?.name || fkName})\n`
                }
            })
            sql += ');\n\n'
        })

        // Junction tables for M:N
        relationships.filter(r => r.cardinality === 'M:N').forEach(rel => {
            const from = entities.find(e => e.id === rel.from)
            const to = entities.find(e => e.id === rel.to)
            if (from && to) {
                sql += `CREATE TABLE ${rel.name} (\n`
                sql += `  ${from.name}ID INT REFERENCES ${from.name}(${from.attributes.find(a => a.isPK)?.name}),\n`
                sql += `  ${to.name}ID INT REFERENCES ${to.name}(${to.attributes.find(a => a.isPK)?.name}),\n`
                sql += `  PRIMARY KEY (${from.name}ID, ${to.name}ID)\n`
                sql += ');\n\n'
            }
        })

        setGeneratedSQL(sql)
        setExplanation({
            icon: '💾',
            name: 'SQL Schema Generated',
            description: `Generated CREATE TABLE statements for ${entities.length} entit${entities.length === 1 ? 'y' : 'ies'} and ${relationships.length} relationship(s).`,
        })
        if (soundEnabled) playSound('success')
        addPoints(20)
        completeModule('er-builder')
    }, [entities, relationships, soundEnabled, addPoints, completeModule])

    const loadPreset = () => {
        const students = { id: genId(), name: 'Students', attributes: [{ name: 'StudentID', isPK: true }, { name: 'Name', isPK: false }, { name: 'Email', isPK: false }], x: 120, y: 150 }
        const courses = { id: genId(), name: 'Courses', attributes: [{ name: 'CourseID', isPK: true }, { name: 'Title', isPK: false }, { name: 'Credits', isPK: false }], x: 500, y: 150 }
        setEntities([students, courses])
        setRelationships([{
            id: genId(),
            name: 'Enrollment',
            from: students.id,
            to: courses.id,
            cardinality: 'M:N',
        }])
        setExplanation({
            icon: '📦',
            name: 'Preset Loaded',
            description: 'Loaded Students-Courses ER diagram with M:N "Enrollment" relationship.',
        })
        if (soundEnabled) playSound('success')
    }

    // Draw ER diagram
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const rect = canvas.parentElement.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = 400

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (entities.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)'
            ctx.textAlign = 'center'
            ctx.font = '16px Inter'
            ctx.fillText('Add entities to build your ER diagram', canvas.width / 2, 200)
            return
        }

        // Draw relationships (lines)
        relationships.forEach(rel => {
            const from = entities.find(e => e.id === rel.from)
            const to = entities.find(e => e.id === rel.to)
            if (!from || !to) return

            ctx.strokeStyle = '#6366f180'
            ctx.lineWidth = 2
            ctx.setLineDash([])
            ctx.beginPath()
            ctx.moveTo(from.x, from.y)

            // Diamond in the middle
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2

            ctx.lineTo(mx, my)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(mx, my)
            ctx.lineTo(to.x, to.y)
            ctx.stroke()

            // Relationship diamond
            const dSize = 30
            ctx.fillStyle = 'rgba(168,85,247,0.2)'
            ctx.strokeStyle = '#a855f7'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(mx, my - dSize)
            ctx.lineTo(mx + dSize, my)
            ctx.lineTo(mx, my + dSize)
            ctx.lineTo(mx - dSize, my)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            // Relationship name
            ctx.fillStyle = '#e2e8f0'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = '11px Inter'
            ctx.fillText(rel.name, mx, my)

            // Cardinality labels
            ctx.fillStyle = '#a855f7'
            ctx.font = 'bold 12px JetBrains Mono'
            const p = rel.cardinality.split(':')
            ctx.fillText(p[0], from.x + (mx - from.x) * 0.3, from.y + (my - from.y) * 0.3 - 10)
            ctx.fillText(p[1], to.x + (mx - to.x) * 0.3, to.y + (my - to.y) * 0.3 - 10)
        })

        // Draw entities
        entities.forEach(entity => {
            const isSelected = entity.id === selectedEntity
            const w = 120
            const h = 30 + entity.attributes.length * 18

            // Entity rectangle
            ctx.fillStyle = isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.1)'
            ctx.strokeStyle = isSelected ? '#818cf8' : '#6366f150'
            ctx.lineWidth = isSelected ? 2.5 : 1.5
            ctx.beginPath()
            ctx.roundRect(entity.x - w / 2, entity.y - h / 2, w, h, 8)
            ctx.fill()
            ctx.stroke()

            // Entity name
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.font = 'bold 13px Inter'
            ctx.fillText(entity.name, entity.x, entity.y - h / 2 + 8)

            // Separator
            ctx.strokeStyle = '#6366f130'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(entity.x - w / 2 + 8, entity.y - h / 2 + 26)
            ctx.lineTo(entity.x + w / 2 - 8, entity.y - h / 2 + 26)
            ctx.stroke()

            // Attributes
            ctx.font = '11px JetBrains Mono'
            ctx.textAlign = 'center'
            entity.attributes.forEach((attr, i) => {
                const ay = entity.y - h / 2 + 34 + i * 18
                ctx.fillStyle = attr.isPK ? '#00d4ff' : '#94a3b8'
                const prefix = attr.isPK ? '🔑 ' : '   '
                ctx.fillText(prefix + attr.name, entity.x, ay)
                if (attr.isPK) {
                    // Underline PK
                    const tw = ctx.measureText(prefix + attr.name).width
                    ctx.strokeStyle = '#00d4ff40'
                    ctx.beginPath()
                    ctx.moveTo(entity.x - tw / 2, ay + 12)
                    ctx.lineTo(entity.x + tw / 2, ay + 12)
                    ctx.stroke()
                }
            })

            // Draw attribute ellipses connected to entity
            // (Optional: show as decorations outside the box)
        })
    }, [entities, relationships, selectedEntity])

    // Handle canvas click to select entities
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const clicked = entities.find(entity => {
            const w = 120, h = 30 + entity.attributes.length * 18
            return x >= entity.x - w / 2 && x <= entity.x + w / 2 && y >= entity.y - h / 2 && y <= entity.y + h / 2
        })

        setSelectedEntity(clicked ? clicked.id : null)
        if (clicked && soundEnabled) playSound('click')
    }

    // Handle dragging
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const clicked = entities.find(entity => {
            const w = 120, h = 30 + entity.attributes.length * 18
            return x >= entity.x - w / 2 && x <= entity.x + w / 2 && y >= entity.y - h / 2 && y <= entity.y + h / 2
        })

        if (clicked) {
            setDragging({ id: clicked.id, offsetX: x - clicked.x, offsetY: y - clicked.y })
            setSelectedEntity(clicked.id)
        }
    }

    const handleMouseMove = (e) => {
        if (!dragging) return
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setEntities(prev =>
            prev.map(entity =>
                entity.id === dragging.id
                    ? { ...entity, x: x - dragging.offsetX, y: y - dragging.offsetY }
                    : entity
            )
        )
    }

    const handleMouseUp = () => setDragging(null)

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🔗</span>
                    ER Diagram Builder
                </h1>
                <p className="text-white/40 mt-1">Drag-and-drop entities, add relationships, and auto-generate SQL</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Add Entity */}
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Add Entity</label>
                                <div className="flex gap-2">
                                    <input
                                        value={newEntityName}
                                        onChange={(e) => setNewEntityName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addEntity()}
                                        className="input-field text-sm flex-1"
                                        placeholder="Entity name..."
                                    />
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addEntity} className="btn-primary text-sm px-4">
                                        ➕
                                    </motion.button>
                                </div>
                            </div>

                            {/* Add Attribute */}
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">
                                    Add Attribute {selectedEntity ? `to ${entities.find(e => e.id === selectedEntity)?.name}` : '(select entity)'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={newAttrName}
                                        onChange={(e) => setNewAttrName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addAttribute()}
                                        className="input-field text-sm flex-1"
                                        placeholder="Attribute name..."
                                        disabled={!selectedEntity}
                                    />
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addAttribute} disabled={!selectedEntity} className="btn-secondary text-sm px-4 disabled:opacity-30">
                                        ➕
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Add Relationship */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Add Relationship</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)} className="input-field w-auto text-sm font-sans">
                                    <option value="">From...</option>
                                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <input value={newRelName} onChange={(e) => setNewRelName(e.target.value)} className="input-field w-32 text-sm" placeholder="Rel name..." />
                                <select value={relTo} onChange={(e) => setRelTo(e.target.value)} className="input-field w-auto text-sm font-sans">
                                    <option value="">To...</option>
                                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <select value={relCardinality} onChange={(e) => setRelCardinality(e.target.value)} className="input-field w-auto text-sm font-sans">
                                    <option value="1:1">1:1</option>
                                    <option value="1:N">1:N</option>
                                    <option value="M:N">M:N</option>
                                </select>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addRelationship} className="btn-secondary text-sm">
                                    Add
                                </motion.button>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={loadPreset} className="btn-secondary text-sm">
                                📦 Load Demo
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateSQL} disabled={entities.length === 0} className="btn-primary text-sm disabled:opacity-50">
                                💾 Generate SQL
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Canvas */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="simulation-container rounded-2xl cursor-crosshair">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">ER Diagram Canvas</h3>
                        <div className="relative w-full" style={{ minHeight: 400 }}>
                            <canvas
                                ref={canvasRef}
                                className="w-full rounded-lg"
                                style={{ height: 400 }}
                                onClick={handleCanvasClick}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            />
                        </div>
                        <div className="flex items-center gap-6 mt-3 text-xs text-white/40">
                            <span>Click entity to select • Drag to move</span>
                        </div>
                    </motion.div>

                    {/* Generated SQL */}
                    {generatedSQL && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-2xl">
                            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Generated SQL Schema</h3>
                            <pre className="text-sm font-mono text-neon-green bg-black/30 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                {generatedSQL}
                            </pre>
                        </motion.div>
                    )}
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    <ExplanationPanel step={explanation} stepIndex={0} />

                    {/* Entities list */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Entities</h3>
                        <div className="space-y-2">
                            {entities.length === 0 ? (
                                <p className="text-xs text-white/20 italic">No entities yet</p>
                            ) : (
                                entities.map(entity => (
                                    <div
                                        key={entity.id}
                                        onClick={() => { setSelectedEntity(entity.id); if (soundEnabled) playSound('click') }}
                                        className={`p-2.5 rounded-lg cursor-pointer text-sm transition-all ${selectedEntity === entity.id
                                                ? 'bg-primary-500/20 border border-primary-500/30'
                                                : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-semibold text-white">{entity.name}</div>
                                        <div className="text-xs text-white/40 mt-1">
                                            {entity.attributes.map(a => a.name).join(', ')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Relationships list */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Relationships</h3>
                        <div className="space-y-1.5">
                            {relationships.length === 0 ? (
                                <p className="text-xs text-white/20 italic">No relationships yet</p>
                            ) : (
                                relationships.map(rel => (
                                    <div key={rel.id} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 flex items-center gap-2">
                                        <span className="text-neon-purple font-medium">{rel.name}</span>
                                        <span className="text-white/30">
                                            {entities.find(e => e.id === rel.from)?.name} → {entities.find(e => e.id === rel.to)?.name}
                                        </span>
                                        <span className="ml-auto text-primary-400 font-mono">{rel.cardinality}</span>
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
