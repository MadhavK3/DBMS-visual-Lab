import { motion, AnimatePresence } from 'framer-motion'
import { useNormalizationStore } from '../store/useNormalizationStore'

/**
 * DependencyArrows — SVG arrows visualization
 * Shows functional dependencies as animated arrows.
 * Uses a self-contained layout since connecting real DOM tables
 * is complex. Instead, renders a dedicated dependency diagram.
 */
export default function DependencyArrows({ fds, primaryKey, columns, compact = false }) {
  if (!fds || fds.length === 0) return null

  const pkSet = new Set(primaryKey)

  // Classify FDs
  const classifiedFds = fds.map(fd => {
    const isPartial = fd.from.length < primaryKey.length &&
      fd.from.every(a => pkSet.has(a)) &&
      fd.to.some(a => !pkSet.has(a))

    const isTransitive = fd.from.every(a => !pkSet.has(a)) &&
      fd.to.every(a => !pkSet.has(a))

    return {
      ...fd,
      type: isPartial ? 'partial' : isTransitive ? 'transitive' : 'full',
      color: isPartial ? '#F59E0B' : isTransitive ? '#EF4444' : '#10B981',
      label: isPartial ? 'Partial' : isTransitive ? 'Transitive' : 'Full',
    }
  })

  const colWidth = compact ? 80 : 100
  const totalWidth = columns.length * colWidth + 40
  const headerY = 35
  const arrowStartY = 55

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-xl overflow-x-auto"
    >
      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>🔗</span> Dependency Diagram
      </h4>

      <svg
        width={Math.max(totalWidth, 300)}
        height={arrowStartY + classifiedFds.length * 40 + 20}
        className="w-full"
        viewBox={`0 0 ${Math.max(totalWidth, 300)} ${arrowStartY + classifiedFds.length * 40 + 20}`}
      >
        {/* Column headers */}
        {columns.map((col, i) => {
          const x = 20 + i * colWidth + colWidth / 2
          const isPk = pkSet.has(col)

          return (
            <g key={col}>
              <motion.rect
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                x={x - colWidth / 2 + 4}
                y={10}
                width={colWidth - 8}
                height={30}
                rx={6}
                fill={isPk ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)'}
                stroke={isPk ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}
                strokeWidth={1}
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                x={x}
                y={headerY - 6}
                textAnchor="middle"
                fill={isPk ? '#60A5FA' : '#94A3B8'}
                fontSize={compact ? 9 : 10}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={isPk ? 600 : 400}
              >
                {isPk ? '🔑' : ''}{col.length > 10 ? col.slice(0, 9) + '…' : col}
              </motion.text>
            </g>
          )
        })}

        {/* Dependency arrows */}
        <AnimatePresence>
          {classifiedFds.map((fd, fi) => {
            const fromIndices = fd.from.map(a => columns.indexOf(a))
            const toIndices = fd.to.map(a => columns.indexOf(a)).filter(i => i >= 0)

            if (fromIndices.some(i => i === -1) || toIndices.length === 0) return null

            const fromCenterX = fromIndices.reduce((sum, i) =>
              sum + 20 + i * colWidth + colWidth / 2, 0) / fromIndices.length

            const y = arrowStartY + fi * 40 + 20

            return (
              <g key={`fd-${fi}`}>
                {toIndices.map((toIdx, ti) => {
                  const toCenterX = 20 + toIdx * colWidth + colWidth / 2
                  const fromY = headerY + 5
                  const toY = headerY + 5

                  // Curved arrow
                  const midY = y
                  const path = `M ${fromCenterX} ${fromY} C ${fromCenterX} ${midY}, ${toCenterX} ${midY}, ${toCenterX} ${toY}`

                  return (
                    <g key={`arrow-${fi}-${ti}`}>
                      <motion.path
                        d={path}
                        fill="none"
                        stroke={fd.color}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ delay: fi * 0.15 + ti * 0.05, duration: 0.8 }}
                        markerEnd={`url(#arrow-${fd.type})`}
                      />
                      {/* Arrowhead at destination */}
                      <motion.circle
                        cx={toCenterX}
                        cy={toY}
                        r={3}
                        fill={fd.color}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: fi * 0.15 + ti * 0.05 + 0.6 }}
                      />
                    </g>
                  )
                })}

                {/* Label */}
                <motion.text
                  x={fromCenterX}
                  y={y + 5}
                  textAnchor="middle"
                  fill={fd.color}
                  fontSize={8}
                  fontWeight={600}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: fi * 0.15 + 0.5 }}
                >
                  {fd.from.join(',')} → {fd.to.join(',')}
                </motion.text>
                <motion.text
                  x={fromCenterX}
                  y={y + 15}
                  textAnchor="middle"
                  fill={fd.color}
                  fontSize={7}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: fi * 0.15 + 0.6 }}
                >
                  ({fd.label})
                </motion.text>
              </g>
            )
          })}
        </AnimatePresence>

        {/* Arrow markers */}
        <defs>
          {['full', 'partial', 'transitive'].map(type => (
            <marker
              key={type}
              id={`arrow-${type}`}
              markerWidth={8}
              markerHeight={6}
              refX={8}
              refY={3}
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={type === 'partial' ? '#F59E0B' : type === 'transitive' ? '#EF4444' : '#10B981'}
              />
            </marker>
          ))}
        </defs>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-green-500 rounded" />
          <span className="text-[10px] text-white/40">Full FD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-yellow-500 rounded" />
          <span className="text-[10px] text-white/40">Partial Dep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 rounded" />
          <span className="text-[10px] text-white/40">Transitive Dep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-blue-400">🔑</span>
          <span className="text-[10px] text-white/40">Primary Key</span>
        </div>
      </div>
    </motion.div>
  )
}
