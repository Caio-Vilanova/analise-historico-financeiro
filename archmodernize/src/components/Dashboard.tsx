import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, AlertTriangle, FileCode2, ArrowRightLeft, 
  Layers, Lock, Database, Code, Code2, CheckCircle2, Zap, Server
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ScanResult, formatCompactNumber } from '../lib/analyzer';

const mockDebtData = [
  { month: 'Jan', devida: 85, ideal: 30 },
  { month: 'Feb', devida: 87, ideal: 30 },
  { month: 'Mar', devida: 90, ideal: 30 },
  { month: 'Apr', devida: 92, ideal: 30 },
  { month: 'May', devida: 95, ideal: 30 },
];

export function Dashboard({ result }: { result: ScanResult }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'guide'>('overview');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="mb-8">
        <h2 className="font-serif italic text-xl text-white mb-2 tracking-wide">
          Diagnostic Core Report
        </h2>
        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
          Analysis Generated for {result.targetName}.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 mb-8 overflow-x-auto">
        {(['overview', 'plan', 'guide'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-5 mt-5 transition-colors whitespace-nowrap",
              activeTab === tab 
                ? "text-white border-b border-emerald-500" 
                : "hover:text-white"
            )}
          >
            {tab === 'overview' && '01: Overview & Debt'}
            {tab === 'plan' && '02: Strangler Roadmap'}
            {tab === 'guide' && '03: Target Architecture'}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab result={result} />}
          {activeTab === 'plan' && <MigrationPlanTab />}
          {activeTab === 'guide' && <TargetArchitectureTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Lines Scanned', val: formatCompactNumber(result.totalLoc), icon: FileCode2, color: 'text-white/40', trend: `${formatCompactNumber(result.totalFiles)} files found`, unit: 'LOC' },
          { title: 'Technical Debt', val: result.debtScore, icon: Activity, color: 'text-emerald-400', trend: 'Highly coupled modules', unit: 'IDX' },
          { title: 'Circular Deps', val: '143', icon: ArrowRightLeft, color: 'text-amber-500', trend: 'Business logic layers', unit: 'CYC' },
          { title: 'Vulnerabilities', val: result.vulnerabilities.toString(), icon: AlertTriangle, color: 'text-red-500', trend: 'Injection & outdated FW', unit: 'CVE' },
        ].map((m, i) => (
          <div key={i} className="p-4 bg-white/5 border-l-2 border-white/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono uppercase text-white/50">{m.title}</span>
              <m.icon className={cn("w-3 h-3", m.color)} strokeWidth={1.5} />
            </div>
            <div className="text-xl font-light text-white my-1">{m.val} <span className="text-[10px] opacity-40">{m.unit}</span></div>
            <p className="text-[9px] uppercase tracking-tighter text-white/30">{m.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 bg-[#080808] border border-white/5 flex flex-col">
          <h3 className="font-serif italic text-lg text-white mb-6 uppercase tracking-tight">Debt Accumulation</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDebtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDevida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#333" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', color: '#d4d4d4', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="ideal" stroke="#10b981" strokeDasharray="2 2" fill="none" strokeWidth={1} name="Healthy Threshold" />
                <Area type="monotone" dataKey="devida" stroke="rgba(239, 68, 68, 0.5)" fillOpacity={1} fill="url(#colorDevida)" strokeWidth={1} name="Accumulated Debt" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Major Issues List */}
        <div className="p-6 bg-[#080808] border border-white/5">
          <h3 className="font-serif italic text-lg text-white mb-6 uppercase tracking-tight">Detected Technologies</h3>
          <div className="space-y-4">
            {[
              { label: 'Java', desc: 'Enterprise Beans, Struts, Spring', count: result.languages.java, type: 'architecture' },
              { label: 'COBOL', desc: 'Copybooks, CICS Transactions', count: result.languages.cobol, type: 'debt' },
              { label: 'PowerScript', desc: 'DataWindows, Direct DB Connection', count: result.languages.powerscript, type: 'performance' },
              { label: 'Natural/Other', desc: 'Adabas integration & scripts', count: result.languages.natural + result.languages.other, type: 'security' },
            ].map((issue, i) => (
              <div key={i} className="flex gap-4 items-start p-3 bg-white/5 border-l border-white/10">
                 <div className={cn(
                   "w-1.5 h-1.5 rounded-full shrink-0 mt-1",
                   issue.type === 'security' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                   issue.type === 'performance' ? "bg-emerald-500" :
                   issue.type === 'architecture' ? "bg-blue-500" : "bg-white/40"
                 )} />
                 <div className="flex-1">
                   <h4 className="text-[11px] font-mono uppercase text-white mb-1 tracking-wider">{issue.label}</h4>
                   <p className="text-[10px] text-white/50 leading-relaxed">{issue.desc}</p>
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] text-white font-mono">{issue.count}</div>
                   <div className="text-[8px] text-white/30 tracking-widest uppercase">Files</div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MigrationPlanTab() {
  return (
    <div className="space-y-8">
      <div className="p-6 bg-[#080808] border-l-2 border-emerald-500">
        <h3 className="font-serif italic text-lg text-white mb-3 uppercase tracking-tight">Strangler Fig Strategy</h3>
        <p className="text-[11px] font-mono text-white/60 max-w-3xl leading-relaxed">
          Engine recommends generating an Anti-Corruption Layer (ACL) 
          to intercept monolithic calls. Features will be routed progressively to 
          isolated microservices, "strangling" the legacy implementation without downtime.
        </p>
      </div>

      <div className="relative border-l border-white/10 ml-6 space-y-12 pb-8">
        {[
          {
            phase: 'Phase 01: Proxy Ingress (M1-M2)',
            status: 'Immediate',
            details: 'Implement API Gateway at edge. Map Java 8 endpoints and PowerScript screens. Establish Anti-Corruption Layer (ACL) to shield new domains.'
          },
          {
            phase: 'Phase 02: Domain Slice (M3-M6)',
            status: 'Planning',
            details: 'Extract Auth and User modules from monolith. Refactor COBOL copybook logic for user profiles into an independent Java 21 domain.'
          },
          {
            phase: 'Phase 03: DB Decoupling (M7-M9)',
            status: 'Projected',
            details: 'Break dependencies on heavy Stored Procedures. Use Change Data Capture (CDC) to keep legacy DB synced with isolated microservice DBs.'
          },
          {
            phase: 'Phase 04: Cloud Native (M10+)',
            status: 'Long Term',
            details: 'Decommission PowerScript servers and CICS core. Full transition to scalable Kubernetes pods, adopting Virtual Threads massively for I/O throughput.'
          }
        ].map((step, i) => (
          <div key={i} className="relative pl-8">
            <div className={cn(
              "absolute -left-[29px] top-0 w-2.5 h-2.5 rounded-full border-2 border-[#050505]",
              i === 0 ? "bg-emerald-500" :
              i === 1 ? "bg-white/40" :
              i === 2 ? "bg-white/20" : "bg-white/10"
            )} />
            <span className={cn(
              "inline-block px-2 py-0.5 mb-3 text-[9px] uppercase font-bold tracking-widest border",
              i === 0 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-white/40 border-white/10 bg-white/5"
            )}>
              {step.status}
            </span>
            <h4 className="text-sm font-mono text-white mb-2 uppercase tracking-wide">{step.phase}</h4>
            <p className="text-[11px] text-white/50 leading-relaxed max-w-4xl font-sans">
              {step.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TargetArchitectureTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="p-8 bg-[#080808] border border-white/5">
          <h3 className="font-serif italic text-lg text-white mb-8 uppercase tracking-tight">Prescribed Stack</h3>
          <ul className="space-y-6">
            {[
              { title: 'Java 21 LTS + Virtual Threads', icon: Zap, desc: 'Replaces OS blocking threads (Java 8) and sequential logic (COBOL). Built for massive throughput.' },
              { title: 'Clean Architecture', icon: Layers, desc: 'Strict decoupling: Domain core without FW deps. Use cases drive infra via Ports & Adapters.' },
              { title: 'Microservices & Pods', icon: Server, desc: 'Fault isolation, autonomous deployment CI/CD replacing Natural monolith bottleneck.' },
              { title: 'Native Observability', icon: Activity, desc: 'OpenTelemetry, Structured Logging, Distributed Tracing for hybrid flow debugging.' },
            ].map((tech, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="mt-1 flex items-center justify-center p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 h-8 w-8 shrink-0">
                  <tech.icon size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-mono text-xs text-white uppercase tracking-wider mb-1.5">{tech.title}</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">{tech.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#080808] border border-white/5 relative overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <Code2 size={16} className="text-emerald-400" />
            <h3 className="text-xs font-mono text-white uppercase tracking-widest">
              Logic Transformation Ref
            </h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-6">
             {/* Legacy Snippet */}
             <div className="bg-[#050505] p-5 border-l-2 border-red-500/50 relative">
               <span className="absolute top-0 right-0 px-2 py-1 bg-red-500/10 text-red-400 text-[9px] font-mono uppercase">Thread Pool Exhaustion</span>
               <span className="text-[10px] text-white/40 font-mono mb-3 block uppercase tracking-widest">Legacy (Java 8)</span>
               <pre className="text-[11px] font-mono text-white/70 overflow-x-auto leading-relaxed">
{`public LegacyResponse processRequest() {
  // Blocks one OS thread per request
  Object dbResult = executeHeavyStoredProcedure(); 
  return new LegacyResponse(dbResult);
}`}
               </pre>
             </div>

             {/* Modern Snippet */}
             <div className="bg-[#050505] p-5 border-l-2 border-emerald-500/50 relative mt-auto">
               <span className="absolute top-0 right-0 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase">O(1) Scalability</span>
               <span className="text-[10px] text-emerald-400/80 font-mono mb-3 block uppercase tracking-widest">Target (Java 21)</span>
               <pre className="text-[11px] font-mono text-white/90 overflow-x-auto leading-relaxed">
{`@Bean
public TomcatProtocolHandlerCustomizer<?> protocolHandler() {
  // Scales to 1M+ concurrent non-blocking connections
  return protocolHandler -> 
    protocolHandler.setExecutor(
      Executors.newVirtualThreadPerTaskExecutor()
    );
}`}
               </pre>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}