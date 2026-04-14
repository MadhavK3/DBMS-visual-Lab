import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { getColumnDepInfo } from '../engine/dependencyDetector'

/**
 * VisualTable — Interactive animated data grid
 * - Clickable, highlightable columns and rows
 * - Color coded: PK→Blue, Partial→Yellow, Transitive→Red
 * - Animated transitions with Framer Motion layout animations
 */
export default function VisualTable({
  table,
  index = 0,
  showDepColors = true,
  primaryKey = null,
  fds = null,
  highlightedCols = [],
  highlightedRows = [],
  flashDuplicates = false,
  onColumnClick,
  compact = false,
  colorAccent = null,
}) {
  const [hoveredCol, setHoveredCol] = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const pk = primaryKey || table.primaryKey || []
  const accentColors = ['#6366f1', '#10b981', '#f97316', '#a855f7', '#ec4899', '#06b6d4']
  const accent = colorAccent || accentColors[index % accentColors.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 25 }}
      className="glass-card rounded-xl overflow-hidden border-l-4"
      style={{ borderLeftColor: accent }}
    >
      {/* Table header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.h4
            className="font-bold text-white text-sm"
            layout
          >
            {table.name}
          </motion.h4>
          {table.status && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10"
            >
              {table.status}
            </motion.span>
          )}
        </div>
        <span className="text-xs text-white/30 font-mono">
          PK: <span className="text-blue-400">{pk.join(', ')}</span>
        </span>
      </div>

      {/* Table content */}
      <div className={`overflow-x-auto ${compact ? '' : 'p-2'}`}>
        <table className="w-full text-xs">
          <thead>
            <tr>
              {table.columns.map((col, ci) => {
                const depInfo = showDepColors && fds
                  ? getColumnDepInfo(col, pk, fds)
                  : pk.includes(col)
                    ? { type: 'primary_key', color: '#3B82F6', label: 'Primary Key' }
                    : { type: 'normal', color: '#94A3B8', label: 'Attribute' }

                const isHighlighted = highlightedCols.includes(col)
                const isHovered = hoveredCol === ci

                return (
                  <motion.th
                    key={col}
                    layout
                    onClick={() => onColumnClick?.(col)}
                    onMouseEnter={() => setHoveredCol(ci)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`text-left py-2.5 px-3 font-semibold cursor-pointer transition-all duration-200 select-none border-b-2 ${
                      isHighlighted || isHovered ? 'bg-white/10' : ''
                    }`}
                    style={{
                      color: depInfo.color,
                      borderBottomColor: isHighlighted || isHovered ? depInfo.color : 'transparent',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    title={depInfo.label}
                  >
                    <div className="flex items-center gap-1.5">
                      {pk.includes(col) && <span className="text-[10px]">🔑</span>}
                      {col}
                      {depInfo.type === 'partial' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" title="Partial Dependency" />
                      )}
                      {depInfo.type === 'transitive' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" title="Transitive Dependency" />
                      )}
                    </div>
                  </motion.th>
                )
              })}
            </tr>
          </thead>
          <AnimatePresence>
            <tbody>
              {table.rows.map((row, ri) => {
                const isHighlightedRow = highlightedRows.includes(ri)
                const isDuplicate = flashDuplicates && highlightedRows.includes(ri)

                return (
                  <motion.tr
                    key={ri}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      backgroundColor: isDuplicate
                        ? ['rgba(239,68,68,0.1)', 'rgba(239,68,68,0.25)', 'rgba(239,68,68,0.1)']
                        : isHighlightedRow
                        ? 'rgba(99,102,241,0.1)'
                        : 'transparent',
                    }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{
                      delay: ri * 0.03,
                      backgroundColor: isDuplicate ? { duration: 1.5, repeat: Infinity } : {},
                    }}
                    onMouseEnter={() => setHoveredRow(ri)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`border-b border-white/5 transition-colors ${
                      hoveredRow === ri ? 'bg-white/5' : ''
                    }`}
                  >
                    {row.map((cell, ci) => {
                      const col = table.columns[ci]
                      const isPkCol = pk.includes(col)

                      return (
                        <motion.td
                          key={ci}
                          layout
                          className={`py-2 px-3 font-mono transition-all duration-200 ${
                            isPkCol ? 'text-blue-300 font-semibold' : 'text-white/60'
                          } ${hoveredCol === ci ? 'bg-white/5' : ''}`}
                        >
                          {cell}
                        </motion.td>
                      )
                    })}
                  </motion.tr>
                )
              })}
            </tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Row count */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20">
        <span>{table.rows.length} rows × {table.columns.length} columns</span>
        <span className="font-mono">{table.name}</span>
      </div>
    </motion.div>
  )
}
