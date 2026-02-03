import React, { useState, useCallback, useEffect } from 'react';
import { getCompatibilityFortune } from './services/geminiService';
import type { FortuneResult } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import ResultCard from './components/ResultCard';
import DOBInput from './DOBInput'; // 修正：./components/ を削除
import CosmicConnection from './CosmicConnection'; // 修正：./components/ を削除
import UsageManual from './components/UsageManual';

interface DisplayedResult {
  result: FortuneResult;
  names: { name1: string; name2: string };
  dateStr: string;
}

const DAILY_LIMIT = 5;
const bloodTypes = ['A', 'B', 'O', 'AB'];
const constellations = ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'];
const etos = ['子 (ね)', '丑 (うし)', '寅 (とら)', '卯 (う)', '辰 (たつ)', '巳 (み)', '午 (うま)', '未 (ひつじ)', '申 (さる)', '酉 (とり)', '戌 (いぬ)', '亥 (い)'];
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

  useEffect(() => {
    if (displayedResult) {
      localStorage.setItem('latest_fortune_result', JSON.stringify(displayedResult));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [displayedResult]);

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
        const fixedData = { isFixed: true, bloodType: bloodType1, constellation: constellation1, eto: eto1, dob: dob1 };
        localStorage.setItem('person1FixedData', JSON.stringify(fixedData));
      } else {
        localStorage.removeItem('person1FixedData');
      }
    } catch (e) {
      console.error("Failed to save fixed data", e);
    }
  }, [isPerson1Fixed, bloodType1, constellation1, eto1, dob1]);

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setRelationship(e.target.value); };

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
    if (divinationDate === 'tomorrow') { targetDate.setDate(targetDate.getDate() + 1); }
    const dateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;

    try {
      const fortuneResult = await getCompatibilityFortune('あなた', name2, bloodType1, constellation1, eto1, dob1, null, null, null, relationship, divinationDate);
      const resultData = { result: fortuneResult, names: { name1: 'あなた', name2: name2 || 'お相手' }, dateStr: dateStr };
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
                    <svg xmlns="http
