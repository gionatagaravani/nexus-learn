"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    questions: Question[];
  };
  onClose: () => void;
  onComplete: (score: number) => void;
}

export function QuizPlayer({ quiz, onClose, onComplete }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { t } = useTranslation();

  const questions = quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (option: string) => {
    if (showExplanation) return;
    const optionLetter = option.substring(0, 1); // Extract A, B, C, or D
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionLetter });
  };

  const handleNext = () => {
    if (showExplanation) {
      if (isLastQuestion) {
        finishQuiz();
      } else {
        setShowExplanation(false);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      setShowExplanation(true);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / questions.length) * 100);
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          score,
        }),
      });

      if (!response.ok) throw new Error("Failed to save score");
      
      setIsFinished(true);
      onComplete(score);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert(t('quiz.saveFailed'));
      setIsFinished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">{t('quiz.completed')}</h2>
          <p className="text-neutral-500 mb-6 font-medium">{t('quiz.finishedDesc', { title: quiz.title })}</p>
          
          <div className="bg-neutral-50 rounded-xl p-6 mb-8 border border-black/[0.04]">
            <div className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-1">{t('quiz.yourScore')}</div>
            <div className={`text-5xl font-bold ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
              {score}%
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
          >
            {t('quiz.backToSubject')}
          </button>
        </motion.div>
      </div>
    );
  }

  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors text-neutral-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-semibold text-black">{quiz.title}</h3>
            <p className="text-xs text-neutral-500 font-medium">{t('quiz.questionProgress', { current: currentQuestionIndex + 1, total: questions.length })}</p>
          </div>
        </div>
        <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-black leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const letter = option.substring(0, 1);
                  const isSelected = selectedAnswer === letter;
                  const isThisCorrect = letter === currentQuestion.correctAnswer;
                  
                  let stateStyle = "border-black/[0.08] hover:border-black/[0.2] hover:bg-black/[0.01]";
                  if (isSelected) stateStyle = "border-black bg-black/[0.02] ring-2 ring-black/5";
                  
                  if (showExplanation) {
                    if (isThisCorrect) stateStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                    else if (isSelected) stateStyle = "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20";
                    else stateStyle = "border-black/[0.04] opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showExplanation}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all group ${stateStyle}`}
                    >
                      <span className="font-medium">{option}</span>
                      {showExplanation && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {showExplanation && isSelected && !isThisCorrect && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`p-5 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider mb-2">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
                  </div>
                  <p className="text-[14px] font-medium leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-black/[0.06] flex justify-center">
        <div className="w-full max-w-2xl flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0 || showExplanation}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-black disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.previous')}
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedAnswer || isSubmitting}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md
              ${!selectedAnswer ? 'bg-neutral-100 text-neutral-400' : 'bg-black text-white hover:bg-neutral-800 hover:shadow-lg'}
            `}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showExplanation ? (
              isLastQuestion ? t('quiz.finishQuiz') : t('quiz.nextQuestion')
            ) : (
              t('quiz.checkAnswer')
            )}
            {!isSubmitting && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
