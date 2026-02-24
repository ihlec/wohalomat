import { useState } from 'react';
import { questions, parties } from './data';
import { Position, UserAnswer, MatchResult } from './types';
import { IMPRESSUM_TITLE, IMPRESSUM_HTML, DATENSCHUTZ_TITLE, DATENSCHUTZ_HTML } from './legalContent';
import { ArrowRight, ArrowLeft, Check, X, Minus, RotateCcw, Info, ChevronRight } from 'lucide-react';

const POSITION_LABELS: Record<Position, string> = {
  agree: 'Stimme zu',
  neutral: 'Neutral',
  disagree: 'Stimme nicht zu',
};

function getMatchType(userPos: Position, partyPos: Position): 'match' | 'partial' | 'mismatch' {
  if (userPos === partyPos) return 'match';
  if (
    (userPos === 'agree' && partyPos === 'neutral') ||
    (userPos === 'neutral' && partyPos === 'agree') ||
    (userPos === 'disagree' && partyPos === 'neutral') ||
    (userPos === 'neutral' && partyPos === 'disagree')
  ) return 'partial';
  return 'mismatch';
}

function App() {
  const [screen, setScreen] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [doubleWeight, setDoubleWeight] = useState<boolean>(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [legalView, setLegalView] = useState<'impressum' | 'datenschutz' | null>(null);

  const startQuiz = () => {
    setScreen('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
  };

  const handleAnswer = (value: Position | 'skip') => {
    const questionId = questions[currentQuestionIndex].id;
    const newAnswer: UserAnswer = {
      questionId,
      value,
      weight: doubleWeight ? 2 : 1,
    };

    const existingIndex = userAnswers.findIndex((a) => a.questionId === questionId);
    const newAnswers =
      existingIndex >= 0
        ? userAnswers.map((a, i) => (i === existingIndex ? newAnswer : a))
        : [...userAnswers, newAnswer];
    setUserAnswers(newAnswers);
    setDoubleWeight(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setScreen('results');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    const prevAnswer = userAnswers.find((a) => a.questionId === questions[prevIndex].id);
    setDoubleWeight(prevAnswer?.weight === 2);
  };

  const calculateResults = (): MatchResult[] => {
    return parties.map((party) => {
      let score = 0;
      let maxScore = 0;

      userAnswers.forEach((answer) => {
        if (answer.value === 'skip') return;

        const partyPosition = party.positions[answer.questionId];
        // If party didn't answer this question (shouldn't happen in full data), skip
        if (!partyPosition) return;

        const weight = answer.weight;
        maxScore += 2 * weight; // Max points per question is 2 * weight

        if (answer.value === partyPosition) {
          score += 2 * weight;
        } else if (
          (answer.value === 'agree' && partyPosition === 'neutral') ||
          (answer.value === 'neutral' && partyPosition === 'agree') ||
          (answer.value === 'disagree' && partyPosition === 'neutral') ||
          (answer.value === 'neutral' && partyPosition === 'disagree')
        ) {
          score += 1 * weight;
        }
        // 0 points for complete mismatch
      });

      return {
        partyId: party.id,
        score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        maxScore,
        userScore: score,
      };
    }).sort((a, b) => b.score - a.score);
  };

  const restart = () => {
    setScreen('intro');
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedPartyId(null);
  };

  const answeredQuestions = userAnswers.filter((a): a is UserAnswer & { value: Position } => a.value !== 'skip');

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex flex-col">
      <header className="bg-amber-500 p-4 shadow-lg border-b-2 border-amber-400/50 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-black text-amber-400 px-2 py-1 rounded text-sm font-black tracking-wide">BW</span>
            <span className="text-black drop-shadow-sm">woha-lomat</span>
          </h1>
          {screen === 'quiz' && (
            <div className="text-sm font-medium text-black/80">
              Frage {currentQuestionIndex + 1} von {questions.length}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8 flex-1 w-full">
        {screen === 'intro' && (
          <div className="text-center space-y-6 py-10">
            <h2 className="text-3xl font-bold text-zinc-100">Wen wählen bei der Landtagswahl?</h2>
            <p className="text-lg text-zinc-400">
              Vergleichen Sie Ihre Positionen mit denen der Parteien zur Landtagswahl in Baden-Württemberg.
            </p>
            <div className="bg-zinc-900 p-6 rounded-lg shadow-xl border border-amber-500/40 text-left space-y-4">
              <h3 className="font-semibold text-lg text-amber-400">So funktioniert's:</h3>
              <ul className="list-disc list-inside space-y-2 text-zinc-300">
                <li>Sie beantworten {questions.length} Thesen mit "Stimme zu", "Neutral" oder "Stimme nicht zu".</li>
                <li>Sie können Thesen überspringen.</li>
                <li>Sie können einzelne Thesen doppelt gewichten.</li>
                <li>Am Ende sehen Sie, welche Partei am besten zu Ihnen passt.</li>
              </ul>
            </div>
            <button
              onClick={startQuiz}
              className="bg-amber-500 text-black text-lg font-semibold px-8 py-4 rounded-lg hover:bg-amber-400 transition-colors inline-flex items-center gap-2 shadow-lg border-2 border-amber-400/50"
            >
              Starten <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {screen === 'quiz' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900 p-8 rounded-lg shadow-xl border border-amber-500/40 min-h-[200px] flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-700">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase mb-4">
                {currentQuestion.category}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight">
                {currentQuestion.text}
              </h3>
              {currentQuestion.explanation && (
                <div className="mt-4 text-zinc-500 text-sm flex items-center gap-1">
                  <Info className="w-4 h-4" /> Mehr Infos
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <button
                onClick={() => handleAnswer('agree')}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold transition-all hover:border-amber-400"
              >
                <Check className="w-8 h-8" />
                Stimme zu
              </button>
              <button
                onClick={() => handleAnswer('neutral')}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition-all"
              >
                <Minus className="w-8 h-8" />
                Neutral
              </button>
              <button
                onClick={() => handleAnswer('disagree')}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-red-600 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold transition-all hover:border-red-500"
              >
                <X className="w-8 h-8" />
                Stimme nicht zu
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>
                <button
                  onClick={() => handleAnswer('skip')}
                  className="text-zinc-400 hover:text-zinc-200 font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Überspringen
                </button>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={doubleWeight}
                  onChange={(e) => setDoubleWeight(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-500 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-black"
                />
                <span className="text-zinc-400 group-hover:text-zinc-200 font-medium">
                  These doppelt gewichten
                </span>
              </label>
            </div>
          </div>
        )}

        {screen === 'results' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {selectedPartyId ? (
              <>
                <button
                  onClick={() => setSelectedPartyId(null)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 text-sm font-medium mb-4"
                >
                  ← Zurück zur Übersicht
                </button>
                {(() => {
                  const party = parties.find(p => p.id === selectedPartyId)!;
                  const result = calculateResults().find(r => r.partyId === selectedPartyId)!;
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-zinc-900 border border-amber-500/40">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg ring-2 ring-amber-500/30"
                          style={{ backgroundColor: party.color }}
                        >
                          {party.name}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-zinc-100">{party.longName}</h2>
                          <p className="text-amber-400 font-semibold">{result.score}% Übereinstimmung</p>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4">Ihre Position im Vergleich zur Partei bei jeder beantworteten These:</p>
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                        {answeredQuestions.map((answer) => {
                          const question = questions.find(q => q.id === answer.questionId)!;
                          const partyPosition = party.positions[answer.questionId];
                          if (!partyPosition) return null;
                          const matchType = getMatchType(answer.value, partyPosition);
                          return (
                            <div
                              key={answer.questionId}
                              className={`p-4 rounded-lg border text-left ${
                                matchType === 'match'
                                  ? 'bg-emerald-500/10 border-emerald-500/50'
                                  : matchType === 'partial'
                                  ? 'bg-amber-500/10 border-amber-500/50'
                                  : 'bg-red-600/10 border-red-600/50'
                              }`}
                            >
                              <p className="text-zinc-100 font-medium mb-2">{question.text}</p>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span className="text-zinc-400">
                                  Sie: <span className="text-zinc-200">{POSITION_LABELS[answer.value]}</span>
                                </span>
                                <span className="text-zinc-500">|</span>
                                <span className="text-zinc-400">
                                  {party.longName}: <span className="text-zinc-200">{POSITION_LABELS[partyPosition]}</span>
                                </span>
                                <span className="ml-auto font-medium">
                                  {matchType === 'match' && <span className="text-emerald-400">✓ Übereinstimmung</span>}
                                  {matchType === 'partial' && <span className="text-amber-400">○ Teilweise</span>}
                                  {matchType === 'mismatch' && <span className="text-red-400">✗ Keine Übereinstimmung</span>}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center mb-8 text-zinc-100">Ihr Ergebnis</h2>
                <p className="text-center text-zinc-400 text-sm mb-4">Klicken Sie auf eine Partei, um die Übereinstimmung bei den einzelnen Thesen zu sehen.</p>
                <div className="space-y-4">
                  {calculateResults().map((result) => {
                    const party = parties.find(p => p.id === result.partyId)!;
                    return (
                      <button
                        key={result.partyId}
                        type="button"
                        onClick={() => setSelectedPartyId(result.partyId)}
                        className="w-full bg-zinc-900 p-4 rounded-lg shadow-xl border border-amber-500/40 flex items-center gap-4 hover:border-amber-500/60 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg ring-2 ring-amber-500/30"
                          style={{ backgroundColor: party.color }}
                        >
                          {party.name}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-end mb-1">
                            <h3 className="font-bold text-lg text-zinc-100">{party.longName}</h3>
                            <span className="text-2xl font-bold text-amber-400">{result.score}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${result.score}%`,
                                backgroundColor: party.color,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-amber-500/70 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex justify-center pt-8">
              <button
                onClick={restart}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium px-6 py-3 rounded-lg hover:bg-zinc-900 transition-colors border-2 border-amber-500/50 hover:border-amber-500"
              >
                <RotateCcw className="w-5 h-5" />
                woha-lomat neu starten
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
          <button
            type="button"
            onClick={() => setLegalView('impressum')}
            className="hover:text-amber-400 transition-colors underline underline-offset-2"
          >
            Impressum
          </button>
          <span className="text-zinc-600">|</span>
          <button
            type="button"
            onClick={() => setLegalView('datenschutz')}
            className="hover:text-amber-400 transition-colors underline underline-offset-2"
          >
            Datenschutz
          </button>
        </div>
      </footer>

      {legalView && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start p-4 overflow-auto"
          role="dialog"
          aria-modal="true"
          aria-label={legalView === 'impressum' ? IMPRESSUM_TITLE : DATENSCHUTZ_TITLE}
          onClick={() => setLegalView(null)}
        >
          <div
            className="max-w-2xl w-full bg-zinc-900 rounded-lg border border-amber-500/40 shadow-xl p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-400">
                {legalView === 'impressum' ? IMPRESSUM_TITLE : DATENSCHUTZ_TITLE}
              </h2>
              <button
                type="button"
                onClick={() => setLegalView(null)}
                className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none text-zinc-300 space-y-3 [&_p]:mb-2 [&_strong]:text-zinc-200"
              dangerouslySetInnerHTML={{
                __html: legalView === 'impressum' ? IMPRESSUM_HTML : DATENSCHUTZ_HTML,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
