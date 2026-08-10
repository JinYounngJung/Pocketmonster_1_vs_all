import React, { useState, useEffect, useRef } from 'react';
import { PokemonData, EliteFourMaster } from '../types/pokemon';
import { Sparkles, Send, X, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { generateLocalOakAdvice } from '../utils/localOakEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface OakCoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  playerParty: PokemonData[];
  activePlayerPokemon: PokemonData | null;
  activeOpponentPokemon: PokemonData | null;
  currentMaster: EliteFourMaster | null;
}

export const OakCoachChat: React.FC<OakCoachChatProps> = ({
  isOpen,
  onClose,
  playerParty,
  activePlayerPokemon,
  activeOpponentPokemon,
  currentMaster,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '허허! 포켓몬 배틀 연구가 오박사일세! 상성 분석, 기술 선택, 사천왕 공략법 등 무엇이든 물어보게나! 자네의 전략적 승리를 돕겠네!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Context-aware quick prompts
  const quickPrompts: string[] = [];
  if (activePlayerPokemon && activeOpponentPokemon && currentMaster) {
    quickPrompts.push(`지금 ${activeOpponentPokemon.name} 상대로 어떤 기술이 가장 효과적인가?`);
    quickPrompts.push(`${currentMaster.name} 사천왕전 공략 팁을 알려줘`);
    quickPrompts.push(`내 파티에서 ${activeOpponentPokemon.name}를 가장 잘 막는 포켓몬은?`);
  } else if (playerParty.length > 0) {
    quickPrompts.push('현재 내 6마리 파티의 타입 상성 밸런스를 평가해줘');
    quickPrompts.push('사천왕 4명을 깰 때 가장 주의해야 할 타입은 뭐야?');
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    sounds.playClick();
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate quick natural thinking pause
      setTimeout(() => {
        const replyContent = generateLocalOakAdvice(
          text.trim(),
          null,
          activePlayerPokemon,
          activeOpponentPokemon,
          currentMaster,
          playerParty
        );

        const assistantMsg: Message = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 300);
    } catch (err) {
      console.error('Local Coach error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content:
            '허허! 상성 배율(2배/4배)을 고려해 약점 기술을 우선적으로 선택하고 유리한 포켓몬으로 교체해 보게나!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div
      id="oak-coach-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        sounds.playClick();
        onClose();
      }}
    >
      <div
        id="oak-coach-modal-content"
        className="relative w-full max-w-2xl bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center">
              <span className="text-xl">👨‍🔬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase">오박사의 배틀 코칭 룸</h3>
                <span className="text-[9px] font-black px-2 py-0.5 border border-black bg-yellow-400 text-black uppercase shadow-[1px_1px_0px_#000]">
                  실시간 오박사 AI 코칭
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">사천왕 약점 분석 & 턴제 전략 자문</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 bg-white hover:bg-slate-100 border-2 border-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div
          ref={messagesEndRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/80"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0 text-sm">
                  👨‍🔬
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-3 text-xs sm:text-sm leading-relaxed border-2 border-black shadow-[3px_3px_0px_#000] ${
                  msg.role === 'user'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'bg-slate-900 text-slate-100 font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span className={`text-[10px] block mt-1 text-right font-mono ${msg.role === 'user' ? 'text-slate-800' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-slate-800 border-2 border-black text-white shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-yellow-400 font-bold">
              <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center text-sm shadow-[2px_2px_0px_#000]">
                👨‍🔬
              </div>
              <div className="bg-slate-900 border-2 border-black shadow-[3px_3px_0px_#000] px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span>오박사가 포켓몬 상성 데이터를 분석 중입니다...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {quickPrompts.length > 0 && (
          <div className="px-4 py-2 bg-slate-950 border-t-2 border-black flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] font-black bg-slate-900 hover:bg-slate-800 text-yellow-400 border-2 border-black shadow-[2px_2px_0px_#000] px-2.5 py-1 transition-all text-left truncate max-w-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t-2 border-black">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="오박사에게 포켓몬 상성 질문하기 (예: 갸라도스 상대법)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border-2 border-black text-white placeholder:text-slate-400 text-sm px-4 py-3 shadow-[2px_2px_0px_#000] focus:outline-hidden focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black border-2 border-black font-black transition-all shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
