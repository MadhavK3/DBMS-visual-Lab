import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../../store/useSimulationStore'
import { playSound } from '../../sound/soundManager'
import ExplanationPanel from '../../components/ExplanationPanel/ExplanationPanel'

let idCounter = 1
const genId = () => `node_${idCounter++}`

export default function ERDiagramBuilder() {
    const [entities, setEntities] = useState([])
    const [relationships, setRelationships] = useState([])
    // Universal Selected Node: { type: 'entity'|'attribute'|'relationship', id, entityId? }
    const [selectedNode, setSelectedNode] = useState(null)
    const [newEntityName, setNewEntityName] = useState('')
    const [newAttrName, setNewAttrName] = useState('')
    const [newRelName, setNewRelName] = useState('')
    const [relFrom, setRelFrom] = useState('')
    const [relTo, setRelTo] = useState('')
    const [relCardinality, setRelCardinality] = useState('1:N')
    const [generatedSQL, setGeneratedSQL] = useState('')
    const [explanation, setExplanation] = useState(null)
    const [dragging, setDragging] = useState(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const canvasRef = useRef(null)

    // Resize listener to robustly handle fullscreen swaps
    useEffect(() => {
        const handleResize = () => setEntities(e => [...e])
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const { soundEnabled, addPoints, completeModule } = useSimulationStore()

    const addEntity = useCallback(() => {
        if (!newEntityName.trim()) return
        const entity = {
            id: genId(),
            name: newEntityName.trim(),
            attributes: [{ id: genId(), name: `${newEntityName.trim()}ID`, isPK: true, dx: 0, dy: 0 }],
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
        const pId = selectedNode?.type === 'entity' ? selectedNode.id : null;
        if (!pId || !newAttrName.trim()) return
        setEntities(prev =>
            prev.map(e =>
                e.id === pId
                    ? { ...e, attributes: [...e.attributes, { id: genId(), name: newAttrName.trim(), isPK: false, dx: 0, dy: 0 }] }
                    : e
            )
        )
        setNewAttrName('')
        if (soundEnabled) playSound('click')
    }, [selectedNode, newAttrName, soundEnabled])

    const addRelationship = useCallback(() => {
        if (!relFrom || !relTo || !newRelName.trim()) return
        const rel = {
            id: genId(),
            name: newRelName.trim(),
            from: relFrom,
            to: relTo,
            cardinality: relCardinality,
            dx: 0,
            dy: 0
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

    const deleteNode = () => {
        if (!selectedNode) return;
        if (selectedNode.type === 'entity') {
            setEntities(prev => prev.filter(e => e.id !== selectedNode.id));
            setRelationships(prev => prev.filter(r => r.from !== selectedNode.id && r.to !== selectedNode.id));
        } else if (selectedNode.type === 'relationship') {
            setRelationships(prev => prev.filter(r => r.id !== selectedNode.id));
        } else if (selectedNode.type === 'attribute') {
            setEntities(prev => prev.map(e => {
                if (e.id === selectedNode.entityId) {
                    return { ...e, attributes: e.attributes.filter(a => a.id !== selectedNode.id) };
                }
                return e;
            }));
        }
        setSelectedNode(null);
        if (soundEnabled) playSound('success');
    };

    const updateNodeName = (newName) => {
        if (!selectedNode) return;
        if (selectedNode.type === 'entity') {
            setEntities(prev => prev.map(e => e.id === selectedNode.id ? { ...e, name: newName } : e));
        } else if (selectedNode.type === 'relationship') {
            setRelationships(prev => prev.map(r => r.id === selectedNode.id ? { ...r, name: newName } : r));
        } else if (selectedNode.type === 'attribute') {
            setEntities(prev => prev.map(e => {
                if (e.id === selectedNode.entityId) {
                    return { ...e, attributes: e.attributes.map(a => a.id === selectedNode.id ? { ...a, name: newName } : a) };
                }
                return e;
            }));
        }
    };

    const generateSQL = useCallback(() => {
        if (entities.length === 0) return
        let sql = '-- Generated SQL Schema\n\n'

        entities.forEach(entity => {
            sql += `CREATE TABLE ${entity.name} (\n`
            entity.attributes.forEach((attr, i) => {
                sql += `  ${attr.name.replace(/\s+/g, '_')} ${attr.isPK ? 'INT PRIMARY KEY' : 'VARCHAR(255)'}`
                if (i < entity.attributes.length - 1) sql += ','
                sql += '\n'
            })
            // Add foreign keys from relationships (excluding M:N)
            const rels = relationships.filter(r => r.to === entity.id && r.cardinality !== 'M:N')
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
                sql += `CREATE TABLE ${rel.name.replace(/\s+/g, '_')} (\n`
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

    const loadPreset = (type = 'university') => {
        if (type === 'university') {
            const students = { id: genId(), name: 'Students', attributes: [{ id: genId(), name: 'StudentID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Name', isPK: false, dx: 0, dy: 0 }, { id: genId(), name: 'Email', isPK: false, dx: 0, dy: 0 }], x: 120, y: 150 }
            const courses = { id: genId(), name: 'Courses', attributes: [{ id: genId(), name: 'CourseID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Title', isPK: false, dx: 0, dy: 0 }, { id: genId(), name: 'Credits', isPK: false, dx: 0, dy: 0 }], x: 500, y: 150 }
            setEntities([students, courses])
            setRelationships([{ id: genId(), name: 'Enrollment', from: students.id, to: courses.id, cardinality: 'M:N', dx: 0, dy: 0 }])
            setExplanation({ icon: '📦', name: 'University Demo', description: 'Loaded Students-Courses schema.' })
        } else if (type === 'ecommerce') {
            const customer = { id: genId(), name: 'Customer', attributes: [{ id: genId(), name: 'CustomerID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Name', isPK: false, dx: 0, dy: 0 }], x: 120, y: 100 }
            const order = { id: genId(), name: 'Orders', attributes: [{ id: genId(), name: 'OrderID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Date', isPK: false, dx: 0, dy: 0 }], x: 350, y: 100 }
            const product = { id: genId(), name: 'Product', attributes: [{ id: genId(), name: 'ProductID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Name', isPK: false, dx: 0, dy: 0 }, { id: genId(), name: 'Price', isPK: false, dx: 0, dy: 0 }], x: 580, y: 250 }
            setEntities([customer, order, product])
            setRelationships([
                { id: genId(), name: 'Places', from: customer.id, to: order.id, cardinality: '1:N', dx: 0, dy: 0 },
                { id: genId(), name: 'Contains', from: order.id, to: product.id, cardinality: 'M:N', dx: 0, dy: 0 }
            ])
            setExplanation({ icon: '🛒', name: 'E-Commerce Demo', description: 'Loaded Customer, Orders, and Products mapping typical online retail.' })
        } else if (type === 'hospital') {
            const patient = { id: genId(), name: 'Patient', attributes: [{ id: genId(), name: 'PatientID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Name', isPK: false, dx: 0, dy: 0 }, { id: genId(), name: 'Age', isPK: false, dx: 0, dy: 0 }], x: 150, y: 150 }
            const doctor = { id: genId(), name: 'Doctor', attributes: [{ id: genId(), name: 'DoctorID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Name', isPK: false, dx: 0, dy: 0 }, { id: genId(), name: 'Specialty', isPK: false, dx: 0, dy: 0 }], x: 550, y: 150 }
            const appt = { id: genId(), name: 'Appointment', attributes: [{ id: genId(), name: 'ApptID', isPK: true, dx: 0, dy: 0 }, { id: genId(), name: 'Date', isPK: false, dx: 0, dy: 0 }], x: 350, y: 300 }
            setEntities([patient, doctor, appt])
            setRelationships([
                { id: genId(), name: 'Books', from: patient.id, to: appt.id, cardinality: '1:N', dx: 0, dy: 0 },
                { id: genId(), name: 'Attends', from: doctor.id, to: appt.id, cardinality: '1:N', dx: 0, dy: 0 }
            ])
            setExplanation({ icon: '🏥', name: 'Hospital Demo', description: 'Loaded Patient, Doctor, and Appointment schema.' })
        }
        if (soundEnabled) playSound('success')
        setSelectedNode(null)
    }

    // Function to calculate node intersections map helper
    const getNodeAtPosition = (x, y) => {
        // 1. Check Attributes
        for (const entity of entities) {
            const radius = 80;
            for (let i = 0; i < entity.attributes.length; i++) {
                const attr = entity.attributes[i];
                const angle = (Math.PI * 2 / entity.attributes.length) * i - Math.PI / 2;
                const ax = entity.x + Math.cos(angle) * radius + (attr.dx || 0);
                const ay = entity.y + Math.sin(angle) * radius + (attr.dy || 0);
                if (Math.abs(x - ax) < 35 && Math.abs(y - ay) < 18) {
                    return { type: 'attribute', id: attr.id, entityId: entity.id, offsetX: x - ax, offsetY: y - ay };
                }
            }
        }
        // 2. Check Relationships
        for (const rel of relationships) {
            const from = entities.find(e => e.id === rel.from)
            const to = entities.find(e => e.id === rel.to)
            if (!from || !to) continue;
            const rx = (from.x + to.x) / 2 + (rel.dx || 0);
            const ry = (from.y + to.y) / 2 + (rel.dy || 0);
            if (Math.abs(x - rx) < 30 && Math.abs(y - ry) < 30) {
                return { type: 'relationship', id: rel.id, offsetX: x - rx, offsetY: y - ry };
            }
        }
        // 3. Check Entities
        for (const entity of entities) {
            const w = 120, h = 40
            if (x >= entity.x - w / 2 && x <= entity.x + w / 2 && y >= entity.y - h / 2 && y <= entity.y + h / 2) {
                return { type: 'entity', id: entity.id, offsetX: x - entity.x, offsetY: y - entity.y };
            }
        }
        return null;
    }

    // Draw ER diagram
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const updateSize = () => {
            const rect = canvas.parentElement.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = isFullscreen ? rect.height : 400
        }
        updateSize()

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
            
            const isRelSelected = selectedNode?.type === 'relationship' && selectedNode.id === rel.id;

            ctx.strokeStyle = isRelSelected ? '#ffffff' : '#6366f180'
            ctx.lineWidth = isRelSelected ? 3 : 2
            ctx.setLineDash([])
            ctx.beginPath()
            ctx.moveTo(from.x, from.y)

            // Diamond offset positions
            const baseMX = (from.x + to.x) / 2
            const baseMY = (from.y + to.y) / 2
            const mx = baseMX + (rel.dx || 0)
            const my = baseMY + (rel.dy || 0)

            ctx.lineTo(mx, my)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(mx, my)
            ctx.lineTo(to.x, to.y)
            ctx.stroke()

            // Relationship diamond
            const dSize = 30
            ctx.fillStyle = isRelSelected ? 'rgba(168,85,247,0.4)': 'rgba(168,85,247,0.2)'
            ctx.strokeStyle = isRelSelected ? '#ffffff' : '#a855f7'
            ctx.lineWidth = isRelSelected ? 2.5 : 2
            ctx.beginPath()
            ctx.moveTo(mx, my - dSize)
            ctx.lineTo(mx + dSize, my)
            ctx.lineTo(mx, my + dSize)
            ctx.lineTo(mx - dSize, my)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            // Relationship name
            ctx.fillStyle = isRelSelected ? '#ffffff' : '#e2e8f0'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = isRelSelected ? 'bold 12px Inter' : '11px Inter'
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
            const isSelected = selectedNode?.type === 'entity' && entity.id === selectedNode.id
            const w = 120
            const h = 40 // Fixed height for entity rect

            // Entity rectangle
            ctx.fillStyle = isSelected ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.1)'
            ctx.strokeStyle = isSelected ? '#ffffff' : '#6366f150'
            ctx.lineWidth = isSelected ? 3 : 1.5
            ctx.beginPath()
            ctx.roundRect(entity.x - w / 2, entity.y - h / 2, w, h, 8)
            ctx.fill()
            ctx.stroke()

            // Entity name
            ctx.fillStyle = isSelected ? '#ffffff' : '#f8fafc'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = 'bold 13px Inter'
            ctx.fillText(entity.name, entity.x, entity.y)

            // Attributes (Ovals)
            ctx.font = '11px JetBrains Mono'
            ctx.textAlign = 'center'
            
            const radius = 80;
            entity.attributes.forEach((attr, i) => {
                const isAttrSelected = selectedNode?.type === 'attribute' && selectedNode.id === attr.id;

                const angle = (Math.PI * 2 / entity.attributes.length) * i - Math.PI / 2;
                const ax = entity.x + Math.cos(angle) * radius + (attr.dx || 0);
                const ay = entity.y + Math.sin(angle) * radius + (attr.dy || 0);
                
                // Draw connecting line
                ctx.strokeStyle = isAttrSelected ? '#ffffff' : '#6366f150';
                ctx.lineWidth = isAttrSelected ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(entity.x, entity.y);
                ctx.lineTo(ax, ay);
                ctx.stroke();

                // Draw Oval
                ctx.fillStyle = attr.isPK ? 'rgba(0, 212, 255, 0.15)' : 'rgba(148, 163, 184, 0.1)';
                if (isAttrSelected) ctx.fillStyle = 'rgba(255,255,255,0.2)';
                
                ctx.strokeStyle = isAttrSelected ? '#ffffff' : (attr.isPK ? '#00d4ff' : '#94a3b8');
                ctx.lineWidth = isAttrSelected ? 2.5 : (attr.isPK ? 2 : 1);
                ctx.beginPath();
                ctx.ellipse(ax, ay, 35, 18, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                // Draw Text
                ctx.fillStyle = isAttrSelected ? '#ffffff' : (attr.isPK ? '#00d4ff' : '#cbd5e1');
                ctx.fillText(attr.name, ax, ay);
                if (attr.isPK) {
                    const tw = ctx.measureText(attr.name).width;
                    ctx.beginPath();
                    ctx.moveTo(ax - tw/2, ay + 8);
                    ctx.lineTo(ax + tw/2, ay + 8);
                    ctx.stroke();
                }
            })
        })
    }, [entities, relationships, selectedNode, isFullscreen])

    // Handle canvas click to select explicitly
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const hit = getNodeAtPosition(x, y);
        
        setSelectedNode(hit ? { type: hit.type, id: hit.id, entityId: hit.entityId } : null)
        if (hit && soundEnabled) playSound('click')
    }

    // Handle dragging initiation
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const hit = getNodeAtPosition(x, y);
        if (hit) {
            setDragging(hit)
            setSelectedNode({ type: hit.type, id: hit.id, entityId: hit.entityId })
        }
    }

    const handleDragUpdate = (x, y) => {
        if (dragging.type === 'entity') {
            setEntities(prev =>
                prev.map(entity =>
                    entity.id === dragging.id
                        ? { ...entity, x: x - dragging.offsetX, y: y - dragging.offsetY }
                        : entity
                )
            )
        } else if (dragging.type === 'relationship') {
            const rel = relationships.find(r => r.id === dragging.id);
            if (!rel) return;
            const from = entities.find(en => en.id === rel.from);
            const to = entities.find(en => en.id === rel.to);
            if (!from || !to) return;
            
            const baseMX = (from.x + to.x) / 2;
            const baseMY = (from.y + to.y) / 2;
            const nx = x - dragging.offsetX;
            const ny = y - dragging.offsetY;
            
            setRelationships(prev => prev.map(r => r.id === dragging.id ? { ...r, dx: nx - baseMX, dy: ny - baseMY } : r));
        } else if (dragging.type === 'attribute') {
            const entity = entities.find(en => en.id === dragging.entityId);
            if (!entity) return;
            const attrIdx = entity.attributes.findIndex(a => a.id === dragging.id);
            const angle = (Math.PI * 2 / entity.attributes.length) * attrIdx - Math.PI / 2;
            const baseAX = entity.x + Math.cos(angle) * 80;
            const baseAY = entity.y + Math.sin(angle) * 80;
            const nx = x - dragging.offsetX;
            const ny = y - dragging.offsetY;
            
            setEntities(prev => prev.map(en => en.id === dragging.entityId ? {
                ...en, attributes: en.attributes.map(a => a.id === dragging.id ? { ...a, dx: nx - baseAX, dy: ny - baseAY } : a)
            } : en));
        }
    }

    const handleMouseMove = (e) => {
        if (!dragging) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        handleDragUpdate(e.clientX - rect.left, e.clientY - rect.top);
    }

    const handleTouchStart = (e) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const hit = getNodeAtPosition(x, y);
        if (hit) {
            // Passive override hook targeting actual elements
            if (e.cancelable) e.preventDefault();
            setDragging(hit);
            setSelectedNode({ type: hit.type, id: hit.id, entityId: hit.entityId });
            if (soundEnabled) playSound('click');
        } else {
            setSelectedNode(null);
        }
    }

    const handleTouchMove = (e) => {
        if (!dragging) return;
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        handleDragUpdate(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    const handleMouseUp = () => setDragging(null)

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🔗</span>
                    ER Diagram Builder
                </h1>
                <p className="text-white/40 mt-1">Drag-and-drop entities, slide relationships and attributes to arrange.</p>
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
                                    Add Attribute {selectedNode?.type === 'entity' ? `to (${entities.find(e => e.id === selectedNode.id)?.name})` : '(select entity first)'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={newAttrName}
                                        onChange={(e) => setNewAttrName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addAttribute()}
                                        className="input-field text-sm flex-1"
                                        placeholder="Attribute name..."
                                        disabled={selectedNode?.type !== 'entity'}
                                    />
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addAttribute} disabled={selectedNode?.type !== 'entity'} className="btn-secondary text-sm px-4 disabled:opacity-30">
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
                            <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => loadPreset('university')} className="px-3 py-1.5 text-xs text-white/50 hover:text-white/90 transition-colors">
                                    🎓 Univ Demo
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => loadPreset('ecommerce')} className="px-3 py-1.5 text-xs text-white/50 hover:text-white/90 transition-colors">
                                    🛒 Shop Demo
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => loadPreset('hospital')} className="px-3 py-1.5 text-xs text-white/50 hover:text-white/90 transition-colors">
                                    🏥 Hosp Demo
                                </motion.button>
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateSQL} disabled={entities.length === 0} className="btn-primary text-sm disabled:opacity-50">
                                💾 Generate SQL
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Canvas */}
                    <div className={isFullscreen ? "fixed inset-0 z-50 bg-[#0f1117] p-2 sm:p-6 flex flex-col items-center justify-center backdrop-blur-md" : ""}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`simulation-container rounded-2xl cursor-crosshair w-full ${isFullscreen ? 'flex-1 border border-white/10 p-4 max-w-7xl mx-auto shadow-2xl flex flex-col' : ''}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">ER Diagram Canvas</h3>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-white/60 hover:text-white flex items-center gap-2">
                                    {isFullscreen ? '↙️ Exit Fullscreen' : '↗️ Maximize'}
                                </button>
                            </div>
                            <div className={`relative w-full overflow-auto scrollbar-hide ${isFullscreen ? 'flex-1' : ''}`} style={{ height: isFullscreen ? '100%' : 400 }}>
                                <canvas
                                    ref={canvasRef}
                                    className={`w-full rounded-lg min-w-[600px] ${isFullscreen ? 'h-full' : ''}`}
                                    style={{ height: isFullscreen ? '100%' : 400, touchAction: 'pan-x pan-y' }}
                                    onClick={handleCanvasClick}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleMouseUp}
                                    onTouchCancel={handleMouseUp}
                                />
                            </div>
                            <div className="flex items-center gap-6 mt-3 text-xs text-white/40">
                                <span>Click element to edit • Drag to move</span>
                            </div>
                        </motion.div>
                    </div>

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

                    {/* Editor Panel */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 rounded-xl border border-white/10">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Property Editor</h3>
                        {selectedNode ? (() => {
                            let nodeTitle = '';
                            let nodeData = null;
                            if (selectedNode.type === 'entity') {
                                nodeData = entities.find(e => e.id === selectedNode.id);
                                nodeTitle = 'Entity';
                            } else if (selectedNode.type === 'relationship') {
                                nodeData = relationships.find(r => r.id === selectedNode.id);
                                nodeTitle = 'Relationship';
                            } else if (selectedNode.type === 'attribute') {
                                const en = entities.find(e => e.id === selectedNode.entityId);
                                nodeData = en?.attributes.find(a => a.id === selectedNode.id);
                                nodeTitle = 'Attribute';
                            }
                            if (!nodeData) return <p className="text-xs text-white/20 italic">Node explicitly deleted or missing</p>;

                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-xl">{selectedNode.type === 'entity' ? '📦' : selectedNode.type === 'attribute' ? '⚪' : '🔗'}</span>
                                        <span className="text-white font-medium">{nodeTitle} Base Options</span>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Name</label>
                                        <input 
                                            value={nodeData.name || ''} 
                                            onChange={(e) => updateNodeName(e.target.value)}
                                            className="input-field w-full text-sm"
                                        />
                                    </div>

                                    {selectedNode.type === 'attribute' && (
                                        <div className="flex items-center gap-2 mt-2 bg-white/5 p-3 rounded-lg">
                                            <input 
                                                type="checkbox" 
                                                checked={nodeData.isPK} 
                                                onChange={(e) => {
                                                    setEntities(prev => prev.map(en => en.id === selectedNode.entityId ? {
                                                        ...en, attributes: en.attributes.map(a => a.id === selectedNode.id ? { ...a, isPK: e.target.checked } : a)
                                                    } : en));
                                                }}
                                                className="w-4 h-4 text-primary-500 rounded border-white/20 bg-white/10"
                                            />
                                            <label className="text-sm text-white/70">Mark as Primary Key</label>
                                        </div>
                                    )}

                                    {selectedNode.type === 'relationship' && (
                                        <div className="mt-2 bg-white/5 p-3 rounded-lg">
                                            <label className="text-xs text-white/40 block mb-1">Cardinality Link Type</label>
                                            <select 
                                                value={nodeData.cardinality} 
                                                onChange={(e) => {
                                                    setRelationships(prev => prev.map(r => r.id === selectedNode.id ? { ...r, cardinality: e.target.value } : r));
                                                }}
                                                className="input-field w-full text-sm font-sans"
                                            >
                                                <option value="1:1">1:1</option>
                                                <option value="1:N">1:N</option>
                                                <option value="M:N">M:N</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-white/10 mt-3">
                                        <button onClick={deleteNode} className="w-full btn-secondary bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm py-2 flex justify-center items-center gap-2 overflow-hidden shadow-lg shadow-red-500/5 hover:shadow-red-500/10 transition-all">
                                            🗑️ Delete Document
                                        </button>
                                        <span className="text-[10px] text-white/20 mt-2 block text-center">Warning: Deletes are immediate & irreversible</span>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-teal-500/10 bg-teal-500/5 rounded-xl border-dashed">
                                <span className="text-2xl mb-2 opacity-50">🖱️</span>
                                <p className="text-sm text-white/40">Select an entity, attribute, or relationship canvas node to modify settings.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
