
import React, { useState, useCallback, useEffect } from 'react';
import { getCompatibilityFortune } from './services/geminiService';
import type { FortuneResult } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import ResultCard from './components/ResultCard';
import DOBInput from './components/DOBInput';
import CosmicConnection from './components/CosmicConnection';
import UsageManual from './components/UsageManual';

interface DisplayedResult {
  result: FortuneResult;
  names: { name1: string; name2: string };
  dateStr: string;
}

const DAILY_LIMIT = 5;
const bloodTypes = ['A', 'B', 'O', 'AB'];
const constellations = [
  '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', 
  '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'
];
const etos = [
  '子 (ね)', '丑 (うし)', '寅 (とら)', '卯 (う)', '辰 (たつ)', '巳 (み)', 
  '午 (うま)', '未 (ひつじ)', '申 (さる)', '酉 (とり)', '戌 (いぬ)', '亥 (い)'
];
const relationships = ['恋人', '片思い', '夫婦', '友人', '仕事仲間', '商談相手'];

const App: React.FC = () => {
  const [bloodType1, setBloodType1] = useState<string>('');
  const [constellation1, setConstellation1] = useState<string>('');
  const [eto1, setEto1] = useState<string>('');
  const [dob1, setDob1] = useState<string>('');
  const [isPerson1Fixed, setIsPerson1Fixed] = useState<boolean>(false);
  
  const [name2, setName2] = useState<string>('');
  const [pastNames, setPastNames] = useState<string[]>([]);
  
  const [relationship, setRelationship] = useState<string>('');
  const [divinationDate, setDivinationDate] = useState<'today' | 'tomorrow'>('today');
  const [displayedResult, setDisplayedResult] = useState<DisplayedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 初回ロード時に保存された鑑定結果や設定を復元
  useEffect(() => {
    try {
      const fixedDataString = localStorage.getItem('person1FixedData');
      if (fixedDataString) {
        const fixedData = JSON.parse(fixedDataString);
        if (fixedData.isFixed) {
          setIsPerson1Fixed(true);
          setBloodType1(fixedData.bloodType || '');
          setConstellation1(fixedData.constellation || '');
          setEto1(fixedData.eto || '');
          setDob1(fixedData.dob || '');
        }
      }

      const storedNames = localStorage.getItem('pastFortuneNames');
      if (storedNames) setPastNames(JSON.parse(storedNames));

      const savedResult = localStorage.getItem('latest_fortune_result');
      if (savedResult) {
        setDisplayedResult(JSON.parse(savedResult));
        setLastSaved('復元済み');
      }

      const today = new Date().toLocaleDateString();
      const lastDate = localStorage.getItem('usageDate');
      const count = parseInt(localStorage.getItem('usageCount') || '0', 10);
      if (lastDate !== today) {
        localStorage.setItem('usageDate', today);
        localStorage.setItem('usageCount', '0');
        setUsageCount(0);
      } else {
        setUsageCount(count);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
  }, []);

  // 鑑定結果が更新されたら即座に保存
  useEffect(() => {
    if (displayedResult) {
      localStorage.setItem('latest_fortune_result', JSON.stringify(displayedResult));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [displayedResult]);

  // 鑑定中または入力中の離脱防止
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading || (name2 && !displayedResult)) {
        e.preventDefault();
        e.returnValue = '入力内容や鑑定結果が消去されますがよろしいですか？';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading, name2, displayedResult]);

  useEffect(() => {
    try {
      if (isPerson1Fixed) {
        const fixedData = {
          isFixed: true,
          bloodType: bloodType1,
          constellation: constellation1,
          eto: eto1,
          dob: dob1,
        };
        localStorage.setItem('person1FixedData', JSON.stringify(fixedData));
      } else {
        localStorage.removeItem('person1FixedData');
      }
    } catch (e) {
      console.error("Failed to save fixed data", e);
    }
  }, [isPerson1Fixed, bloodType1, constellation1, eto1, dob1]);

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRelationship(e.target.value);
  };

  const handleDeleteHistory = useCallback((nameToDelete: string) => {
    const newPastNames = pastNames.filter(name => name !== nameToDelete);
    setPastNames(newPastNames);
    localStorage.setItem('pastFortuneNames', JSON.stringify(newPastNames));
  }, [pastNames]);

  const handleFortuneTell = useCallback(async () => {
    if (usageCount >= DAILY_LIMIT) return;
    
    if (!bloodType1 || !constellation1 || !eto1 || !dob1) {
      setError('あなたの情報をすべて選択・入力してください。');
      return;
    }
    if (!name2) {
      setError('お相手の名前を入力してください。');
      return;
    }
    if (!relationship) {
      setError('現在の関係性を選択してください。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDisplayedResult(null);

    const targetDate = new Date();
    if (divinationDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
    
    try {
      const fortuneResult = await getCompatibilityFortune(
        'あなた',
        name2,
        bloodType1,
        constellation1,
        eto1,
        dob1,
        null,
        null,
        null,
        relationship,
        divinationDate
      );

      const resultData = {
        result: fortuneResult,
        names: { name1: 'あなた', name2: name2 || 'お相手' },
        dateStr: dateStr
      };

      setDisplayedResult(resultData);

      if (name2 && !pastNames.includes(name2)) {
        const newPastNames = [name2, ...pastNames].slice(0, 10);
        setPastNames(newPastNames);
        localStorage.setItem('pastFortuneNames', JSON.stringify(newPastNames));
      }

      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('usageCount', newCount.toString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [name2, bloodType1, constellation1, eto1, dob1, relationship, divinationDate, pastNames, usageCount]);

  const getFormattedDate = (type: 'today' | 'tomorrow') => {
    const date = new Date();
    if (type === 'tomorrow') date.setDate(date.getDate() + 1);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const createStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      return <div key={i} className="absolute bg-white rounded-full" style={{ width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `twinkle ${Math.random() * 5 + 3}s linear infinite` }} />;
    });
  };
  
  const inputBaseClasses = "w-full px-4 py-3 bg-gray-900/40 border border-fuchsia-900/50 focus:border-fuchsia-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 transition-all duration-300 disabled:opacity-50 disabled:bg-gray-800/80 hover:border-fuchsia-700/50";

  return (
    <div className="relative min-h-screen w-full bg-[#05020a] text-white flex flex-col items-center justify-center p-4 overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#581c87] via-[#1e1b4b] to-[#000000] z-0"></div>
      <div className="absolute inset-0 z-0 opacity-60">{createStars(150)}</div>
      
      <style>{`
          @keyframes twinkle { 0% { opacity: 0; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: scale(0.8); } }
          @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
          select { -webkit-appearance: none; -moz-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a78bfa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 1rem center; background-size: .65em auto; padding-right: 2.5rem; }
      `}</style>

      <UsageManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

      <main className="z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-fade-in-up">
          <div className="w-full lg:w-3/5 p-6 md:p-10 relative z-10">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-[linear-gradient(to_right,#f87171,#fb923c,#facc15,#4ade80,#60a5fa,#818cf8,#c084fc)] mb-2">AI相性占い</h1>
                    <p className="text-fuchsia-200/60 text-sm tracking-wider">二人の星が織りなす、運命の物語</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setIsManualOpen(true)} className="flex flex-col items-center gap-1 group">
                      <div className="p-2 bg-fuchsia-900/40 rounded-full border border-fuchsia-500/30 text-fuchsia-300 transition-all group-hover:bg-fuchsia-800/60 shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
                      </div>
                      <span className="text-[10px] text-fuchsia-300/70">取説</span>
                  </button>
                  {lastSaved && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/20 border border-green-500/30 rounded text-[10px] text-green-300 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      自動保存済み {lastSaved !== '復元済み' && `(${lastSaved})`}
                    </div>
                  )}
                </div>
            </header>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                      <h3 className="text-lg font-semibold text-fuchsia-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]"></span>あなた</h3>
                      <div className="flex items-center">
                          <input id="fix-person1" type="checkbox" checked={isPerson1Fixed} onChange={(e) => setIsPerson1Fixed(e.target.checked)} className="h-5 w-5 rounded text-fuchsia-600 bg-transparent cursor-pointer" />
                          <label htmlFor="fix-person1" className="ml-2 text-sm md:text-base text-slate-300 cursor-pointer font-medium">情報を固定</label>
                      </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <select value={bloodType1} onChange={(e) => setBloodType1(e.target.value)} className={inputBaseClasses} disabled={isLoading}>
                          <option value="" disabled>血液型</option>
                          {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}型</option>)}
                        </select>
                        <select value={eto1} onChange={(e) => setEto1(e.target.value)} className={inputBaseClasses} disabled={isLoading}>
                          <option value="" disabled>干支</option>
                          {etos.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <select value={constellation1} onChange={(e) => setConstellation1(e.target.value)} className={inputBaseClasses} disabled={isLoading}>
                      <option value="" disabled>星座</option>
                      {constellations.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <DOBInput value={dob1} onChange={setDob1} disabled={isLoading} ariaLabel="あなたの生年月日" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-2 mb-2"><h3 className="text-lg font-semibold text-fuchsia-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>お相手</h3></div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="お名前を入力" list="past-names-list" className={`${inputBaseClasses} pl-10`} disabled={isLoading} />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></span>
                      <datalist id="past-names-list">{pastNames.map((name) => <option key={name} value={name} />)}</datalist>
                    </div>
                    {pastNames.length > 0 && <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">{pastNames.map((historyName) => <div key={historyName} className="flex items-center gap-1 bg-fuchsia-900/20 border border-fuchsia-500/30 px-2 py-1 rounded-full"><button onClick={() => setName2(historyName)} className="text-xs text-fuchsia-100 truncate max-w-[80px]">{historyName}</button><button onClick={() => handleDeleteHistory(historyName)} className="text-red-400 text-xs px-1">×</button></div>)}</div>}
                    <div className="pt-2">
                      <select id="relationship-select" value={relationship} onChange={handleRelationshipChange} className={inputBaseClasses} disabled={isLoading}>
                        <option value="" disabled>現在の関係性</option>
                        {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                    {['today', 'tomorrow'].map((d) => (
                      <button 
                        key={d} 
                        onClick={() => setDivinationDate(d as any)} 
                        className={`px-4 py-1.5 rounded-md text-sm transition-all ${divinationDate === d ? 'bg-fuchsia-600 text-white' : 'text-slate-400'}`}
                      >
                        {d === 'today' ? '本日' : '明日'} ({getFormattedDate(d as any)})
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs text-fuchsia-200">
                    本日の残り：<span className="font-bold text-yellow-400">{Math.max(0, DAILY_LIMIT - usageCount)}</span>回
                  </div>
                </div>

                {usageCount >= DAILY_LIMIT && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-center text-red-200 text-sm font-bold">本日の利用上限に達しました。明日またお試しください。</div>}
                <button 
                  onClick={handleFortuneTell} 
                  disabled={isLoading || usageCount >= DAILY_LIMIT} 
                  className={`group relative w-full py-4 text-lg font-bold text-white rounded-xl overflow-hidden shadow-xl transition-all ${usageCount >= DAILY_LIMIT ? 'bg-gray-700 cursor-not-allowed grayscale' : 'hover:scale-[1.01]'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 ${usageCount >= DAILY_LIMIT ? 'opacity-20' : ''}`}></div>
                  <span className="relative flex items-center justify-center gap-2">{isLoading ? '鑑定中...' : '運命を占う'}</span>
                </button>
                {isLoading && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}
                {displayedResult && <div className="mt-8 animate-fade-in-up"><ResultCard result={displayedResult.result} names={displayedResult.names} dateStr={displayedResult.dateStr} /></div>}
                {error && <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-center text-sm">{error}</div>}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/5 relative border-t lg:border-t-0 lg:border-l border-white/10 min-h-[400px]"><CosmicConnection /></div>
        </div>

        <footer className="w-full flex flex-col items-center pb-12 mt-12 opacity-100">
            <div className="flex items-end gap-3 scale-110 md:scale-125">
                <div className="relative flex items-center">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(to_right,#ff8a00,#e5ff00,#33ff00,#00ffcc,#00c2ff,#0071ff,#235ad1,#44107a,#af002d,#ff2000,#ff8a00)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        m<span className="relative inline-block">i<span className="absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 text-yellow-400 text-xl md:text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,1)]">★</span></span>ke
                    </span>
                </div>
                <span className="text-lg md:text-xl text-gray-500 mb-1 font-bold italic tracking-tighter">ver.3.1</span>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
