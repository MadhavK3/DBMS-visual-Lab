import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import IntroSplash from './components/IntroSplash/IntroSplash'
import Home from './pages/Home/Home'
import SQLVisualizer from './pages/SQLVisualizer/SQLVisualizer'
import IndexSimulator from './pages/IndexSimulator/IndexSimulator'
import TransactionSimulator from './pages/TransactionSimulator/TransactionSimulator'
import NormalizationLab from './pages/NormalizationLab/NormalizationLab'
import ERDiagramBuilder from './pages/ERDiagramBuilder/ERDiagramBuilder'

export default function App() {
    const [showIntro, setShowIntro] = useState(true)

    return (
        <>
            {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
            <div className={`page-bg grid-bg min-h-screen ${showIntro ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
                <Navbar />
                <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/sql" element={<SQLVisualizer />} />
                        <Route path="/index" element={<IndexSimulator />} />
                        <Route path="/transactions" element={<TransactionSimulator />} />
                        <Route path="/normalization" element={<NormalizationLab />} />
                        <Route path="/er-builder" element={<ERDiagramBuilder />} />
                    </Routes>
                </main>
            </div>
        </>
    )
}
