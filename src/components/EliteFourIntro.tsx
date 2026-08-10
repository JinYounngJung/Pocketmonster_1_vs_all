import React, { useEffect } from 'react';
import { EliteFourMaster, PokemonData } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { Swords, ShieldAlert, Sparkles, ArrowRight, Zap, Music } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { bgmEngine } from '../utils/bgmEngine';

interface EliteFourIntroProps {
  master: EliteFourMaster;
  playerParty: PokemonData[];
  onStartBattle: () => void;
  onOpenOakChat: () => void;
}

export const EliteFourIntro: React.FC<EliteFourIntroProps> = ({
  master,
  playerParty,
  onStartBattle,
  onOpenOakChat,
}) => {
  useEffect(() => {
    // Start league/intro BGM when in intro
    const isCynthia = master.name.includes('난천') || master.stage >= 5;
    if (!bgmEngine.getIsPlaying()) {
      bgmEngine.play(isCynthia ? 'cynthia_champion' : 'sinnoh_elite_four');
    }
  }, [master.name, master.stage]);
  return (
    <div
      id="elite-four-intro-view"
      className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6"
    >
      {/* Cinematic Master Card */}
      <div
        className={`relative bg-gradient-to-br ${master.bgGradient} border-4 border-black shadow-[8px_8px_0px_#000] p-6 sm:p-10 text-white overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Trainer Avatar & Stage Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-slate-950 border-4 border-black p-3 shadow-[6px_6px_0px_#000] flex items-center justify-center group overflow-hidden">
              <img
                src={master.avatar}
                alt={master.name}
                className="max-h-full object-contain filter drop-shadow-lg scale-110 group-hover:scale-125 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = master.team[master.team.length - 1].officialArtwork;
                }}
              />
              <span className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-black text-[10px] font-black uppercase py-0.5 border-2 border-black shadow-[2px_2px_0px_#000]">
                STAGE {master.stage} / 4
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              {master.specialtyTypes.map((type) => (
                <TypeBadge key={type} type={type} size="md" />
              ))}
            </div>
          </div>

          {/* Master Lore and Dialogue */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <span className="text-xs sm:text-sm font-black text-yellow-400 uppercase tracking-widest block">
                {master.title}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase mt-1">
                사천왕 {master.name}
              </h2>
            </div>

            {/* Quote Bubble */}
            <div className="relative bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000] text-slate-100 text-sm leading-relaxed font-bold italic">
              <span className="text-2xl text-yellow-400 font-serif mr-1">“</span>
              {master.introQuote}
              <span className="text-2xl text-yellow-400 font-serif ml-1">”</span>
            </div>

            {/* Enemy Team Lineup Preview */}
            <div className="bg-slate-950 p-3.5 border-2 border-black shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-black uppercase">
                <span>상대 엔트리 ({master.team.length}마리 Lv.50):</span>
                <span className="text-yellow-400 font-black">에이스: {master.team[master.team.length - 1].name}</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {master.team.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000] text-xs text-white"
                  >
                    <img
                      src={pokemon.spriteFront}
                      alt={pokemon.name}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="font-black">{pokemon.name}</span>
                    <div className="flex gap-0.5">
                      {pokemon.types.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 sm:p-6 border-4 border-black shadow-[6px_6px_0px_#000] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase">사천왕전 준비 완료</h4>
            <p className="text-xs text-slate-300 font-medium">
              내 선발: <strong className="text-yellow-400 font-bold">{playerParty[0]?.name}</strong> (Lv.50)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-intro-coach"
            onClick={onOpenOakChat}
            className="geo-btn flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-yellow-400 text-black text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>오박사 전략 조언</span>
          </button>

          <button
            id="btn-intro-start"
            onClick={() => {
              sounds.playClick();
              onStartBattle();
            }}
            className="flex-1 sm:flex-none px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 border-4 border-black text-black font-black text-sm sm:text-base uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <Swords className="w-5 h-5 text-black" />
            <span>배틀 개시!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
