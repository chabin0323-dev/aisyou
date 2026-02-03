
import React from 'react';

interface UsageManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsageManual: React.FC<UsageManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1b4b] border border-fuchsia-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-fuchsia-300">ご利用ガイド</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <section>
            <h3 className="text-fuchsia-400 font-bold mb-1">1. あなたの情報を入力</h3>
            <p>血液型、干支、星座、生年月日を選択してください。「情報を固定」をチェックすると次回から入力を省略できます。</p>
          </section>
          <section>
            <h3 className="text-fuchsia-400 font-bold mb-1">2. お相手の情報を入力</h3>
            <p>占いたいお相手の名前（ニックネーム可）と、現在の関係性を選択します。</p>
          </section>
          <section>
            <h3 className="text-fuchsia-400 font-bold mb-1">3. 鑑定の実行</h3>
            <p>「運命を占う」ボタンを押すと、AIが二人の相性を1日5回まで無料で鑑定します。</p>
          </section>
        </div>
        <button onClick={onClose} className="w-full mt-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-colors">閉じる</button>
      </div>
    </div>
  );
};

export default UsageManual;
