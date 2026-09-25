/**
 * AI Travel Copilot Drawer (Toggleable Drawer / Modal)
 * Provides conversational planning while keeping the main app interface accessible
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { TripState, ChatMessage } from '../types/travel';
import { aiTravelAgent } from '../services/aiTravelAgent';

interface AiPlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripState;
  onUpdateTrip: (updates: Partial<TripState>) => void;
}

export const AiPlannerDrawer: React.FC<AiPlannerDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I'm your **VoyageMCP Travel Copilot**. I have your trip context for **${trip.destination.name}, ${trip.destination.country}** (${trip.durationDays} days, base budget SGD ${trip.baseBudgetSGD.toLocaleString()}) loaded.\n\n` +
        `You can ask me to re-plan days, modify duration, reallocate budgets in SGD, recommend hidden dining gems, or check visa and weather requirements!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await aiTravelAgent.processPrompt(text, trip, messages);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.reply,
        timestamp: 'Just now',
        toolCalls: response.toolCallsExecuted.map((tc) => ({
          toolName: tc.toolName,
          args: tc.args,
          resultSummary: tc.resultSummary,
        })),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.tripUpdates) {
        onUpdateTrip(response.tripUpdates);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: `I encountered an issue processing that: ${err.message || 'Please try again'}.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const samplePrompts = [
    'Make the trip 6 days instead of 8',
    'Add more street food spots on Day 2',
    'Adjust budget to SGD 3,500 total',
    'Check visa requirements for Singapore passport',
    'What is the weather and what should I pack?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-700 bg-slate-900 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">AI Travel Copilot</h3>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Gemini 3.8 + MCP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Trip Context: {trip.destination.name} • {trip.durationDays} Days • SGD {trip.baseBudgetSGD.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          title="Close AI Copilot"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="border-b border-slate-800 bg-slate-950/40 p-3 overflow-x-auto flex gap-2 shrink-0">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isProcessing}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500 text-slate-950 font-medium'
                      : 'border border-slate-800 bg-slate-950/90 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* MCP Tool Badges if assistant executed them */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <Zap className="h-3 w-3" />
                        <span>MCP Integrations Executed:</span>
                      </div>
                      {msg.toolCalls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-[11px] text-slate-300"
                        >
                          <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                            <span>⚡ {tc.toolName}</span>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          </div>
                          {tc.resultSummary && (
                            <p className="mt-0.5 text-slate-400 text-[10px]">{tc.resultSummary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="block text-[10px] text-slate-500 px-1">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200 text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span>Consulting Travel MCP protocol & updating trip state...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-800 bg-slate-950/80 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Copilot to modify plan, adjust budget, etc..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <span className="block pt-1.5 text-center text-[10px] text-slate-500">
          Changes directly synchronize with your Itinerary, Map, and Budget tabs.
        </span>
      </div>
    </div>
  );
};
