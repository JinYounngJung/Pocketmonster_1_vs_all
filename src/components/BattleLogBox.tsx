import React, { useEffect, useRef } from 'react';
import { BattleLog } from '../types/pokemon';
import { Sparkles, Shield, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface BattleLogBoxProps {
  logs: BattleLog[];
  currentActionMessage: string;
  isProcessingTurn: boolean;
}

export const BattleLogBox: React.FC<BattleLogBoxProps> = ({
  logs,
  currentActionMessage,
  isProcessingTurn,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, currentActionMessage]);

  const recentLogs = logs.slice(-8);

  return (
    <div
      id="battle-log-box"
      className="w-full bg-slate-900 border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden flex flex-col font-sans"
    >
      {/* Active Turn Headline Box */}
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-black flex items-center justify-between min-h-[48px]">
        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-white uppercase tracking-tight">
          <span className="flex h-3 w-3 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full ${
                isProcessingTurn ? 'bg-yellow-400' : 'bg-green-400'
              } opacity-75`}
            ></span>
            <span
              className={`relative inline-flex h-3 w-3 border border-black ${
                isProcessingTurn ? 'bg-yellow-400' : 'bg-green-400'
              }`}
            ></span>
          </span>
          <span className="leading-snug">{currentActionMessage || '어떤 행동을 취하시겠습니까?'}</span>
        </div>
      </div>

      {/* Battle Log History */}
      <div
        ref={logContainerRef}
        className="p-3 sm:p-4 max-h-36 sm:max-h-44 overflow-y-auto space-y-1.5 text-xs text-slate-200 font-bold scroll-smooth bg-slate-900"
      >
        {recentLogs.length === 0 ? (
          <p className="text-slate-400 italic text-xs">배틀이 시작되었습니다. 기술을 선택하세요!</p>
        ) : (
          recentLogs.map((log) => {
            let textColor = 'text-slate-200';
            let prefix = '• ';

            if (log.type === 'effective') {
              textColor = 'text-yellow-400 font-black';
              prefix = '💥 ';
            } else if (log.type === 'crit') {
              textColor = 'text-yellow-300 font-black';
              prefix = '⚡ ';
            } else if (log.type === 'resist') {
              textColor = 'text-cyan-400 font-bold';
              prefix = '🛡️ ';
            } else if (log.type === 'faint') {
              textColor = 'text-red-400 font-black';
              prefix = '💀 ';
            } else if (log.type === 'switch') {
              textColor = 'text-green-400 font-bold';
              prefix = '🔄 ';
            } else if (log.type === 'status') {
              textColor = 'text-purple-300 font-bold';
              prefix = '✨ ';
            } else if (log.type === 'heal') {
              textColor = 'text-teal-300 font-bold';
              prefix = '💚 ';
            }

            return (
              <div key={log.id} className={`leading-relaxed ${textColor} flex items-start gap-1`}>
                <span className="shrink-0">{prefix}</span>
                <span>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
