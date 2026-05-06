import { useState, useRef } from 'react';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, UploadCloud } from 'lucide-react';
import { ScanResult, analyzeGithub, analyzeZip } from './lib/analyzer';

export default function App() {
  const [appState, setAppState] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [targetName, setTargetName] = useState<string>('');
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartScan = async () => {
    if (!targetName && !targetFile) return;
    setAppState('scanning');
    setErrorMsg(null);
    
    try {
      let result: ScanResult;
      if (targetFile) {
        result = await analyzeZip(targetFile);
      } else {
        result = await analyzeGithub(targetName);
      }
      setScanResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during scan.');
      setAppState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4d4d4] font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setAppState('idle'); setTargetName(''); setTargetFile(null); }}>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-xl tracking-[0.2em] font-light text-white uppercase">ArchModernize <span className="font-serif italic lowercase tracking-normal text-emerald-400/80">engine</span></h1>
        </div>
        <div className="flex items-center gap-6">
          {appState === 'results' && (
            <span className="text-[10px] uppercase text-emerald-400 font-mono tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded">
              Análise Completa
            </span>
          )}
          <div className="text-right">
            <p className="text-[9px] uppercase opacity-40 leading-none text-white">Engine Load</p>
            <p className="text-xs font-mono text-emerald-400">74.2 GFLOPs</p>
          </div>
          <div className="w-10 h-10 rounded border border-white/10 flex items-center justify-center">
            <div className="w-5 h-[1px] bg-white"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-12 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          {appState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center mt-12"
            >
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-6 bg-[#080808] rounded">
                <UploadCloud size={24} className="text-white/40" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.1em] mb-4">
                Legacy Source Analysis
              </h1>
              <p className="text-xs font-mono text-white/50 mb-10 max-w-xl leading-relaxed uppercase tracking-widest">
                Engine ready. Connect repositories for deep logic scan. Identify COBOL, Java 8, PowerScript dependencies and project your Java 21 & Microservices roadmap.
              </p>
              
              <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 font-mono text-xs text-left mb-4 uppercase tracking-widest break-words">
                    <span className="font-bold">Error:</span> {errorMsg}
                  </div>
                )}
                <input 
                  type="text" 
                  placeholder="https://github.com/owner/legacy-repo" 
                  value={targetName}
                  className="bg-[#080808] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full uppercase placeholder:normal-case placeholder:text-white/20"
                  onChange={(e) => { setTargetName(e.target.value); setTargetFile(null); }}
                />
                
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-[10px] font-mono text-white/30 uppercase">or</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>
                
                <label className="border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors p-8 flex flex-col items-center justify-center cursor-pointer gap-2">
                  <UploadCloud size={24} className="text-white/40" />
                  <span className="text-xs font-mono text-white/60 uppercase tracking-widest">
                    {targetFile ? targetFile.name : "Select .ZIP Archive"}
                  </span>
                  <input type="file" accept=".zip" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTargetFile(e.target.files[0]);
                      setTargetName(e.target.files[0].name);
                    }
                  }} />
                </label>
                
                <button 
                  onClick={handleStartScan}
                  disabled={!targetName && !targetFile}
                  className="mt-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white font-mono uppercase tracking-widest text-[10px] py-3 px-8 transition-colors w-full"
                >
                  Initialize Deep Scan
                </button>
              </div>
            </motion.div>
          )}

          {appState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 mt-8"
            >
              <Scanner targetName={targetName} scanResult={scanResult} onComplete={() => setAppState('results')} />
            </motion.div>
          )}

          {appState === 'results' && scanResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Dashboard result={scanResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
