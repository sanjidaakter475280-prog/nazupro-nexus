
import React, { useState, useEffect, useRef } from 'react';
import { BotStatus } from '../../types';

interface TerminalViewProps {
  bots: BotStatus[];
}

interface LogEntry {
  id: string;
  botId: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'EXEC' | 'HF_SYS' | 'KEEP_ALIVE';
  message: string;
}

const LOG_TEMPLATES = [
  { level: 'HF_SYS', msgs: ['Connecting to Hugging Face Space [selimor/nexus-core-v2]...', 'Authenticated via HF_TOKEN: ************', 'Mounting A10G GPU for inference...'] },
  { level: 'KEEP_ALIVE', msgs: ['Sending keep-alive ping (1px image) to prevent sleep...', 'HF Space Status: AWAKE | Heartbeat acknowledged', 'Refreshing session token to maintain active state'] },
  { level: 'EXEC', msgs: ['Running inference on hf.co/models/bert-finetuned-hft', 'Processing input tensors [1, 512, 768]...', 'Strategy output received from Space API: +0.45% predicted'] },
  { level: 'SUCCESS', msgs: ['Trade signal synced with HF Hub', 'Model weights updated from repository', 'Arbitrage execution verified by cloud node'] },
  { level: 'WARN', msgs: ['HF Space RAM usage at 82%', 'API Latency spike detected on eu-west-1', 'Re-establishing WebSocket stream to Hub...'] },
  { level: 'INFO', msgs: ['Scanning L2 order book depth...', 'Syncing with exchange Websocket...', 'Heartbeat signal received: 12ms latency'] },
];

export const TerminalView: React.FC<TerminalViewProps> = ({ bots }) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0].id);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize some fake history
  useEffect(() => {
    const initialLogs: LogEntry[] = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      initialLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        botId: randomBot.id,
        timestamp: now - (20 - i) * 1000,
        level: 'HF_SYS',
        message: 'Initializing connection to Hugging Face Space...'
      });
    }
    setLogs(initialLogs);
  }, [bots]);

  // Generate real-time logs
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const message = template.msgs[Math.floor(Math.random() * template.msgs.length)];
      
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        botId: randomBot.id,
        timestamp: Date.now(),
        level: template.level as any,
        message: message
      };

      setLogs(prev => {
        const newLogs = [...prev, newLog];
        if (newLogs.length > 200) newLogs.shift(); // Keep max 200 logs
        return newLogs;
      });
    }, 1200); // Slightly slower to be readable

    return () => clearInterval(interval);
  }, [bots]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, selectedBotId]);

  const filteredLogs = logs.filter(log => log.botId === selectedBotId);
  const activeBot = bots.find(b => b.id === selectedBotId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] animate-in fade-in duration-500">
      
      {/* Bot Selection Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Connected Spaces</h2>
          <div className="space-y-2">
            {bots.map(bot => (
              <button
                key={bot.id}
                onClick={() => setSelectedBotId(bot.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedBotId === bot.id
                    ? 'bg-slate-900 dark:bg-yellow-500 text-white dark:text-slate-900 border-transparent shadow-lg'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest">{bot.name}</p>
                    <p className="text-[9px] opacity-70 font-mono">hf.co/spaces/{bot.id.toLowerCase()}</p>
                  </div>
                </div>
                {selectedBotId === bot.id && <span className="text-[10px] font-bold">HF</span>}
              </button>
            ))}
          </div>
        </div>

        {/* System Stats for Selected Bot */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-[1.5rem] border border-slate-200 dark:border-white/5 flex-1 shadow-sm flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-black text-slate-900 dark:text-white">HF Space Monitor</h3>
                 <span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[8px] px-2 py-0.5 rounded font-black border border-yellow-200 dark:border-yellow-500/30">RUNNING</span>
              </div>
              
              <div className="space-y-4">
                 <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2 z-10 relative">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Keep-Alive Protocol</span>
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-mono z-10 relative">
                       Sending 1px image ping every 30s to prevent Space hibernation.
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20">
                       <div className="h-full bg-emerald-500 w-1/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 text-slate-500">
                       <span>HF CPU Usage (2 vCPU)</span>
                       <span>68%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-500 w-[68%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 text-slate-500">
                       <span>RAM (16GB)</span>
                       <span>4.2 GB</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 w-[35%]"></div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-4 p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
              <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
                 <span className="text-yellow-500">➜</span> Connected to HF Hub<br/>
                 <span className="text-emerald-500">➜</span> Pipeline: Text-to-Trade<br/>
                 <span className="text-blue-500">➜</span> Model: {activeBot?.name}-v4.2
              </p>
           </div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-[#050505] rounded-[1.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative font-mono text-sm">
        {/* Terminal Header */}
        <div className="bg-[#111] px-4 py-3 flex items-center justify-between border-b border-white/10">
           <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
              </div>
              <span className="ml-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <span className="text-yellow-500">🤗</span> user@huggingface-space:{activeBot?.id.toLowerCase()} ~ ./run_inference.py
              </span>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[10px] text-emerald-500 animate-pulse">● Live Stream</span>
           </div>
        </div>

        {/* Terminal Output */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-1.5 scroll-smooth custom-scrollbar"
        >
          {filteredLogs.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-700">
                <span className="animate-pulse">Initializing HF Inference API stream...</span>
             </div>
          ) : (
             filteredLogs.map((log) => (
               <div key={log.id} className="flex gap-3 text-[11px] md:text-xs hover:bg-white/5 p-0.5 rounded px-2 -mx-2">
                  <span className="text-slate-500 shrink-0 select-none">
                     [{new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}]
                  </span>
                  <span className={`font-bold shrink-0 w-20 text-center select-none ${
                     log.level === 'HF_SYS' ? 'text-yellow-400' :
                     log.level === 'KEEP_ALIVE' ? 'text-pink-400' :
                     log.level === 'WARN' ? 'text-orange-400' :
                     log.level === 'ERROR' ? 'text-red-500' :
                     log.level === 'EXEC' ? 'text-purple-400' :
                     'text-emerald-400'
                  }`}>
                     {log.level}
                  </span>
                  <span className={`break-all ${
                     log.level === 'HF_SYS' ? 'text-slate-300' : 
                     log.level === 'KEEP_ALIVE' ? 'text-pink-200' : 
                     log.level === 'SUCCESS' ? 'text-emerald-100' : 
                     'text-slate-400'
                  }`}>
                     <span className="text-slate-600 mr-2 opacity-50 select-none">❯</span>
                     {log.message}
                  </span>
               </div>
             ))
          )}
          {/* Typing Cursor */}
          <div className="flex items-center gap-2 mt-2 pl-2">
             <span className="text-yellow-500">➜</span>
             <span className="w-2 h-4 bg-yellow-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
