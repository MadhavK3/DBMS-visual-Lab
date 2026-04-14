import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import IntroSplash from './components/IntroSplash/IntroSplash'
import Home from './pages/Home/Home'
import SQLVisualizer from './pages/SQLVisualizer/SQLVisualizer'
import ERDiagramBuilder from './pages/ERDiagramBuilder/ERDiagramBuilder'
import NormalizationLabAdvanced from './pages/NormalizationLabAdvanced/NormalizationLabAdvanced'

export default function App() {
    const [showIntro, setShowIntro] = useState(true)

    return (
        <>
            {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
            <div className={`page-bg grid-bg min-h-screen flex flex-col ${showIntro ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
                <Navbar />
                <main className="flex-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/sql" element={<SQLVisualizer />} />
                        <Route path="/normalization" element={<NormalizationLabAdvanced />} />
                        <Route path="/er-builder" element={<ERDiagramBuilder />} />
                    </Routes>
                </main>
                <footer className="w-full text-center py-6 border-t border-white/5 bg-black/20">
                    <p className="text-white/30 text-xs sm:text-sm font-mono tracking-widest uppercase">
                        Made by <span className="text-primary-400 font-bold">Madhav</span>
                    </p>
                </footer>
            </div>
        </>
    )
}
