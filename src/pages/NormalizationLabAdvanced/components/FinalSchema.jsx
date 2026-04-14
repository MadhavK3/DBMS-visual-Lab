import { motion } from 'framer-motion'
import VisualTable from './VisualTable'
import { useNormalizationStore } from '../store/useNormalizationStore'

/**
 * FinalSchema — Shows the final normalized schema with all tables
 * and their relationships after 3NF decomposition.
 */
export default function FinalSchema() {
  const { normalizationResult, currentDataset } = useNormalizationStore()
  const finalTables = normalizationResult?.finalTables

  if (!finalTables || finalTables.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-neon-green/20 border border-neon-green/30 flex items-center justify-center text-lg"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(16,185,129,0)',
              '0 0 20px 4px rgba(16,185,129,0.3)',
              '0 0 0 0 rgba(16,185,129,0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✅
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-white">Final Normalized Schema</h3>
          <p className="text-xs text-white/40">
            {finalTables.length} tables in Third Normal Form (3NF)
          </p>
        </div>
      </div>

      {/* Schema overview */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Schema Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {finalTables.map((table, idx) => (
            <motion.div
              key={table.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-white/[0.03] border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{table.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                  3NF ✓
                </span>
              </div>
              <div className="text-[10px] font-mono text-white/30 space-y-0.5">
                {table.columns.map(col => (
                  <span key={col} className={`block ${
                    table.primaryKey?.includes(col) ? 'text-blue-400 font-semibold' : ''
                  }`}>
                    {table.primaryKey?.includes(col) ? '🔑 ' : '  '}{col}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-white/20">
                {table.rows.length} rows
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {finalTables.map((table, idx) => (
          <VisualTable
            key={`final-${table.name}-${idx}`}
            table={table}
            index={idx}
            primaryKey={table.primaryKey}
            showDepColors={false}
          />
        ))}
      </div>

      {/* Relationships */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>🔗</span> Table Relationships
        </h4>
        <div className="space-y-2">
          {generateRelationships(finalTables).map((rel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-xs font-mono text-white/50 px-3 py-2 rounded-lg bg-white/[0.03]"
            >
              <span className="text-primary-400 font-semibold">{rel.from}</span>
              <span className="text-white/20">——</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                {rel.column}
              </span>
              <span className="text-white/20">→</span>
              <span className="text-neon-green font-semibold">{rel.to}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Normalization properties */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>✅</span> Normalization Properties
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Lossless Join', desc: 'Original data can be reconstructed by joining tables', icon: '🔄' },
            { label: 'Dependency Preserved', desc: 'All functional dependencies are enforceable', icon: '📏' },
            { label: 'No Redundancy', desc: 'Data is stored once without unnecessary duplication', icon: '✨' },
          ].map((prop, i) => (
            <motion.div
              key={prop.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{prop.icon}</span>
                <span className="text-xs font-semibold text-neon-green">{prop.label}</span>
              </div>
              <p className="text-[10px] text-white/30">{prop.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Generate relationships by finding shared columns across tables.
 */
function generateRelationships(tables) {
  const relationships = []

  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const sharedCols = tables[i].columns.filter(c => tables[j].columns.includes(c))
      for (const col of sharedCols) {
        relationships.push({
          from: tables[i].name,
          to: tables[j].name,
          column: col,
        })
      }
    }
  }

  return relationships
}
