import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import initialIdeas from './data/ideas.json';
import { Check, X, Settings, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Heart, HelpCircle, Download, Copy, ZoomIn, Star, Maximize2, Info, Send, User, BarChart3 } from 'lucide-react';

const PHASES = ["Planning", "Action", "Integration"];

const PHASE_DESCRIPTIONS = {
    "Planning": "Turning the \"North Star\" into a Roadmap. The user knows what they want (from Discovery), but not how to get there. This phase is about strategy, not just to-do lists. We need to help them anticipate obstacles, make trade-offs, and define the specific steps to turn a vague aspiration into a concrete commitment.",
    "Action": "Overcoming Friction in the Real World. The user has left the planning stage and is in the \"Messy Middle\" of execution. This is where motivation fades and old habits fight back. Our goal is to provide micro-interventions that reduce the friction of starting, help regulate stress, and keep them moving when things get hard.",
    "Integration": "Turning Experience into Wisdom. The user has tried to take action—now they need to make sense of the results. This phase focuses on pattern recognition: distinguishing between bad luck and bad process, celebrating progress, and deciding how to adjust the plan for the next cycle."
};

const YOUR_EMAIL = "preetoshi@betterup.co"; 

// --- COMPONENTS ---

const DetailModal = ({ idea, votes, onRemoveVote, onClose, isHovered, onNext, onPrev, hasNext, hasPrev }) => {
    if (!idea) return null;

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
            if (e.key === 'ArrowRight' && hasNext) onNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, onClose, hasNext, hasPrev]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            {/* Navigation Buttons - Outside Modal */}
            {hasPrev && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-50 hidden md:flex"
                    title="Previous Idea (Left Arrow)"
                >
                    <ChevronLeft size={32} />
                </button>
            )}
            
            {hasNext && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-50 hidden md:flex"
                    title="Next Idea (Right Arrow)"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            <motion.div 
                key={idea.id} // Key ensures animation triggers on change
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative transition-all duration-200 ${isHovered ? 'ring-4 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''}`}
                onClick={e => e.stopPropagation()}
                data-idea-id={idea.id}
            >
                {/* Mobile Navigation Overlay (Tap zones on sides?) - Optional but sticking to visible buttons for clarity */}
                <div className="md:hidden flex justify-between absolute top-1/2 -translate-y-1/2 w-full px-2 pointer-events-none">
                    {hasPrev ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                            className="p-2 bg-black/20 text-white rounded-full backdrop-blur-sm pointer-events-auto"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    ) : <div></div>}
                    {hasNext && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                            className="p-2 bg-black/20 text-white rounded-full backdrop-blur-sm pointer-events-auto"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>

                {/* Drag Overlay Highlight */}
                {isHovered && <div className="absolute inset-0 border-4 border-blue-500 z-50 rounded-2xl pointer-events-none"></div>}

                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div className="flex-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded mb-2">{idea.phase}</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{idea.title}</h2>
                        
                        {/* Stars Display in Modal */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                                {[...Array(votes || 0)].map((_, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform group/star relative"
                                        onClick={(e) => { e.stopPropagation(); onRemoveVote(idea.id); }}
                                        title="Click to remove star"
                                    >
                                        <Star size={32} fill="currentColor" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/star:opacity-100 transition-opacity">
                                            <X size={20} className="text-red-600 drop-shadow-md" strokeWidth={3} />
                                        </div>
                                    </motion.div>
                                ))}
                                {(votes || 0) === 0 && <span className="text-sm text-gray-400 italic flex items-center gap-1"><Star size={16} /> Drag stars here to vote</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors ml-4"><X size={24} /></button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6 text-gray-700 relative z-10">
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
            whileDrag={{ 
                scale: 1.2, 
                cursor: 'grabbing', 
                zIndex: 9999,
                transition: { duration: 0 } // Instant scale, no animation
            }}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={(e, info) => onDragEnd(e, info, id)}
            style={{ 
                position: 'relative',
                touchAction: 'none',
                willChange: 'transform'
            }}
            className="cursor-grab active:cursor-grabbing p-2 motion-drag-star"
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
            </div>

            {/* Desktop Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center z-40 pointer-events-none">
                <span className="text-white font-semibold text-lg bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                    Read more (plz)
                </span>
            </div>

            <div className="mt-auto border-t pt-3 flex justify-between items-center min-h-[40px] relative z-50" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1">
                    {[...Array(votes || 0)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform group/star relative"
                            onClick={(e) => { e.stopPropagation(); onRemoveVote(idea.id); }}
                            title="Click to remove star"
                        >
                            <Star size={32} fill="currentColor" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/star:opacity-100 transition-opacity">
                                <X size={20} className="text-red-600 drop-shadow-md" strokeWidth={3} />
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

// Transition Overlay Component
const TransitionOverlay = ({ show, message, onComplete }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (show) {
            setIsExiting(false); // Reset when showing
            // After fade in completes, wait, then fade out
            const timer = setTimeout(() => {
                setIsExiting(true);
                // Call onComplete after fade out animation
                setTimeout(() => {
                    onComplete();
                }, 500); // Match fade out duration
            }, 1500); // Show message for 1.5 seconds

            return () => clearTimeout(timer);
        } else {
            setIsExiting(false); // Reset when hidden
        }
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExiting ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: isExiting ? 0.9 : 1, opacity: isExiting ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl md:text-6xl font-semibold text-gray-900 text-center px-8 md:px-0 leading-tight"
                    >
                        {message}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Ranking Overlay Component
const RankingOverlay = ({ show, onClose, rankings, isLoading }) => {
    const [activeTab, setActiveTab] = useState(PHASES[0]); // Default to first phase

    if (!show) return null;

    const filteredRankings = rankings.filter(item => item.phase === activeTab);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8"
                    onClick={onClose}
                >
                    {/* Frosted background */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                    
                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-200 flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-semibold text-gray-900">Vote Rankings</h2>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                {PHASES.map(phase => (
                                    <button
                                        key={phase}
                                        onClick={() => setActiveTab(phase)}
                                        className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                                            activeTab === phase 
                                            ? 'bg-black text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {phase}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Rankings List */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {isLoading ? (
                                <div className="text-center py-12 text-gray-500">Loading votes...</div>
                            ) : filteredRankings.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No votes yet for this phase</div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRankings.map((item, index) => (
                                        <div 
                                            key={item.id}
                                            className="flex items-center gap-6 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-semibold text-lg">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Star size={16} fill="currentColor" className="text-yellow-400" />
                                                    <span className="text-sm font-medium flex items-center gap-1">
                                                        {item.totalStars} {item.totalStars === 1 ? 'star' : 'stars'} 
                                                        {item.voterCount > 0 && (
                                                            <span className="text-gray-400 ml-1 group relative cursor-help">
                                                                from {item.voterCount} {item.voterCount === 1 ? 'voter' : 'voters'}
                                                                
                                                                {/* Tooltip */}
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                                    {item.voterNames && item.voterNames.length > 0 ? item.voterNames.join(', ') : 'Anonymous'}
                                                                    {/* Arrow */}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Phase Header Component (Internal)
const PhaseHeader = ({ phaseName, phaseIndex, description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border-b border-gray-200 p-4 px-6 md:py-8 flex flex-col items-center z-10 shadow-sm relative transition-all">
            <div className="text-center w-full">
                <div 
                    className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 cursor-pointer md:cursor-default"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {phaseName} Phase
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-mono">
                        {phaseIndex}/3
                    </span>
                    <span className="md:hidden text-gray-400 ml-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                </div>
                
                <div className="mt-2 text-xs font-medium text-blue-600 flex items-center justify-center gap-1 md:hidden">
                    <Info size={12} /> Tap any card to read full details
                </div>

                {/* Desktop: Always visible. Mobile: Conditionally visible */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100 md:mt-4'}`}>
                    <p className="text-sm text-gray-500 max-w-xl mx-auto leading-snug">
                        {description}
                    </p>
                    <div className="hidden md:flex mt-4 text-xs font-medium text-blue-600 items-center justify-center gap-1">
                        <Info size={12} /> Click any card to read full details
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mobile Warning Modal
const MobileWarningModal = ({ onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
            <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                    <Info size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Heads up!</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    This is kinda hard to do on mobile... Use desktop if you can.
                </p>
                <p className="text-gray-600 leading-relaxed italic">
                    But if you choose not to, well I won't stop you.
                </p>
                <p className="text-gray-400 text-sm mt-4 font-medium">
                    - Preetoshi
                </p>
            </div>
            <button
                onClick={onClose}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors active:scale-95"
            >
                Continue Anyway
            </button>
        </motion.div>
    </motion.div>
);

export default function App() {
  const [appPhaseIndex, setAppPhaseIndex] = useState(0); 
  const [votes, setVotes] = useState({}); 
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [draggedOverId, setDraggedOverId] = useState(null);
  const [draggedOverDock, setDraggedOverDock] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  
  // Check for mobile on mount
  useEffect(() => {
      const isMobile = window.innerWidth < 768;
      // Only show if mobile and haven't dismissed it this session
      if (isMobile && !sessionStorage.getItem('mobileWarningDismissed')) {
          setShowMobileWarning(true);
      }
  }, []);

  const handleDismissWarning = () => {
      setShowMobileWarning(false);
      sessionStorage.setItem('mobileWarningDismissed', 'true');
  };
  
  // Transition overlay state
  const [transitionOverlay, setTransitionOverlay] = useState({ show: false, message: '', nextPhase: null });
  
  // Track stars per phase so going back works correctly
  const [starsByPhase, setStarsByPhase] = useState({});
  
  const [userName, setUserName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);

  const cardRectsRef = React.useRef([]);
  const dockRectRef = React.useRef(null);
  
  const STARS_PER_PHASE = 5;
  const MAX_VOTES_PER_CARD = 2;

  const currentPhaseName = appPhaseIndex > 0 && appPhaseIndex <= 3 ? PHASES[appPhaseIndex - 1] : null;
  
  // Get or create session seed for randomization (consistent within session, random across sessions)
  const sessionSeed = useMemo(() => {
      const stored = sessionStorage.getItem('ideaSessionSeed');
      if (stored) return parseInt(stored);
      const seed = Math.floor(Math.random() * 1000000);
      sessionStorage.setItem('ideaSessionSeed', seed.toString());
      return seed;
  }, []);
  
  // Shuffle function using seed
  const seededShuffle = (array, seed) => {
      const shuffled = [...array];
      let random = seed;
      for (let i = shuffled.length - 1; i > 0; i--) {
          // Simple seeded random number generator
          random = (random * 9301 + 49297) % 233280;
          const j = Math.floor((random / 233280) * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
  };
  
  const phaseIdeas = useMemo(() => {
      if (!currentPhaseName) return [];
      const filtered = initialIdeas.filter(i => i.phase === currentPhaseName);
      // Shuffle using session seed + phase name to get different order per phase but consistent within session
      return seededShuffle(filtered, sessionSeed + currentPhaseName.charCodeAt(0));
  }, [currentPhaseName, sessionSeed]);

  // Generate random positions for ideas once
  const ideaPositions = useMemo(() => {
      const positions = {};
      // Simple grid-based randomization to avoid overlaps but look scattered
      const GRID_COLS = 4;
      const CELL_WIDTH = 400;
      const CELL_HEIGHT = 350;
      const CANVAS_PADDING = 100;
      
      initialIdeas.forEach((idea, index) => {
          // Group by phase to keep them somewhat organized but scattered
          // We'll just use a deterministic hash based on ID to keep positions stable across renders
          const seed = idea.id * 12345; 
          const randomX = (Math.sin(seed) * 0.5 + 0.5); // 0-1
          const randomY = (Math.cos(seed) * 0.5 + 0.5); // 0-1
          
          // Assign to a grid cell based on index
          const col = index % GRID_COLS;
          const row = Math.floor(index / GRID_COLS);
          
          // Add jitter within the cell
          const x = CANVAS_PADDING + (col * CELL_WIDTH) + (randomX * 100 - 50);
          const y = CANVAS_PADDING + (row * CELL_HEIGHT) + (randomY * 100 - 50);
          
          // Add some rotation for messy look
          const rotate = (randomX * 6) - 3; // -3 to +3 degrees
          
          positions[idea.id] = { x, y, rotate };
      });
      return positions;
  }, []);

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

  // Sound helper
  const playSound = (filename) => {
      try {
          const audio = new Audio(`/${filename}`);
          audio.volume = 0.5; // Adjust volume as needed
          audio.play().catch(err => console.log("Audio play failed:", err));
      } catch (err) {
          console.log("Sound error:", err);
      }
  };

  const handleStarDragStart = () => {
      playSound('pickup_star.wav');
      
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
      // Use actual mouse coordinates for accurate collision detection
      const x = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
      const y = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
      
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
      // Use actual mouse coordinates for accurate collision detection
      const x = event.clientX || (event.changedTouches && event.changedTouches[0]?.clientX) || 0;
      const y = event.clientY || (event.changedTouches && event.changedTouches[0]?.clientY) || 0;
      
      // Check if dropped on dock (snap back)
      if (dockRectRef.current) {
          const overDock = (
              x >= dockRectRef.current.left && 
              x <= dockRectRef.current.right && 
              y >= dockRectRef.current.top && 
              y <= dockRectRef.current.bottom
          );
          if (overDock) {
              playSound('star_goes_back.wav');
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
      } else {
          // Dropped somewhere else - star goes back
          playSound('star_goes_back.wav');
      }
      
      setDraggedOverId(null);
      setDraggedOverDock(false);
      cardRectsRef.current = [];
  };

  const handleVote = (ideaId, starIdToRemove = null) => {
      const currentVotes = votes[ideaId] || 0;
      if (currentVotes >= MAX_VOTES_PER_CARD) return;

      playSound('deposit_star.wav');
      
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
      playSound('star_goes_back.wav');
      
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

  const performPhaseTransition = (nextPhase) => {
      // Play applause
      if (nextPhase >= 1 && nextPhase <= 4) {
          playSound('applause.wav');
      }
      setAppPhaseIndex(nextPhase);
      setTransitionOverlay({ show: false, message: '', nextPhase: null });
  };

  const handleNext = () => {
      if (appPhaseIndex === 3) {
          // Auto-submit on finish
          handleSendEmail();
      } else if (appPhaseIndex === 0) {
          // Intro to first phase - no overlay, just transition
          playSound('applause.wav');
          setAppPhaseIndex(1);
      } else {
          // Phase transitions with overlay
          const nextPhase = appPhaseIndex + 1;
          let message = '';
          
          if (appPhaseIndex === 1) {
              // Completing first phase
              message = `Great job ${userName}!`;
          } else if (appPhaseIndex === 2) {
              // Completing second phase
              message = `You're on fire ${userName}!`;
          }
          
          setTransitionOverlay({ show: true, message, nextPhase });
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

      const handleFallback = async () => {
          try {
              await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
              alert("Automatic upload failed. Your results have been COPIED to your clipboard.\n\nPlease paste and send them to Preetoshi (Slack/Email).");
              setTransitionOverlay({ show: true, message: 'Heheh', nextPhase: 4 });
              setSentSuccess(false);
          } catch (err) {
              console.error("Clipboard copy failed:", err);
              alert("Upload failed. Please download the results manually on the next screen.");
              setTransitionOverlay({ show: true, message: 'Heheh', nextPhase: 4 });
              setSentSuccess(false);
          }
      };

      try {
          const response = await fetch('/api/save-vote', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(results)
          });

          // Handle 404 (API route not available - likely running with npm run dev instead of vercel dev)
          if (response.status === 404) {
              console.warn("API route not found. For local testing, use 'vercel dev' instead of 'npm run dev'");
              // Still show success in local dev, but warn user
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  alert("Note: API routes only work with 'vercel dev'. Your vote wasn't saved, but you can continue testing.");
                  setTransitionOverlay({ show: true, message: 'Heheh', nextPhase: 4 });
                  setSentSuccess(true);
                  return;
              }
          }

          // Check if response has content before parsing JSON
          const contentType = response.headers.get('content-type');
          let data = {};
          
          if (contentType && contentType.includes('application/json')) {
              const text = await response.text();
              if (text) {
                  data = JSON.parse(text);
              }
          }

          if (response.ok && data.success) {
              // Show transition overlay with "Heheh" before going to completion
              setTransitionOverlay({ show: true, message: 'Heheh', nextPhase: 4 });
              setSentSuccess(true);
          } else {
              console.error("Save error:", data);
              await handleFallback();
          }
      } catch (error) {
          console.error("Error saving:", error);
          // If it's a JSON parse error and we're on localhost, provide helpful message
          if (error.message.includes('JSON') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
              alert("API route not available. For local testing, run 'vercel dev' instead of 'npm run dev'");
          } else {
              await handleFallback();
          }
      } finally {
          setIsSending(false);
      }
  };

  const fetchRankings = async () => {
      setIsLoadingRankings(true);
      setShowRankings(true);
      
      try {
          const response = await fetch('/api/get-votes');
          
          // Handle 404 (API route not available)
          if (response.status === 404) {
              console.warn("API route not found. For local testing, use 'vercel dev' instead of 'npm run dev'");
              setRankings([]);
              setIsLoadingRankings(false);
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  alert("API route not available. For local testing, run 'vercel dev' instead of 'npm run dev'");
              }
              return;
          }
          
          // Check if response has content before parsing JSON
          const contentType = response.headers.get('content-type');
          let allVotes = [];
          
          if (contentType && contentType.includes('application/json')) {
              const text = await response.text();
              if (text) {
                  allVotes = JSON.parse(text);
              }
          }
          
          if (!Array.isArray(allVotes)) {
              setRankings([]);
              return;
          }
          
          // Aggregate votes by idea
          const ideaVotes = {};
          const ideaVoters = {};
          
          allVotes.forEach(vote => {
              if (vote.selections && Array.isArray(vote.selections)) {
                  vote.selections.forEach(selection => {
                      const ideaId = selection.id;
                      if (!ideaVotes[ideaId]) {
                          ideaVotes[ideaId] = 0;
                          ideaVoters[ideaId] = new Set();
                      }
                      ideaVotes[ideaId] += selection.votes || 0;
                      if (vote.voter) {
                          ideaVoters[ideaId].add(vote.voter);
                      }
                  });
              }
          });
          
          // Convert to array and sort
          const rankingsArray = Object.entries(ideaVotes)
              .map(([id, totalStars]) => {
                  const idea = initialIdeas.find(i => i.id === parseInt(id));
                  if (!idea) return null;
                  
                  return {
                      id: idea.id,
                      title: idea.title,
                      phase: idea.phase,
                      totalStars,
                      voterCount: ideaVoters[id]?.size || 0,
                      voterNames: Array.from(ideaVoters[id] || [])
                  };
              })
              .filter(item => item !== null)
              .sort((a, b) => b.totalStars - a.totalStars);
          
          setRankings(rankingsArray);
      } catch (error) {
          console.error("Error fetching rankings:", error);
          setRankings([]);
          // If it's a JSON parse error and we're on localhost, provide helpful message
          if (error.message && error.message.includes('JSON') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
              alert("API route not available. For local testing, run 'vercel dev' instead of 'npm run dev'");
          }
      } finally {
          setIsLoadingRankings(false);
      }
  };

  // --- VIEWS ---

  // Helper for modal navigation
  const handleModalNext = () => {
      if (!selectedIdea) return;
      const currentIndex = phaseIdeas.findIndex(i => i.id === selectedIdea.id);
      if (currentIndex < phaseIdeas.length - 1) {
          setSelectedIdea(phaseIdeas[currentIndex + 1]);
      }
  };

  const handleModalPrev = () => {
      if (!selectedIdea) return;
      const currentIndex = phaseIdeas.findIndex(i => i.id === selectedIdea.id);
      if (currentIndex > 0) {
          setSelectedIdea(phaseIdeas[currentIndex - 1]);
      }
  };

  // 1. Intro View
  if (appPhaseIndex === 0) {
      return (
          <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 relative overflow-y-auto">
              {/* Content - Centered with padding for video */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 py-12 md:py-24 pb-[30vh] relative z-10">
                  <div className="w-full max-w-2xl text-left">
                      {/* Mobile Video - Top (Visible only on small screens) */}
                      <div className="block md:hidden mb-8 -ml-4">
                           <video 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                              className="h-48 w-auto object-contain"
                              style={{ mixBlendMode: 'multiply' }}
                          >
                              <source src="/voting_preetoshi.mp4" type="video/mp4" />
                          </video>
                      </div>

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
                          <p>
                              <strong>NOTE:</strong> Tap any card to expand it and read the full details before voting.
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

              {/* Desktop Video - Fixed at bottom (Hidden on mobile) */}
              <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.5 }}
                  className="hidden md:flex fixed bottom-0 left-0 right-0 justify-center items-end pointer-events-none z-0"
              >
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
              </motion.div>
              
              {/* Transition Overlay */}
              <TransitionOverlay 
                  show={transitionOverlay.show}
                  message={transitionOverlay.message}
                  onComplete={() => transitionOverlay.nextPhase !== null && performPhaseTransition(transitionOverlay.nextPhase)}
              />

              {/* Mobile Warning */}
              <AnimatePresence>
                  {showMobileWarning && <MobileWarningModal onClose={handleDismissWarning} />}
              </AnimatePresence>
          </div>
      );
  }

  // 2. Complete View
  if (appPhaseIndex === 4) {
      return (
          <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 relative overflow-y-auto">
              {/* Content - Centered with padding */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 py-12 md:py-24 pb-[30vh] relative z-10">
                  <div className="w-full max-w-2xl text-left">
                      {/* Mobile Video - Top (Visible only on small screens) */}
                      <div className="block md:hidden mb-8 -ml-4">
                           <video 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                              className="h-48 w-auto object-contain"
                              style={{ mixBlendMode: 'multiply' }}
                          >
                              <source src="/laughing_preetoshi.mp4" type="video/mp4" />
                          </video>
                      </div>

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

                      {/* View Rankings Button */}
                      <button 
                          onClick={fetchRankings}
                          className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                          <BarChart3 size={20} />
                          View All Votes
                      </button>
                  </div>
              </div>

              {/* Desktop Video - Fixed at bottom (Hidden on mobile) */}
              <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.5 }}
                  className="hidden md:flex fixed bottom-0 left-0 right-0 justify-center items-end pointer-events-none z-0"
              >
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
              </motion.div>
              
              {/* Transition Overlay */}
              <TransitionOverlay 
                  show={transitionOverlay.show}
                  message={transitionOverlay.message}
                  onComplete={() => transitionOverlay.nextPhase !== null && performPhaseTransition(transitionOverlay.nextPhase)}
              />
              
              {/* Rankings Overlay */}
              <RankingOverlay 
                  show={showRankings}
                  onClose={() => setShowRankings(false)}
                  rankings={rankings}
                  isLoading={isLoadingRankings}
              />
          </div>
      );
  }

  // 3. Canvas View (Phases 1-3)
  return (
      <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden font-sans text-gray-900">
          
          <AnimatePresence>
              {selectedIdea && (
                  <DetailModal 
                      idea={selectedIdea} 
                      votes={votes[selectedIdea.id]}
                      onRemoveVote={handleRemoveVote}
                      onClose={() => setSelectedIdea(null)} 
                      isHovered={draggedOverId === selectedIdea.id}
                      onNext={handleModalNext}
                      onPrev={handleModalPrev}
                      hasNext={phaseIdeas.findIndex(i => i.id === selectedIdea.id) < phaseIdeas.length - 1}
                      hasPrev={phaseIdeas.findIndex(i => i.id === selectedIdea.id) > 0}
                  />
              )}
          </AnimatePresence>

          <PhaseHeader 
              phaseName={currentPhaseName} 
              phaseIndex={appPhaseIndex} 
              description={PHASE_DESCRIPTIONS[currentPhaseName]} 
          />

          <div className="flex-1 bg-gray-50 relative overflow-hidden">
              {/* Mobile: Scrollable List (No Pan/Zoom) */}
              <div className="block md:hidden w-full h-full overflow-y-auto p-4 pb-48 space-y-4">
                  {phaseIdeas.map(idea => (
                      <div key={idea.id} className="w-full">
                          <CanvasCard 
                              idea={idea} 
                              votes={votes[idea.id]} 
                              onRemoveVote={handleRemoveVote}
                              onViewDetails={setSelectedIdea}
                              isHovered={draggedOverId === idea.id}
                          />
                      </div>
                  ))}
              </div>

              {/* Desktop: Canvas (Pan/Zoom) */}
              <div className="hidden md:block w-full h-full cursor-grab active:cursor-grabbing">
                  <TransformWrapper
                      initialScale={1}
                      initialPositionX={-100}
                      initialPositionY={-100}
                      minScale={0.5}
                      maxScale={2}
                      centerOnInit={true}
                      limitToBounds={false}
                  >
                      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                          <div className="w-[2000px] h-[2000px] relative bg-dot-pattern bg-[length:20px_20px]">
                              {phaseIdeas.map((idea, index) => {
                                  const pos = ideaPositions[idea.id] || { x: 0, y: 0, rotate: 0 };
                                  // Recalculate position relative to the filtered list to keep them compact
                                  // We can't reuse the global positions because phases might be far apart in the original list
                                  // So let's generate a local position based on the *current phase index*
                                  
                                  const GRID_COLS = 3;
                                  const CELL_WIDTH = 420; // Slightly wider than 380
                                  const CELL_HEIGHT = 380; // Slightly taller than 340
                                  const CANVAS_PADDING = 120; // More padding
                                  
                                  const seed = idea.id * 12345; 
                                  const randomX = (Math.sin(seed) * 0.5 + 0.5); 
                                  const randomY = (Math.cos(seed) * 0.5 + 0.5); 
                                  
                                  const col = index % GRID_COLS;
                                  const row = Math.floor(index / GRID_COLS);
                                  
                                  // Reduced jitter range (was 150 -> 100 for X, 100 -> 60 for Y)
                                  const left = CANVAS_PADDING + (col * CELL_WIDTH) + (randomX * 100 - 50);
                                  const top = CANVAS_PADDING + (row * CELL_HEIGHT) + (randomY * 60 - 30);
                                  const rotate = (randomX * 8) - 4;

                                  return (
                                      <div 
                                          key={idea.id}
                                          style={{
                                              position: 'absolute',
                                              left: `${left}px`,
                                              top: `${top}px`,
                                              transform: `rotate(${rotate}deg)`,
                                              zIndex: draggedOverId === idea.id ? 50 : 10
                                          }}
                                      >
                                          <CanvasCard 
                                              idea={idea} 
                                              votes={votes[idea.id]} 
                                              onRemoveVote={handleRemoveVote}
                                              onViewDetails={setSelectedIdea}
                                              isHovered={draggedOverId === idea.id}
                                          />
                                      </div>
                                  );
                              })}
                          </div>
                      </TransformComponent>
                  </TransformWrapper>
              </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-0 md:p-6 pointer-events-none flex justify-center items-end z-[60] overflow-visible">
              <div 
                  className={`pointer-events-auto bg-white/90 backdrop-blur-md border-t md:border border-gray-200 shadow-2xl rounded-t-2xl md:rounded-2xl p-4 w-full md:w-auto flex flex-col md:flex-row items-center gap-4 md:gap-8 overflow-visible transition-all duration-300
                      ${draggedOverDock ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200'}
                  `}
                  data-dock-container
              >
                  
                  <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">DRAG THESE VOTING STARS</span>
                      <div className="flex justify-center gap-2 bg-gray-100 p-2 rounded-xl inner-shadow overflow-visible w-full md:w-auto min-h-[60px]">
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
                              <div className="text-xs font-bold text-gray-400 px-4 py-2 self-center">All stars used!</div>
                          )}
                      </div>
                  </div>

                  <div className="w-full md:w-auto md:h-full md:border-l border-gray-200 md:pl-8 flex items-center justify-between gap-4">
                    {appPhaseIndex > 1 ? (
                        <button 
                            onClick={handlePrevious}
                            className="flex-1 md:flex-none bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                        >
                            <ChevronLeft size={18} /> <span className="hidden md:inline">Previous</span><span className="md:hidden">Back</span>
                        </button>
                    ) : <div className="flex-1 md:hidden"></div>}
                    
                    <button 
                        onClick={handleNext}
                        disabled={!canProceed || isSending}
                        className="flex-[2] md:flex-none bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          {/* Transition Overlay */}
          <TransitionOverlay 
              show={transitionOverlay.show}
              message={transitionOverlay.message}
              onComplete={() => transitionOverlay.nextPhase !== null && performPhaseTransition(transitionOverlay.nextPhase)}
          />
      </div>
  );
}
