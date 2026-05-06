import { motion } from 'motion/react';
import { Terminal, Database, Code2, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScanResult } from '../lib/analyzer';

export function Scanner({ targetName, scanResult, onComplete }: { targetName: string, scanResult: ScanResult | null, onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);

  const LOG_MESSAGES = [
    `Initializing deep scan on ${targetName}...`,
    "Analyzing structure and files...",
    "Extracting legacy patterns...",
    "Detecting coupling in identified modules...",
    "Crawling dependencies...",
    "Evaluating I/O bottlenecks...",
    "Processing business rules complexity...",
    "Calculating technical debt index...",
    "Generating Cloud Native / Microservices mapping...",
    "Finalizing target architecture roadmap...",
    "Scan Complete."
  ];

  useEffect(() => {
    // If scanResult is not null, it means the background analyzer task has completed or is in progress.
    // However, the analyzer task itself is awaited in App.tsx before this mounts, so the data is already there!
    // But we still want to show a 3-second simulation so the user feels the "scan".
    const totalDuration = 3000;
    const intervalTime = totalDuration / 100;
    
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    const logTimer = setInterval(() => {
      setCurrentLog((prev) => Math.min(prev + 1, LOG_MESSAGES.length - 1));
    }, totalDuration / LOG_MESSAGES.length);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto p-12 bg-[#080808] border border-white/5">
      <div className="flex gap-4 mb-8 text-white/20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
          <Server size={24} strokeWidth={1} />
        </motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
          <Database size={24} strokeWidth={1} />
        </motion.div>
      </div>
      
      <h2 className="text-lg font-serif italic text-white mb-8 uppercase tracking-widest text-center">Reverse Engineering Engine</h2>
      
      <div className="w-full bg-white/5 h-1 mb-4 overflow-hidden relative">
        <motion.div 
          className="bg-emerald-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-white/40 text-[10px] uppercase font-mono tracking-widest mb-10">
        <span>Processing Load</span>
        <span className="text-emerald-400">{progress}%</span>
      </div>

      <div className="w-full bg-black border border-white/5 p-4 font-mono text-[10px] text-emerald-400 h-40 overflow-y-auto flex flex-col-reverse relative">
        <ul className="space-y-2 relative z-10 opacity-80 uppercase tracking-wider">
          {LOG_MESSAGES.slice(0, currentLog + 1).reverse().map((msg, idx) => (
             <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: idx === 0 ? 1 : 0.5, x: 0 }}
              className="flex items-start gap-2"
            >
              <span className="text-white/30">&gt;</span> <span className="leading-relaxed">{msg}</span>
            </motion.li>
          ))}
        </ul>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
