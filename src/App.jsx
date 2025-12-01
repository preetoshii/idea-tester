import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import initialIdeas from './data/ideas.json';
import { Check, X, Settings, ChevronRight, RotateCw, Heart, HelpCircle, Download, Copy } from 'lucide-react';

const PHASES = ["Planning", "Action", "Integration"];

export default function App() {
  // State
  const [ideas, setIdeas] = useState(() => 
    initialIdeas.map(idea => ({ ...idea, status: 'candidate' })) // candidate, cut, loved
  );
  const [goals, setGoals] = useState({ Planning: 3, Action: 3, Integration: 3 });
  const [appPhase, setAppPhase] = useState('setup'); // setup, swiping
  
  // Queue Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitVariant, setExitVariant] = useState(null); // 'cut', 'keep', 'love'

  // Derived State
  const activeCandidates = useMemo(() => {
    return ideas.filter(i => i.status === 'candidate' || i.status === 'loved');
  }, [ideas]);

  const currentIdea = activeCandidates[currentIndex];

  const stats = useMemo(() => {
    const s = { Planning: 0, Action: 0, Integration: 0 };
    activeCandidates.forEach(idea => {
        if (s[idea.phase] !== undefined) {
            s[idea.phase]++;
        }
    });
    return s;
  }, [activeCandidates]);

  // Handlers
  const startSwiping = () => {
    setCurrentIndex(0);
    setAppPhase('swiping');
  };

  const handleAction = async (action) => {
    if (!currentIdea) return;
    
    // 1. Set animation variant
    setExitVariant(action);
    
    // 2. Wait for animation to finish (approximate duration)
    await new Promise(r => setTimeout(r, 600)); // Slightly longer to allow full exit

    // 3. Update State Logic
    if (action === 'cut') {
      setIdeas(prev => prev.map(i => 
        i.id === currentIdea.id ? { ...i, status: 'cut' } : i
      ));
      if (currentIndex >= activeCandidates.length - 1) {
         setCurrentIndex(0);
      }
    } else if (action === 'love') {
        setIdeas(prev => prev.map(i => 
            i.id === currentIdea.id ? { ...i, status: 'loved' } : i
        ));
        moveToNext();
    } else if (action === 'keep') {
        moveToNext();
    }
    
    // 4. Reset animation state
    setExitVariant(null);
  };

  const moveToNext = () => {
      if (currentIndex >= activeCandidates.length - 1) {
        setCurrentIndex(0); // Loop back to start
      } else {
        setCurrentIndex(prev => prev + 1);
      }
  };

  const getDistanceToGoal = (phase) => {
    const current = stats[phase];
    const goal = goals[phase];
    return Math.max(0, current - goal);
  };

  // Helper: Format remaining ideas
  const formatIdeasForExport = () => {
      const remaining = ideas.filter(i => i.status !== 'cut');
      let text = "# Remaining Ideas\n\n";
      
      PHASES.forEach(phase => {
          const phaseIdeas = remaining.filter(i => i.phase === phase);
          if (phaseIdeas.length > 0) {
              text += `## ${phase} (${phaseIdeas.length})\n\n`;
              phaseIdeas.forEach(idea => {
                  const loveIcon = idea.status === 'loved' ? "❤️ " : "";
                  text += `### ${loveIcon}${idea.title}\n`;
                  if(idea.purpose) text += `- **Purpose**: ${idea.purpose}\n`;
                  if(idea.how_it_works) text += `- **How It Works**: ${idea.how_it_works}\n`;
                  text += "\n";
              });
          }
      });
      return text;
  };

  const handleCopy = async () => {
      const text = formatIdeasForExport();
      try {
          await navigator.clipboard.writeText(text);
          alert("Remaining ideas copied to clipboard!");
      } catch (err) {
          console.error("Failed to copy", err);
      }
  };

  const handleDownload = () => {
      const text = formatIdeasForExport();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'remaining_ideas.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  // Animation Variants
  const cardVariants = {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: (variant) => {
        if (variant === 'cut') {
            return { 
                opacity: 0, 
                scale: 0.2, // Dramatic shrink
                rotate: 45, 
                y: 200, // Fall down
                filter: "grayscale(100%) blur(10px)",
                transition: { duration: 0.5, ease: "easeInOut" }
            };
        }
        if (variant === 'love') {
             return { 
                x: 500, 
                opacity: 0, 
                rotate: 10, 
                scale: 1.05,
                transition: { duration: 0.3, ease: "backIn" }
            };
        }
        // Keep / Not Sure
        return { 
            x: 500, 
            opacity: 0, 
            rotate: 5,
            transition: { duration: 0.3 }
        };
    }
  };

  // Stamp Variants
  const heartStampVariants = {
      initial: { scale: 2, opacity: 0, rotate: -15 },
      animate: { scale: 1, opacity: 1, rotate: -15, transition: { type: "spring", bounce: 0.5 } },
      exit: { opacity: 0 }
  }

  // Setup Screen
  if (appPhase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">Survivor Mode</h1>
          <p className="mb-8 text-gray-500 text-center text-sm">
            Whittle down the deck until only your favorites remain.
          </p>
          
          <div className="space-y-6 mb-8">
            {PHASES.map(phase => (
              <div key={phase} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <label className="font-semibold text-gray-700">{phase}</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 uppercase font-bold">Target</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    value={goals[phase]} 
                    onChange={(e) => setGoals({...goals, [phase]: parseInt(e.target.value) || 1})}
                    className="w-16 p-2 border border-gray-200 rounded-md text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={startSwiping}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Start Cutting <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Empty State (All cut? Unlikely if goal > 0, but possible if user cuts everything)
  if (!currentIdea && activeCandidates.length === 0) {
     return (
         <div className="min-h-screen flex items-center justify-center p-6 text-center">
             <div>
                 <h2 className="text-2xl font-bold mb-4">Deck Cleared</h2>
                 <p className="text-gray-500 mb-6">You've cut every single idea.</p>
                 <button onClick={() => window.location.reload()} className="px-6 py-3 bg-black text-white rounded-full">Restart</button>
             </div>
         </div>
     );
  }

  // Main Interface
  const currentPhase = currentIdea?.phase || "";
  const distance = getDistanceToGoal(currentPhase);
  const isGoalMet = distance === 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
      {/* Stats Dashboard */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto p-4">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setAppPhase('setup')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors" title="Settings">
                    <Settings size={20} />
                </button>
                
                <div className="flex gap-2">
                    <button 
                        onClick={handleCopy} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase hover:bg-blue-50 hover:text-blue-600 transition-all" 
                        title="Copy Remaining Ideas"
                    >
                        <Copy size={16} />
                        Copy Remaining Ideas
                    </button>
                    <button 
                        onClick={handleDownload} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase hover:bg-blue-50 hover:text-blue-600 transition-all" 
                        title="Download Remaining Ideas"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
                {PHASES.map(phase => {
                    const count = stats[phase];
                    const goal = goals[phase];
                    const dist = Math.max(0, count - goal);
                    const met = dist === 0;
                    
                    return (
                        <div key={phase} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${currentPhase === phase ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{phase}</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-bold ${met ? 'text-green-600' : 'text-gray-900'}`}>
                                    {count}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">/ {goal}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
             
            {/* Context Banner */}
            {currentIdea && (
                <div className={`text-center py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wide transition-colors
                    ${isGoalMet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {isGoalMet 
                        ? `Goal Met! (${stats[currentPhase]} items remaining)`
                        : `Cut ${distance} more to reach goal`
                    }
                </div>
            )}
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
          <AnimatePresence mode='wait' custom={exitVariant}>
            {currentIdea ? (
            <motion.div 
                key={currentIdea.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={exitVariant}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] relative ring-1 ring-black/5 origin-bottom"
            >
                
                {/* Love Stamp Animation */}
                {(exitVariant === 'love' || currentIdea.status === 'loved') && (
                     <motion.div 
                        variants={heartStampVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute top-6 right-6 z-50 pointer-events-none"
                     >
                         <div className="border-4 border-pink-500 text-pink-500 rounded-full p-3 shadow-lg bg-white/80 backdrop-blur-sm transform -rotate-12">
                             <Heart size={48} fill="currentColor" strokeWidth={2} />
                         </div>
                     </motion.div>
                )}

                {/* Header */}
                <div className="p-8 bg-white border-b border-gray-100 relative">
                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                            {currentIdea.phase}
                        </span>
                        <span className="text-gray-300 text-xs font-mono">#{currentIdea.id}</span>
                    </div>
                    <h2 className="text-3xl font-bold leading-tight text-gray-900 mb-2">{currentIdea.title}</h2>
                    {currentIdea.journey_phase && (
                        <p className="text-gray-500 text-sm font-medium">{currentIdea.journey_phase}</p>
                    )}
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto space-y-6 text-gray-600 text-base leading-relaxed">
                {currentIdea.purpose && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Purpose</h3>
                        <p>{currentIdea.purpose}</p>
                    </div>
                )}
                
                {currentIdea.how_it_works && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">How It Works</h3>
                        <p>{currentIdea.how_it_works}</p>
                    </div>
                )}

                {currentIdea.output && (
                    <div className="pl-4 border-l-2 border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Output</h3>
                        <p className="text-gray-500 italic">{currentIdea.output}</p>
                    </div>
                )}

                {currentIdea.why_this_works && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Why This Works</h3>
                        <p className="text-blue-900/80 text-sm">{currentIdea.why_this_works}</p>
                    </div>
                )}
                </div>
            </motion.div>
            ) : null}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-30">
        <div className="max-w-md mx-auto flex gap-3">
          
          {/* Cut Button */}
          <button 
            onClick={() => handleAction('cut')}
            disabled={!!exitVariant}
            className="flex-1 group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 border border-gray-100 hover:border-red-100 relative disabled:opacity-50 disabled:pointer-events-none"
            title="Remove from deck completely"
          >
            <X size={24} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Cut</span>
            
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Remove from deck
            </div>
          </button>

           {/* Keep / Not Sure Button */}
           <button 
            onClick={() => handleAction('keep')}
            disabled={!!exitVariant}
            className="flex-1 group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100 relative disabled:opacity-50 disabled:pointer-events-none"
            title="Keep in rotation for later"
          >
            <HelpCircle size={24} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Not Sure</span>
            
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Keep in rotation
            </div>
          </button>

          {/* Love Button */}
          <button 
            onClick={() => handleAction('love')}
            disabled={!!exitVariant}
            className="flex-[1.5] group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10 relative disabled:opacity-50 disabled:pointer-events-none"
            title="Mark as favorite and keep"
          >
            <Heart size={24} fill={currentIdea?.status === 'loved' ? "currentColor" : "none"} className={currentIdea?.status === 'loved' ? "text-pink-500" : ""} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Love It</span>
            
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Mark favorite & keep
            </div>
          </button>

        </div>
        
        <div className="text-center mt-6">
             <button onClick={() => setAppPhase('setup')} className="text-xs font-bold text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors">
                Restart / Change Goals
             </button>
        </div>
      </div>
    </div>
  );
}
