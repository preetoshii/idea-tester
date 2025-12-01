import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import initialIdeas from './data/ideas.json';
import { Check, X, Settings, ChevronRight, ChevronLeft, Heart, HelpCircle, Download, Copy, ZoomIn, Star, Maximize2, Info, Send, User } from 'lucide-react';

const PHASES = ["Planning", "Action", "Integration"];

const PHASE_DESCRIPTIONS = {
    "Planning": "Translating the \"North Star\" into concrete steps and anticipating the path ahead.",
    "Action": "Executing the plan, building skills, and maintaining momentum.",
    "Integration": "Making sense of the data, celebrating wins, and adjusting the plan."
};

const YOUR_EMAIL = "preetoshi@betterup.co"; 

// --- COMPONENTS ---

const DetailModal = ({ idea, onClose }) => {
    if (!idea) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded mb-2">{idea.phase}</span>
                        <h2 className="text-2xl font-bold text-gray-900">{idea.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6 text-gray-700">
                    {idea.purpose && (
                        <div>
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wide mb-1">Purpose</h3>
                            <p>{idea.purpose}</p>
                        </div>
                    )}
                    {idea.toolsets_used && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wide mb-1">Tools Used</h3>
                            <p className="font-medium text-gray-800">{idea.toolsets_used}</p>
                        </div>
                    )}
                    {idea.how_it_works && (
                        <div>
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wide mb-1">How It Works</h3>
                            <p>{idea.how_it_works}</p>
                        </div>
                    )}
                    {idea.output && (
                        <div>
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wide mb-1">Output</h3>
                            <p className="italic text-gray-600">{idea.output}</p>
                        </div>
                    )}
                    {idea.why_this_works && (
                        <div className="bg-blue-50 p-4 rounded-lg text-blue-900 text-sm">
                            <h3 className="font-bold text-blue-800 uppercase text-xs tracking-wide mb-1">Why This Works</h3>
                            <p>{idea.why_this_works}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const DraggableStar = ({ id, onDragStart, onDragEnd, onDrag }) => {
    return (
        <motion.div
            drag
            dragConstraints={false}
            dragSnapToOrigin
            dragElastic={0}
            dragMomentum={false}
            dragTransition={{ power: 0, timeConstant: 0 }}
            whileDrag={{ 
                scale: 1.2, 
                cursor: 'grabbing', 
                zIndex: 9999,
                position: 'fixed' // This is key - makes it escape all containers
            }}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={(e, info) => onDragEnd(e, info, id)}
            className="cursor-grab active:cursor-grabbing p-2 hover:scale-110 transition-transform motion-drag-star"
        >
            <div className="bg-yellow-400 text-white p-3 rounded-full shadow-lg shadow-yellow-400/50 ring-2 ring-white pointer-events-none">
                <Star size={24} fill="currentColor" strokeWidth={2} className="text-yellow-600" />
            </div>
        </motion.div>
    );
};

const CanvasCard = ({ idea, votes, onRemoveVote, onViewDetails, isHovered }) => {
    return (
        <div 
            className={`bg-white rounded-xl shadow-md border transition-all duration-300 w-80 p-4 flex flex-col relative group select-none cursor-pointer
                ${isHovered ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.02] z-10' : 'border-gray-200 hover:shadow-lg'}
            `}
            data-idea-id={idea.id}
            onClick={() => onViewDetails(idea)}
            title="Click to Read Details"
        >
            <div className="flex justify-between items-start mb-2 pointer-events-none">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded-full">
                    {idea.phase}
                </span>
                <div className="text-gray-400" title="View Details">
                    <Maximize2 size={16} />
                </div>
            </div>
            
            <h3 className="font-bold text-lg leading-tight mb-2 pointer-events-none">{idea.title}</h3>
            
            <div className="flex-1 overflow-hidden mb-4 pointer-events-none">
                <p className="text-sm text-gray-600 line-clamp-3">{idea.purpose}</p>
                <div className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info size={12} /> Click for details
                </div>
            </div>

            <div className="mt-auto border-t pt-3 flex justify-between items-center min-h-[40px]" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1">
                    {[...Array(votes || 0)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform group/star"
                            onClick={(e) => { e.stopPropagation(); onRemoveVote(idea.id); }}
                            title="Click to remove star"
                        >
                            <Star size={32} fill="currentColor" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/star:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Click to remove star
                            </div>
                        </motion.div>
                    ))}
                    {(votes || 0) === 0 && <span className="text-xs text-gray-300 italic">Drag star here</span>}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                    {votes || 0}/2
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [appPhaseIndex, setAppPhaseIndex] = useState(0); 
  const [votes, setVotes] = useState({}); 
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [draggedOverId, setDraggedOverId] = useState(null);
  const [draggedOverDock, setDraggedOverDock] = useState(false);
  
  // Track stars per phase so going back works correctly
  const [starsByPhase, setStarsByPhase] = useState({});
  
  const [userName, setUserName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const cardRectsRef = React.useRef([]);
  const dockRectRef = React.useRef(null);
  
  const STARS_PER_PHASE = 5;
  const MAX_VOTES_PER_CARD = 2;

  const currentPhaseName = appPhaseIndex > 0 && appPhaseIndex <= 3 ? PHASES[appPhaseIndex - 1] : null;
  
  const phaseIdeas = useMemo(() => {
      if (!currentPhaseName) return [];
      return initialIdeas.filter(i => i.phase === currentPhaseName);
  }, [currentPhaseName]);

  // Get available stars for current phase
  const availableStars = useMemo(() => {
      if (!currentPhaseName) return [];
      return starsByPhase[currentPhaseName] || [];
  }, [currentPhaseName, starsByPhase]);

  // Calculate votes in current phase
  const votesInCurrentPhase = useMemo(() => {
      if (!currentPhaseName) return 0;
      return phaseIdeas.reduce((acc, idea) => acc + (votes[idea.id] || 0), 0);
  }, [phaseIdeas, votes, currentPhaseName]);

  const remainingStars = STARS_PER_PHASE - votesInCurrentPhase;
  const canProceed = remainingStars === 0;

  // Initialize stars for a phase if not already set
  useEffect(() => {
      if (currentPhaseName && !starsByPhase[currentPhaseName]) {
          const newStars = Array.from({ length: STARS_PER_PHASE }).map((_, i) => ({
              id: `${currentPhaseName}-star-${i}-${Date.now()}`,
              index: i
          }));
          setStarsByPhase(prev => ({ ...prev, [currentPhaseName]: newStars }));
      }
  }, [currentPhaseName, starsByPhase]);

  const handleStarDragStart = () => {
      cardRectsRef.current = Array.from(document.querySelectorAll('[data-idea-id]')).map(el => ({
          id: parseInt(el.getAttribute('data-idea-id')),
          rect: el.getBoundingClientRect()
      }));
      
      // Cache dock rect
      const dockEl = document.querySelector('[data-dock-container]');
      if (dockEl) {
          dockRectRef.current = dockEl.getBoundingClientRect();
      }
  };

  const handleStarDrag = (event, info) => {
      const { x, y } = info.point;
      
      // Check dock hover
      if (dockRectRef.current) {
          const overDock = (
              x >= dockRectRef.current.left && 
              x <= dockRectRef.current.right && 
              y >= dockRectRef.current.top && 
              y <= dockRectRef.current.bottom
          );
          setDraggedOverDock(overDock);
      }
      
      // Check card hover
      const hoveredCard = cardRectsRef.current.find(item => {
          return (
              x >= item.rect.left && 
              x <= item.rect.right && 
              y >= item.rect.top && 
              y <= item.rect.bottom
          );
      });

      if (hoveredCard) {
          setDraggedOverId(hoveredCard.id);
      } else {
          setDraggedOverId(null);
      }
  };

  const handleStarDragEnd = (event, info, starId) => {
      const { x, y } = info.point;
      
      // Check if dropped on dock (snap back)
      if (dockRectRef.current) {
          const overDock = (
              x >= dockRectRef.current.left && 
              x <= dockRectRef.current.right && 
              y >= dockRectRef.current.top && 
              y <= dockRectRef.current.bottom
          );
          if (overDock) {
              setDraggedOverDock(false);
              setDraggedOverId(null);
              cardRectsRef.current = [];
              return; // Just snap back, don't vote
          }
      }
      
      // Check card drop
      const targetCard = cardRectsRef.current.find(item => {
          return (
              x >= item.rect.left && 
              x <= item.rect.right && 
              y >= item.rect.top && 
              y <= item.rect.bottom
          );
      });
      
      if (targetCard) {
          handleVote(targetCard.id, starId);
      }
      
      setDraggedOverId(null);
      setDraggedOverDock(false);
      cardRectsRef.current = [];
  };

  const handleVote = (ideaId, starIdToRemove = null) => {
      const currentVotes = votes[ideaId] || 0;
      if (currentVotes >= MAX_VOTES_PER_CARD) return;

      setVotes(prev => ({
          ...prev,
          [ideaId]: currentVotes + 1
      }));
      
      if (starIdToRemove && currentPhaseName) {
          setStarsByPhase(prev => ({
              ...prev,
              [currentPhaseName]: prev[currentPhaseName].filter(s => s.id !== starIdToRemove)
          }));
      }
  };

  const handleRemoveVote = (ideaId) => {
      setVotes(prev => {
          const current = prev[ideaId] || 0;
          if (current <= 0) return prev;
          return { ...prev, [ideaId]: current - 1 };
      });
      
      if (currentPhaseName) {
          setStarsByPhase(prev => ({
              ...prev,
              [currentPhaseName]: [...(prev[currentPhaseName] || []), { 
                  id: `returned-${Date.now()}`, 
                  index: 0 
              }]
          }));
      }
  };

  const handleNext = () => {
      if (appPhaseIndex === 3) {
          // Auto-submit on finish
          handleSendEmail();
      } else {
          setAppPhaseIndex(prev => prev + 1);
      }
  };

  const handlePrevious = () => {
      if (appPhaseIndex > 1) {
          setAppPhaseIndex(prev => prev - 1);
      }
  };

  const generateResults = () => {
      const selectedIdeas = initialIdeas.filter(idea => votes[idea.id] > 0);
      return {
          voter: userName || "Anonymous",
          timestamp: new Date().toISOString(),
          selections: selectedIdeas.map(idea => ({
              id: idea.id,
              title: idea.title,
              phase: idea.phase,
              votes: votes[idea.id]
          }))
      };
  };

  const handleSendEmail = async () => {
      setIsSending(true);
      const results = generateResults();

      const message = `Idea Voting Results from ${results.voter}

Timestamp: ${new Date(results.timestamp).toLocaleString()}

Selections:
${results.selections.map(s => `\n${s.phase} Phase:\n  - ${s.title} (${s.votes} star${s.votes > 1 ? 's' : ''})`).join('\n')}

---
Full JSON:
${JSON.stringify(results, null, 2)}`;

      try {
          const formData = new FormData();
          formData.append('email', YOUR_EMAIL);
          formData.append('subject', `Idea Voting Results from ${results.voter}`);
          formData.append('message', message);
          formData.append('_captcha', 'false');

          const response = await fetch(`https://formsubmit.co/${YOUR_EMAIL}`, {
              method: 'POST',
              body: formData
          });

          if (response.ok) {
              setSentSuccess(true);
              setAppPhaseIndex(4); // Go to completion screen
          } else {
              alert("Failed to send. Please try downloading the file instead.");
          }
      } catch (error) {
          console.error("Error sending:", error);
          alert("Error sending. Please check your connection.");
      } finally {
          setIsSending(false);
      }
  };

  // --- VIEWS ---

  // 1. Intro View
  if (appPhaseIndex === 0) {
      return (
          <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 relative">
              {/* Content - Centered */}
              <div className="flex-1 flex flex-col items-center justify-center px-16 py-24">
                  <div className="w-full max-w-2xl text-left">
                      <h1 className="text-5xl font-semibold mb-8 leading-tight">
                          I want <span className="text-red-600">YOU</span> to vote
                      </h1>
                      
                      <div className="space-y-6 text-lg leading-relaxed text-gray-800 mb-12" style={{ 
                          hyphens: 'auto',
                          hyphenateLimitChars: '6 4 2',
                          orphans: 3,
                          widows: 3
                      }}>
                          <p>
                              We are filling the gaps in the <strong>Planning</strong>, <strong>Action</strong>, and <strong>Integration</strong> phases with some activities. Instead of building complex new features, we are exploring how to reuse and chain our existing toolsets into simple but powerful activities.
                          </p>
                          <p>
                              We've got a bunch of simple ideas. Your job is to drag stars to vote on which of these you find would actually drive the most transformation for users (and yourself!)
                          </p>
                          <p className="text-gray-600">
                              I'll collect these votes and use them to help determine the best ones.
                          </p>
                      </div>

                      <div className="mb-8">
                          <label className="block text-lg font-semibold text-gray-900 mb-3">What's your name?</label>
                          <input 
                              type="text" 
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              placeholder="Enter your full name"
                              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors"
                          />
                      </div>

                      <button 
                          onClick={handleNext}
                          disabled={!userName.trim()}
                          className="bg-black text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Start Voting
                      </button>
                  </div>
              </div>

              {/* Video - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none">
                  <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="h-64 w-auto object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                  >
                      <source src="/voting_preetoshi.mp4" type="video/mp4" />
                  </video>
              </div>
          </div>
      );
  }

  // 2. Complete View
  if (appPhaseIndex === 4) {
      return (
          <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 relative">
              {/* Content - Centered */}
              <div className="flex-1 flex flex-col items-center justify-center px-16 py-24">
                  <div className="w-full max-w-2xl text-left">
                      <h1 className="text-5xl font-semibold mb-8 leading-tight">
                          Sent to Preetoshi!
                      </h1>
                      
                      <div className="space-y-6 text-lg leading-relaxed text-gray-800 mb-12" style={{ 
                          hyphens: 'auto',
                          hyphenateLimitChars: '6 4 2',
                          orphans: 3,
                          widows: 3
                      }}>
                          <p>
                              Your votes will be carefully reviewed by Preetoshi and he will <strong className="text-gray-900">JUDGE YOU</strong> for any votes that disagree with his own.
                          </p>
                          <p className="text-gray-600">
                              Ha! You messed up. You didn't think you'd be in for shame today did you?
                          </p>
                          <p className="text-gray-500 italic">
                              ... Jk
                          </p>
                      </div>
                  </div>
              </div>

              {/* Video - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none">
                  <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="h-64 w-auto object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                  >
                      <source src="/laughing_preetoshi.mp4" type="video/mp4" />
                  </video>
              </div>
          </div>
      );
  }

  // 3. Canvas View (Phases 1-3)
  return (
      <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden font-sans text-gray-900">
          
          <AnimatePresence>
              {selectedIdea && (
                  <DetailModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
              )}
          </AnimatePresence>

          <div className="bg-white border-b border-gray-200 p-4 px-6 flex flex-col items-center z-10 shadow-sm relative">
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900">
                      {currentPhaseName} Phase
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-mono">
                          {appPhaseIndex}/3
                      </span>
                  </div>
                  <p className="text-sm text-gray-500 max-w-xl mx-auto mt-1 leading-snug">
                      {PHASE_DESCRIPTIONS[currentPhaseName]}
                  </p>
                </div>
          </div>

          <div className="flex-1 bg-gray-50 relative cursor-grab active:cursor-grabbing overflow-hidden">
              <TransformWrapper
                  initialScale={1}
                  initialPositionX={0}
                  initialPositionY={0}
                  minScale={0.5}
                  maxScale={2}
                  centerOnInit={true}
                  limitToBounds={false}
              >
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                      <div className="w-[2000px] h-[1500px] flex flex-wrap content-start p-20 gap-8 bg-dot-pattern bg-[length:20px_20px]">
                          {phaseIdeas.map(idea => (
                              <CanvasCard 
                                  key={idea.id} 
                                  idea={idea} 
                                  votes={votes[idea.id]} 
                                  onRemoveVote={handleRemoveVote}
                                  onViewDetails={setSelectedIdea}
                                  isHovered={draggedOverId === idea.id}
                              />
                          ))}
                      </div>
                  </TransformComponent>
              </TransformWrapper>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none flex justify-center items-end z-20 overflow-visible">
              <div 
                  className={`pointer-events-auto bg-white/90 backdrop-blur-md border shadow-2xl rounded-2xl p-4 flex items-center gap-8 overflow-visible transition-all duration-300
                      ${draggedOverDock ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200'}
                  `}
                  data-dock-container
              >
                  
                  <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Voting Star Bank</span>
                      <div className="flex gap-2 bg-gray-100 p-2 rounded-xl inner-shadow overflow-visible">
                          {availableStars.map((star) => (
                              <DraggableStar 
                                  key={star.id} 
                                  id={star.id}
                                  onDragStart={handleStarDragStart}
                                  onDrag={handleStarDrag}
                                  onDragEnd={handleStarDragEnd}
                              />
                          ))}
                          {availableStars.length === 0 && (
                              <div className="text-xs font-bold text-gray-400 px-4 py-2">All stars used!</div>
                          )}
                      </div>
      </div>

                  <div className="h-full border-l border-gray-200 pl-8 flex items-center gap-4">
                    {appPhaseIndex > 1 && (
                        <button 
                            onClick={handlePrevious}
                            className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                    )}
                    <button 
                        onClick={handleNext}
                        disabled={!canProceed || isSending}
                        className="bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <span className="animate-pulse">Sending...</span>
                        ) : appPhaseIndex === 3 ? (
                            "Complete"
                        ) : (
                            <>Next Phase <ChevronRight size={20} /></>
                        )}
        </button>
                  </div>
              </div>
          </div>
      </div>
  );
}
