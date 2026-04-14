import { motion } from 'framer-motion'
import { datasets } from '../engine/datasets'
import { useNormalizationStore } from '../store/useNormalizationStore'
import { playSound } from '../../../sound/soundManager'
import { useSimulationStore } from '../../../store/useSimulationStore'

const datasetList = Object.values(datasets)

export default function DatasetSelector() {
  const { currentDatasetId, setDataset } = useNormalizationStore()
  const { soundEnabled } = useSimulationStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5 rounded-2xl"
    >
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>📁</span> Select Dataset
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {datasetList.map((ds) => (
          <motion.button
            key={ds.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setDataset(ds.id)
              if (soundEnabled) playSound('click')
            }}
            className={`relative text-left px-4 py-3 rounded-xl border transition-all duration-300 ${
              currentDatasetId === ds.id
                ? 'bg-primary-500/20 border-primary-500/50 text-white shadow-lg shadow-primary-500/10'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {currentDatasetId === ds.id && (
              <motion.div
                layoutId="dataset-active"
                className="absolute inset-0 bg-primary-500/10 rounded-xl border border-primary-500/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <span className="block text-sm font-semibold truncate">{ds.name}</span>
              <span className="block text-xs text-white/30 mt-0.5 truncate">{ds.description}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
