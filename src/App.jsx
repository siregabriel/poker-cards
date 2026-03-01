import React, { useState, useMemo } from 'react';
import { 
  Upload, CreditCard, Download, Image as ImageIcon, 
  CheckCircle2, AlertCircle, X, Maximize2, 
  RotateCw, ZoomIn, Scissors, Palette, Loader2,
  Eye, Layout, Gamepad2, Coins, Play, RotateCcw
} from 'lucide-react';

// Configuration Constants
const PRICE_MXN = 199;

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const CUSTOM_RANKS = ['A', 'K', 'Q', 'J'];
const SUITS = ['♥', '♦', '♠', '♣'];

const SUIT_SVGS = {
  '♥': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E",
  '♦': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 2 L19 12 L12 22 L5 12 Z'/%3E%3C/svg%3E",
  '♠': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23171717'%3E%3Cpath d='M12 2c0 0-7 7.5-7 12 0 2.76 2.24 5 5 5 1.5 0 2.83-.65 3.75-1.68.92 1.03 2.25 1.68 3.75 1.68 2.76 0 5-2.24 5-5 0-4.5-7-12-7-12zm-1 16.5h2l1 3.5H10l1-3.5z'/%3E%3C/svg%3E",
  '♣': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23171717'%3E%3Cpath d='M12 2C10.34 2 9 3.34 9 5c0 1.27.8 2.37 2 2.8v.2C7.69 8 5 10.69 5 14c0 1.66 1.34 3 3 3 1.27 0 2.37-.8 2.8-2h.4l-1.5 7h4.6l-1.5-7h.4c.43 1.2 1.53 2 2.8 2 1.66 0 3-1.34 3-3 0-3.31-2.69-6-6-6v-.2c1.2-.43 2-1.53 2-2.8 0-1.66-1.34-3-3-3z'/%3E%3C/svg%3E",
  '★_black': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23171717'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E",
  '★_red': "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E"
};

const LAYOUTS = {
  '2': [{x: 0.5, y: 0.2, flip: false}, {x: 0.5, y: 0.8, flip: true}],
  '3': [{x: 0.5, y: 0.2, flip: false}, {x: 0.5, y: 0.5, flip: false}, {x: 0.5, y: 0.8, flip: true}],
  '4': [{x: 0.3, y: 0.2, flip: false}, {x: 0.7, y: 0.2, flip: false}, {x: 0.3, y: 0.8, flip: true}, {x: 0.7, y: 0.8, flip: true}],
  '5': [{x: 0.3, y: 0.2, flip: false}, {x: 0.7, y: 0.2, flip: false}, {x: 0.5, y: 0.5, flip: false}, {x: 0.3, y: 0.8, flip: true}, {x: 0.7, y: 0.8, flip: true}],
  '6': [{x: 0.3, y: 0.2, flip: false}, {x: 0.7, y: 0.2, flip: false}, {x: 0.3, y: 0.5, flip: false}, {x: 0.7, y: 0.5, flip: false}, {x: 0.3, y: 0.8, flip: true}, {x: 0.7, y: 0.8, flip: true}],
  '7': [{x: 0.3, y: 0.2, flip: false}, {x: 0.7, y: 0.2, flip: false}, {x: 0.5, y: 0.35, flip: false}, {x: 0.3, y: 0.5, flip: false}, {x: 0.7, y: 0.5, flip: false}, {x: 0.3, y: 0.8, flip: true}, {x: 0.7, y: 0.8, flip: true}],
  '8': [{x: 0.3, y: 0.2, flip: false}, {x: 0.7, y: 0.2, flip: false}, {x: 0.5, y: 0.35, flip: false}, {x: 0.3, y: 0.5, flip: false}, {x: 0.7, y: 0.5, flip: false}, {x: 0.5, y: 0.65, flip: true}, {x: 0.3, y: 0.8, flip: true}, {x: 0.7, y: 0.8, flip: true}],
  '9': [{x: 0.3, y: 0.18, flip: false}, {x: 0.7, y: 0.18, flip: false}, {x: 0.3, y: 0.38, flip: false}, {x: 0.7, y: 0.38, flip: false}, {x: 0.5, y: 0.5, flip: false}, {x: 0.3, y: 0.62, flip: true}, {x: 0.7, y: 0.62, flip: true}, {x: 0.3, y: 0.82, flip: true}, {x: 0.7, y: 0.82, flip: true}],
  '10': [{x: 0.3, y: 0.18, flip: false}, {x: 0.7, y: 0.18, flip: false}, {x: 0.5, y: 0.3, flip: false}, {x: 0.3, y: 0.4, flip: false}, {x: 0.7, y: 0.4, flip: false}, {x: 0.3, y: 0.6, flip: true}, {x: 0.7, y: 0.6, flip: true}, {x: 0.5, y: 0.7, flip: true}, {x: 0.3, y: 0.82, flip: true}, {x: 0.7, y: 0.82, flip: true}]
};

const CARD_TYPES = [
  { id: 'back', label: 'Deck Back', description: 'Design for the back side', size: '750 x 1050 px' },
  { id: 'customBackground', label: 'Card Background', description: 'Background for numeric cards', size: '750 x 1050 px' },
  { id: 'joker', label: 'Joker', description: 'Image for both Jokers', size: '750 x 1050 px' },
  ...CUSTOM_RANKS.map(rank => ({
    id: rank,
    label: `${rank} Card`,
    description: `Image for all four ${rank}s`,
    size: '750 x 1050 px'
  }))
];

// Helper to get SVG suit key
const getSuitKey = (card) => {
  if (card.isJoker) return card.isRed ? '★_red' : '★_black';
  return card.suit;
};

// ================= REUSABLE PLAYING CARD COMPONENT =================
const PlayingCard = ({ card, images, hidden = false, scale = 1, className = "", onClick }) => {
  const imgSrc = images[card.id];
  const bgImg = images.customBackground;
  const isBack = hidden || card.isBack;
  const suitKey = getSuitKey(card);

  return (
    <div 
      onClick={onClick}
      className={`group perspective-1000 ${className} transition-all duration-500`} 
      style={{ width: `${192 * scale}px`, height: `${288 * scale}px`, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div 
        className="relative transform-origin-top-left w-48 h-72 transition-all duration-500 rounded-2xl group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 ring-1 ring-white/10"
        style={{ transform: `scale(${scale})` }}
      >
        {isBack ? (
          <div className="absolute inset-0 rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center shadow-inner">
            {images.back ? (
              <img src={images.back} className="w-full h-full object-cover" alt="Back" />
            ) : (
              <div className="text-neutral-800 bg-neutral-950 w-full h-full flex items-center justify-center border-[8px] border-white">
                <Layout size={48} strokeWidth={1} className="opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 rounded-2xl bg-white overflow-hidden flex flex-col shadow-lg">
            {/* Custom Background for Numeric Cards */}
            {!card.isCustom && !card.isJoker && bgImg && (
              <div className="absolute inset-0 z-0">
                <img src={bgImg} className="w-full h-full object-cover opacity-40 mix-blend-multiply" alt="Background" />
              </div>
            )}

            {/* Top Left Corner */}
            <div className={`absolute top-3 left-3 flex flex-col items-center z-10 ${card.textColor}`}>
              {card.isJoker ? (
                <div className="flex flex-col items-center font-serif font-black text-[10px] leading-[0.8]">
                  {'JOKER'.split('').map((letter, i) => <span key={i}>{letter}</span>)}
                </div>
              ) : (
                <span className="font-serif font-black text-2xl leading-none tracking-tighter">{card.rank}</span>
              )}
              <img src={SUIT_SVGS[suitKey]} alt="suit" className={`${card.isJoker ? 'w-3.5 h-3.5 mt-1' : 'w-5 h-5 mt-1'}`} />
            </div>

            {/* Center Content */}
            <div className={`absolute top-[14%] bottom-[14%] left-[18%] right-[18%] rounded-xl overflow-hidden bg-transparent z-10 ${(card.isCustom || card.isJoker) ? 'ring-1 ring-neutral-200 bg-neutral-50 shadow-inner' : ''}`}>
              {(card.isCustom || card.isJoker) ? (
                imgSrc ? (
                  <img src={imgSrc} className="w-full h-full object-cover" alt={card.label} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400 w-full h-full bg-neutral-50/50">
                    <ImageIcon size={24} strokeWidth={1.5} className="mb-2 opacity-30"/>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight opacity-40">Empty</span>
                  </div>
                )
              ) : (
                <div className="relative w-full h-full">
                   {LAYOUTS[card.rank]?.map((pos, i) => (
                     <img key={i} src={SUIT_SVGS[suitKey]} alt="pip" className="absolute w-10 h-10 -ml-5 -mt-5 transition-all duration-700 hover:scale-110"
                          style={{
                             left: `${pos.x * 100}%`,
                             top: `${pos.y * 100}%`,
                             transform: pos.flip ? 'rotate(180deg)' : 'none'
                          }} />
                   ))}
                </div>
              )}
            </div>

            {/* Bottom Right Corner */}
            <div className={`absolute bottom-3 right-3 flex flex-col items-center rotate-180 z-10 ${card.textColor}`}>
              {card.isJoker ? (
                <div className="flex flex-col items-center font-serif font-black text-[10px] leading-[0.8]">
                  {'JOKER'.split('').map((letter, i) => <span key={i}>{letter}</span>)}
                </div>
              ) : (
                <span className="font-serif font-black text-2xl leading-none tracking-tighter">{card.rank}</span>
              )}
              <img src={SUIT_SVGS[suitKey]} alt="suit" className={`${card.isJoker ? 'w-3.5 h-3.5 mt-1' : 'w-5 h-5 mt-1'}`} />
            </div>
            
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.02)_100%)] pointer-events-none z-20" />
          </div>
        )}
      </div>
    </div>
  );
};


const App = () => {
  const [images, setImages] = useState({});
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState('editor'); // editor | preview | games | blackjack | poker
  const [balance, setBalance] = useState(1000);
  
  // Estado para el editor de imagen
  const [editingId, setEditingId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Base Deck
  const generateDeck = (includeJokers = false) => {
    const deck = [];
    RANKS.forEach(rank => {
      SUITS.forEach(suit => {
        const isRed = ['♥', '♦'].includes(suit);
        deck.push({
          id: rank,
          rank,
          suit,
          isRed,
          isCustom: CUSTOM_RANKS.includes(rank),
          label: `${rank} of ${suit}`,
          textColor: isRed ? 'text-red-500' : 'text-neutral-900'
        });
      });
    });
    if (includeJokers) {
      deck.push({ id: 'joker', rank: '★', suit: '★', isRed: false, isJoker: true, label: 'Black Joker', textColor: 'text-neutral-900' });
      deck.push({ id: 'joker', rank: '★', suit: '★', isRed: true, isJoker: true, label: 'Red Joker', textColor: 'text-red-500' });
    }
    return deck;
  };

  const fullDeckPreview = useMemo(() => {
    return [{ id: 'back', isBack: true, label: 'Deck Back' }, ...generateDeck(true)];
  }, []);

  // Shuffle Utility
  const shuffleDeck = (deckArray) => {
    const newDeck = [...deckArray];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  // ================= ESTADO Y LÓGICA DE BLACKJACK =================
  const [bjDeck, setBjDeck] = useState([]);
  const [bjPlayerHand, setBjPlayerHand] = useState([]);
  const [bjDealerHand, setBjDealerHand] = useState([]);
  const [bjState, setBjState] = useState('betting'); // betting, playing, dealerTurn, gameOver
  const [bjMessage, setBjMessage] = useState('');
  const [currentBet, setCurrentBet] = useState(10);

  const getBjScore = (hand) => {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
      if (['J', 'Q', 'K'].includes(card.rank)) score += 10;
      else if (card.rank === 'A') { score += 11; aces += 1; }
      else score += parseInt(card.rank);
    });
    while (score > 21 && aces > 0) { score -= 10; aces -= 1; }
    return score;
  };

  const startBlackjack = () => {
    if (balance < currentBet) { alert("Sin fondos suficientes"); return; }
    setBalance(prev => prev - currentBet);
    const newDeck = shuffleDeck(generateDeck(false));
    setBjPlayerHand([newDeck[0], newDeck[2]]);
    setBjDealerHand([newDeck[1], newDeck[3]]);
    setBjDeck(newDeck.slice(4));
    setBjState('playing');
    setBjMessage('');

    if (getBjScore([newDeck[0], newDeck[2]]) === 21) {
      setBjState('gameOver');
      setBjMessage('¡Blackjack! Has ganado.');
      setBalance(prev => prev + (currentBet * 2.5));
    }
  };

  const hitBlackjack = () => {
    if (bjDeck.length === 0) return;
    const newCard = bjDeck[0];
    const newHand = [...bjPlayerHand, newCard];
    setBjPlayerHand(newHand);
    setBjDeck(bjDeck.slice(1));
    if (getBjScore(newHand) > 21) {
      setBjState('gameOver');
      setBjMessage('Te pasaste. Gana el Dealer.');
    }
  };

  const standBlackjack = () => {
    setBjState('dealerTurn');
    let currentDealerHand = [...bjDealerHand];
    let currentDeck = [...bjDeck];
    
    // Dealer juega automáticamente
    let dealerScore = getBjScore(currentDealerHand);
    while (dealerScore < 17 && currentDeck.length > 0) {
      currentDealerHand.push(currentDeck[0]);
      currentDeck = currentDeck.slice(1);
      dealerScore = getBjScore(currentDealerHand);
    }
    
    setBjDealerHand(currentDealerHand);
    const playerScore = getBjScore(bjPlayerHand);
    
    setBjState('gameOver');
    if (dealerScore > 21) {
      setBjMessage('El Dealer se pasó. ¡Ganaste!');
      setBalance(prev => prev + (currentBet * 2));
    } else if (playerScore > dealerScore) {
      setBjMessage('¡Ganaste!');
      setBalance(prev => prev + (currentBet * 2));
    } else if (dealerScore > playerScore) {
      setBjMessage('Gana el Dealer.');
    } else {
      setBjMessage('Empate.');
      setBalance(prev => prev + currentBet); // Devuelve apuesta
    }
  };

  // ================= ESTADO Y LÓGICA DE VIDEO POKER (Jacks or Better) =================
  const [vpDeck, setVpDeck] = useState([]);
  const [vpHand, setVpHand] = useState([]);
  const [vpHeld, setVpHeld] = useState([false, false, false, false, false]);
  const [vpState, setVpState] = useState('betting'); // betting, playing, gameOver
  const [vpMessage, setVpMessage] = useState('');

  const rankValues = { '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14 };

  const evaluatePokerHand = (hand) => {
    if (hand.length < 5) return { name: "Nada", mult: 0 };
    const suits = hand.map(c => c.suit);
    const ranks = hand.map(c => rankValues[c.rank]).sort((a,b) => a - b);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i-1] + 1) || 
                       (ranks.join(',') === '2,3,4,5,14'); // A-2-3-4-5 straight
    
    const counts = {};
    ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
    const freq = Object.values(counts).sort((a,b) => b - a);

    if (isFlush && isStraight && ranks[4] === 14) return { name: "Escalera Real", mult: 250 };
    if (isFlush && isStraight) return { name: "Escalera de Color", mult: 50 };
    if (freq[0] === 4) return { name: "Póker", mult: 25 };
    if (freq[0] === 3 && freq[1] === 2) return { name: "Full House", mult: 9 };
    if (isFlush) return { name: "Color", mult: 6 };
    if (isStraight) return { name: "Escalera", mult: 4 };
    if (freq[0] === 3) return { name: "Trío", mult: 3 };
    if (freq[0] === 2 && freq[1] === 2) return { name: "Doble Pareja", mult: 2 };
    
    // Jacks or Better
    const hasJacksOrBetter = Object.keys(counts).some(r => counts[r] === 2 && parseInt(r) >= 11);
    if (hasJacksOrBetter) return { name: "Jotas o Mejor", mult: 1 };

    return { name: "Nada", mult: 0 };
  };

  const startVideoPoker = () => {
    if (balance < currentBet) { alert("Sin fondos suficientes"); return; }
    setBalance(prev => prev - currentBet);
    const newDeck = shuffleDeck(generateDeck(false));
    setVpHand(newDeck.slice(0, 5));
    setVpDeck(newDeck.slice(5));
    setVpHeld([false, false, false, false, false]);
    setVpState('playing');
    setVpMessage('');
  };

  const drawVideoPoker = () => {
    let currentDeck = [...vpDeck];
    const newHand = vpHand.map((card, i) => {
      if (vpHeld[i]) return card;
      const drawnCard = currentDeck[0];
      currentDeck = currentDeck.slice(1);
      return drawnCard;
    });
    
    setVpHand(newHand);
    setVpState('gameOver');
    
    const result = evaluatePokerHand(newHand);
    if (result.mult > 0) {
      const winAmount = currentBet * result.mult;
      setVpMessage(`¡${result.name}! Ganas $${winAmount}`);
      setBalance(prev => prev + winAmount + currentBet);
    } else {
      setVpMessage('Sin premio. Suerte a la próxima.');
    }
  };

  // ================= FUNCIONES BASE =================
  const handleFileUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (upload) => {
        setImages(prev => ({ ...prev, [id]: upload.target.result }));
        setEditingId(id);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[id];
      return newImages;
    });
  };

  const handleSaveDesign = () => {
    const data = JSON.stringify(images);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poker-studio-design-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadDesign = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (upload) => {
        try {
          const loadedImages = JSON.parse(upload.target.result);
          setImages(loadedImages);
        } catch (error) {
          alert("Error loading design file. Please make sure it is a valid JSON design file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setShowPaymentModal(false);
    }, 2000);
  };

  const loadSuitImagesForPDF = async () => {
    const result = {};
    const load = (src, flip) => new Promise(res => {
       const img = new Image();
       img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 128; canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (flip) {
            ctx.translate(64, 64);
            ctx.rotate(Math.PI);
            ctx.translate(-64, -64);
          }
          ctx.drawImage(img, 14, 14, 100, 100);
          res(canvas.toDataURL('image/png'));
       };
       img.src = src;
    });

    for (const [key, src] of Object.entries(SUIT_SVGS)) {
      result[key] = {
         normal: await load(src, false),
         flipped: await load(src, true)
      };
    }
    return result;
  };

  const handleDownload = async (isSample = false) => {
    setIsGenerating(true);
    try {
      const suitImgs = await loadSuitImagesForPDF();
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const cardW = 63.5; 
      const cardH = 88.9; 
      const marginX = (210 - (cardW * 3)) / 2;
      const marginY = (297 - (cardH * 3)) / 2;

      const deck = generateDeck(true); // Con Jokers
      const CARDS_PER_PAGE = 9;
      const totalPages = Math.ceil(deck.length / CARDS_PER_PAGE);

      const drawWatermark = (x, y, w, h) => {
        if (!isSample) return;
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(32);
        doc.text("SAMPLE", x + w / 2, y + h / 2 + 5, { align: 'center', angle: 45 });
        doc.setTextColor(100, 100, 100);
        doc.text("SAMPLE", x + w / 2 - 1, y + h / 2 + 4, { align: 'center', angle: 45 });
      };

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) doc.addPage();
        for (let i = 0; i < CARDS_PER_PAGE; i++) {
          const cardIndex = p * CARDS_PER_PAGE + i;
          if (cardIndex >= deck.length) break;
          
          const card = deck[cardIndex];
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = marginX + (col * cardW);
          const y = marginY + (row * cardH);
          
          doc.setDrawColor(200);
          doc.setLineWidth(0.1);
          doc.rect(x, y, cardW, cardH);
          
          const cardColor = card.isRed ? [220, 38, 38] : [0, 0, 0];
          doc.setTextColor(...cardColor);
          doc.setFont("times", "bold");
          
          const suitKey = getSuitKey(card);

          if (card.isJoker) {
             const jokerText = "JOKER";
             doc.setFontSize(7);
             for(let j=0; j<jokerText.length; j++) {
               doc.text(jokerText[j], x + 4.5, y + 6 + (j*2.2), { align: 'center' });
             }
             doc.addImage(suitImgs[suitKey].normal, 'PNG', x + 2.5, y + 4 + (jokerText.length * 2.2), 4, 4);
             
             for(let j=0; j<jokerText.length; j++) {
               doc.text(jokerText[j], x + cardW - 4.5, y + cardH - 6 - (j*2.2), { align: 'center', angle: 180 });
             }
             doc.addImage(suitImgs[suitKey].flipped, 'PNG', x + cardW - 6.5, y + cardH - 8 - (jokerText.length * 2.2), 4, 4);

          } else {
             doc.setFontSize(18);
             doc.text(card.rank, x + 4.5, y + 7.5, { align: 'center' });
             doc.addImage(suitImgs[suitKey].normal, 'PNG', x + 2.5, y + 8.5, 4, 4); 
             
             doc.text(card.rank, x + cardW - 4.5, y + cardH - 7.5, { align: 'center', angle: 180 });
             doc.addImage(suitImgs[suitKey].flipped, 'PNG', x + cardW - 6.5, y + cardH - 12.5, 4, 4); 
          }
          
          const innerX = x + 9;
          const innerY = y + 10;
          const innerW = cardW - 18;
          const innerH = cardH - 20;

          const bgImgData = images.customBackground;
          if (bgImgData && !card.isCustom && !card.isJoker) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.4 }));
            doc.addImage(bgImgData, 'JPEG', x + 0.1, y + 0.1, cardW - 0.2, cardH - 0.2);
            doc.restoreGraphicsState();
          }

          const imgData = images[card.id];
          if (imgData && (card.isCustom || card.isJoker)) {
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            doc.rect(innerX, innerY, innerW, innerH);
            doc.addImage(imgData, 'JPEG', innerX + 0.1, innerY + 0.1, innerW - 0.2, innerH - 0.2);
          } else if (!card.isCustom && !card.isJoker) {
            LAYOUTS[card.rank]?.forEach(pos => {
              const pipImg = suitImgs[suitKey][pos.flip ? 'flipped' : 'normal'];
              const cx = innerX + (innerW * pos.x);
              const cy = innerY + (innerH * pos.y);
              doc.addImage(pipImg, 'PNG', cx - 6, cy - 6, 12, 12); 
            });
          }

          drawWatermark(x, y, cardW, cardH);
        }
      }

      if (images.back) {
        for (let p = 0; p < totalPages; p++) {
          doc.addPage();
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              const cardIndex = p * CARDS_PER_PAGE + (row * 3 + col);
              if (cardIndex >= deck.length) break;

              const x = marginX + (col * cardW);
              const y = marginY + (row * cardH);
              
              doc.setDrawColor(200);
              doc.setLineWidth(0.1);
              doc.rect(x, y, cardW, cardH);
              doc.addImage(images.back, 'JPEG', x, y, cardW, cardH);
              
              drawWatermark(x, y, cardW, cardH);
            }
          }
        }
      }

      const fileName = isSample ? 'Muestra_Mazo_Poker.pdf' : 'Mazo_Poker_Personalizado.pdf';
      doc.save(fileName);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error generando el PDF. Asegúrate de haber instalado jspdf (npm install jspdf)");
    } finally {
      setIsGenerating(false);
    }
  };

  const allImagesUploaded = CARD_TYPES.filter(t => t.id !== 'customBackground').every(type => images[type.id]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden antialiased">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-neutral-950/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('editor')}>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-transform duration-300">P</div>
            <div className="hidden sm:block">
              <span className="font-black text-xl tracking-tighter block leading-none text-white group-hover:text-indigo-400 transition-colors">POKER<span className="text-neutral-500">STUDIO</span></span>
              <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em] mt-1 block">Premium Deck Builder</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {[
              { id: 'editor', label: 'Design', icon: Palette },
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'games', label: 'Casino', icon: Gamepad2 }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                  view === item.id || (item.id === 'games' && ['blackjack', 'poker'].includes(view))
                    ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.4)] translate-y-[-1px]' 
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={16} strokeWidth={2.5} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 relative">
        {view === 'editor' && (
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8 space-y-16">
              <header className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  Live Editor
                </div>
                <h1 className="text-7xl font-black tracking-tight text-white leading-[1.1]">
                  Build your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">masterpiece.</span>
                </h1>
                <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl">
                  Upload custom designs for face cards, jokers, and the card back. 
                  Numeric cards (2-10) are automatically styled with our signature classic layout.
                </p>
              </header>

              <div className="grid sm:grid-cols-2 gap-8">
                {CARD_TYPES.map((type) => (
                  <div key={type.id} className="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:bg-neutral-900/60 hover:border-indigo-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h3 className="font-black text-xl text-white tracking-tight">{type.label}</h3>
                        <p className="text-sm text-neutral-500 font-medium">{type.description}</p>
                      </div>
                      {images[type.id] && (
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(type.id)} className="p-2.5 bg-white/5 hover:bg-indigo-500/20 rounded-xl text-neutral-400 hover:text-indigo-400 transition-all duration-300">
                            <Maximize2 size={16} />
                          </button>
                          <button onClick={() => removeImage(type.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-neutral-500 hover:text-red-400 transition-all duration-300">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {!images[type.id] ? (
                      <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-neutral-800 rounded-3xl cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all duration-500 group/label relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover/label:bg-indigo-500/[0.02] transition-colors" />
                        <div className="w-16 h-16 bg-neutral-950 rounded-2xl flex items-center justify-center mb-4 group-hover/label:scale-110 group-hover/label:rotate-3 transition-all duration-500 shadow-xl ring-1 ring-white/5">
                          <Upload className="text-neutral-400 group-hover/label:text-indigo-400" size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm text-neutral-500 font-black uppercase tracking-widest group-hover/label:text-white transition-colors">Upload Assets</span>
                        <p className="text-[10px] text-neutral-600 font-bold mt-2 uppercase tracking-tighter">Optimal: {type.size}</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(type.id, e)} />
                      </label>
                    ) : (
                      <div className="w-full h-56 rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl group/img">
                        <img src={images[type.id]} alt={type.label} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex items-end p-6 translate-y-2 group-hover/img:translate-y-0">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                               <CheckCircle2 size={16} strokeWidth={3} />
                             </div>
                             <span className="text-xs font-black text-white uppercase tracking-widest">Asset Ready</span>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
              <div className="bg-neutral-900/80 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group/sidebar">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover/sidebar:bg-indigo-600/20 transition-all duration-700" />
                
                <div className="relative z-10 space-y-10">
                  <header className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white tracking-tight">Summary</h2>
                    <div className="p-3 bg-neutral-950 rounded-2xl ring-1 ring-white/10">
                      <Layout size={20} className="text-indigo-500" />
                    </div>
                  </header>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Deck Composition</span>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2 mr-2 border-r border-white/10 pr-4">
                          <button 
                            onClick={handleSaveDesign}
                            title="Save Design JSON"
                            className="p-2 bg-neutral-950 rounded-lg ring-1 ring-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Download size={14} />
                          </button>
                          <label className="p-2 bg-neutral-950 rounded-lg ring-1 ring-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                            <Upload size={14} />
                            <input type="file" className="hidden" accept=".json" onChange={handleLoadDesign} />
                          </label>
                        </div>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 uppercase font-black tracking-[0.2em]">54 Cards</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 bg-neutral-950/50 p-6 rounded-3xl ring-1 ring-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                      {CARD_TYPES.map(t => (
                        <div key={t.id} className="flex justify-between items-center py-1 group/item">
                          <span className={`text-sm font-bold transition-colors ${images[t.id] ? 'text-neutral-300' : 'text-neutral-600'}`}>
                            {t.label}
                          </span>
                          {images[t.id] ? (
                            <CheckCircle2 size={16} className="text-indigo-500" strokeWidth={3} />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-800 group-hover/item:border-neutral-700 transition-colors" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 pt-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="block text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em]">Total Investment</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white tracking-tighter">${PRICE_MXN}</span>
                          <span className="text-neutral-500 font-black text-sm uppercase tracking-widest">MXN</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">One-time</div>
                    </div>

                    {!isPaid ? (
                      <div className="space-y-4">
                        <button 
                          disabled={!allImagesUploaded}
                          onClick={() => setShowPaymentModal(true)}
                          className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group/pay ${
                            allImagesUploaded 
                              ? "bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]" 
                              : "bg-neutral-800 text-neutral-600 cursor-not-allowed grayscale"
                          }`}
                        >
                          <CreditCard size={22} strokeWidth={2.5} />
                          Unlock HD Export
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/pay:translate-x-full transition-transform duration-1000" />
                        </button>
                        
                        <button 
                          onClick={() => handleDownload(true)}
                          disabled={isGenerating}
                          className="w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 border-2 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 transition-all duration-300"
                        >
                          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} strokeWidth={2.5} />}
                          Get Watermarked Sample
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <button 
                          className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all duration-500 shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                          onClick={() => handleDownload(false)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <Download size={24} strokeWidth={2.5} />
                          )}
                          {isGenerating ? "Processing PDF..." : "Download HD Deck"}
                        </button>
                        <div className="flex items-center justify-center gap-2 py-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                           <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.3em]">Access Granted</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pro Tip Card */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-[2.5rem] p-8 flex items-start gap-6 group">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                   <Palette size={24} className="text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-white uppercase tracking-widest text-[10px]">Pro Tip</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">Use <span className="text-neutral-300">high-contrast images</span> for face cards. PNG or JPG files work best with our HD export engine.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'preview' && (
          <div className="space-y-20 py-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
                Full Deck Gallery
              </div>
              <h1 className="text-6xl font-black text-white tracking-tight">Your 55-Card Set</h1>
              <p className="text-neutral-500 text-xl leading-relaxed">
                Behold your creation. All numeric cards are procedurally generated 
                to match your custom face cards and deck back.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 gap-y-20 justify-items-center pb-32">
              {fullDeckPreview.map((card, index) => (
                 <PlayingCard key={index} card={card} images={images} scale={0.9} className="hover:z-10" />
              ))}
            </div>
          </div>
        )}

        {view === 'games' && (
          <div className="space-y-24 py-12">
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(79,70,229,0.4)] ring-4 ring-indigo-500/20">
                 <Gamepad2 size={40} className="text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl font-black text-white tracking-tight">The High Roller <span className="text-indigo-500">Casino</span></h1>
                <p className="text-neutral-500 text-xl max-w-2xl mx-auto leading-relaxed">Experience your custom deck in a professional environment. Use your virtual balance to test the cards in our exclusive mini-games.</p>
              </div>
              
              <div className="inline-flex items-center gap-4 bg-neutral-900 px-8 py-4 rounded-[2rem] border border-white/5 font-black text-2xl shadow-2xl ring-1 ring-white/5 relative group">
                 <Coins className="text-yellow-500" size={28} /> 
                 <span className="text-white">${balance.toLocaleString()}</span>
                 <span className="text-neutral-600 text-xs uppercase tracking-[0.3em] ml-2">Credits</span>
                 
                 {balance < 10 && (
                   <button 
                     onClick={() => setBalance(prev => prev + 1000)}
                     className="absolute -right-2 -top-2 bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90"
                     title="Refill Credits"
                   >
                     <RotateCcw size={16} strokeWidth={3} />
                   </button>
                 )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {[
                { 
                  id: 'blackjack', 
                  title: 'Blackjack', 
                  desc: 'Challenge the house and hit 21 using your unique custom deck.',
                  icon: Gamepad2,
                  accent: 'indigo',
                  action: () => { setBjState('betting'); setView('blackjack'); }
                },
                { 
                  id: 'poker', 
                  title: 'Video Poker', 
                  desc: 'Classic Jacks or Better. Aim for the Royal Flush and multiply your credits.',
                  icon: Play,
                  accent: 'purple',
                  action: () => { setVpState('betting'); setView('poker'); }
                }
              ].map(game => (
                <div 
                  key={game.id}
                  onClick={game.action}
                  className="group bg-neutral-900/40 border border-white/5 rounded-[3rem] p-12 hover:bg-neutral-900/60 hover:border-white/10 transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden flex flex-col items-start"
                >
                  <div className={`absolute -right-12 -bottom-12 opacity-[0.03] text-white group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none`}>
                     {game.id === 'blackjack' ? <Gamepad2 size={280} /> : <div className="font-serif font-black text-[18rem] leading-none">A♠</div>}
                  </div>
                  
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-white/10 group-hover:bg-indigo-600 transition-colors duration-500">
                    <game.icon size={28} className="text-white" />
                  </div>
                  
                  <h3 className="text-4xl font-black mb-4 text-white tracking-tight">{game.title}</h3>
                  <p className="text-neutral-500 text-lg mb-10 relative z-10 leading-relaxed max-w-xs">{game.desc}</p>
                  
                  <div className="mt-auto flex items-center gap-3 font-black text-sm uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                    Start Playing <Play size={16} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW: BLACKJACK ================= */}
        {view === 'blackjack' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <button 
                onClick={() => setView('games')} 
                className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/5 transition-all"
              >
                <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" /> Exit Table
              </button>
              
              <div className="text-center space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Blackjack</h2>
                <div className="flex items-center justify-center gap-2 text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" /> 
                   Live Table #04
                </div>
              </div>

              <div className="bg-neutral-900 px-8 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-2xl">
                 <Coins className="text-yellow-500" size={20} />
                 <span className="font-black text-xl text-white">${balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="relative w-full bg-[#0a0c10] rounded-[4rem] border-[12px] border-neutral-900 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col items-center justify-center gap-12 py-12 px-12 group/table min-h-[750px]">
               {/* Felt Background Pattern */}
               <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#1e293b_0%,_transparent_100%)]" />
               <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
               
               {/* Dealer Area */}
               <div className="relative z-10 w-full flex flex-col items-center gap-6">
                  <div className="px-4 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
                    Dealer {bjState === 'gameOver' ? `(${getBjScore(bjDealerHand)})` : ''}
                  </div>
                  <div className="flex justify-center space-x-4 perspective-1000">
                     {bjDealerHand.map((card, i) => (
                       <PlayingCard 
                         key={i} 
                         card={card} 
                         images={images} 
                         hidden={i === 1 && bjState !== 'dealerTurn' && bjState !== 'gameOver'} 
                         scale={0.75} 
                         className="shadow-2xl hover:translate-y-[-10px] transition-transform duration-500"
                       />
                     ))}
                  </div>
               </div>

               {/* Center Message */}
               <div className="relative z-20 h-24 flex items-center justify-center">
                 {bjMessage && (
                   <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-4">
                     <span className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-4xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.5)] border border-indigo-400/30 tracking-tight">
                       {bjMessage}
                     </span>
                   </div>
                 )}
               </div>

               {/* Player Area */}
               <div className="relative z-10 w-full flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center gap-12 w-full">
                     {/* Hit Button Left */}
                     {bjState === 'playing' && (
                       <button 
                         onClick={hitBlackjack}
                         className="w-20 h-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full font-black text-xs uppercase tracking-widest border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-90 flex flex-col items-center justify-center gap-1 group/hit animate-in fade-in slide-in-from-right-4 duration-500"
                       >
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/hit:bg-white/10 transition-colors">
                            <Play size={14} className="rotate-90 fill-white" />
                         </div>
                         Hit
                       </button>
                     )}

                     <div className="flex justify-center space-x-4 perspective-1000">
                        {bjPlayerHand.map((card, i) => (
                          <PlayingCard key={i} card={card} images={images} scale={0.8} className="shadow-2xl hover:translate-y-[-20px] transition-transform duration-500" />
                        ))}
                     </div>

                     {/* Stand Button Right */}
                     {bjState === 'playing' && (
                       <button 
                         onClick={standBlackjack}
                         className="w-20 h-20 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] border border-white/10 transition-all hover:scale-110 active:scale-90 flex flex-col items-center justify-center gap-1 group/stand animate-in fade-in slide-in-from-left-4 duration-500"
                       >
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/stand:bg-white/20 transition-colors">
                            <X size={16} strokeWidth={3} />
                         </div>
                         Stand
                       </button>
                     )}
                  </div>
                  <div className="px-4 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
                    Player ({bjPlayerHand.length > 0 ? getBjScore(bjPlayerHand) : 0})
                  </div>
               </div>

               {/* Decorative Table Elements */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/[0.02] rounded-full pointer-events-none" />
               <div className="absolute bottom-[-10%] w-[120%] h-32 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            </div>

            {/* Game Controls */}
            <div className="flex justify-center items-center gap-8 bg-neutral-900/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl min-h-[140px]">
               {bjState === 'betting' || bjState === 'gameOver' ? (
                 <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
                   <div className="flex-1 space-y-3 w-full">
                     <div className="flex justify-between px-2">
                       <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Select Wager</span>
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${currentBet} Credits</span>
                     </div>
                     <div className="relative flex items-center gap-4 bg-neutral-950 p-2 rounded-2xl ring-1 ring-white/5">
                       {[10, 50, 100, 500].map(val => (
                         <button 
                           key={val}
                           onClick={() => setCurrentBet(val)}
                           className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${currentBet === val ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400 hover:bg-white/5'}`}
                         >
                           ${val}
                         </button>
                       ))}
                     </div>
                   </div>
                   <button 
                     onClick={startBlackjack}
                     className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.05] active:scale-[0.95]"
                   >
                     Deal Cards
                   </button>
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-2 animate-in fade-in duration-700">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Game in Progress</span>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* ================= VIEW: VIDEO POKER ================= */}
        {view === 'poker' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <button 
                onClick={() => setView('games')} 
                className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/5 transition-all"
              >
                <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" /> Exit Table
              </button>
              
              <div className="text-center space-y-2">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Video Poker</h2>
                <div className="flex items-center justify-center gap-2 text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" /> 
                   Jacks or Better
                </div>
              </div>

              <div className="bg-neutral-900 px-8 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-2xl">
                 <Coins className="text-yellow-500" size={20} />
                 <span className="font-black text-xl text-white">${balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-neutral-900/40 rounded-[4rem] border border-white/5 p-12 shadow-2xl space-y-12 backdrop-blur-3xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
               
               {/* Pay Table */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-black/40 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                  {[
                    { name: 'Royal Flush', mult: 'x250', color: 'text-indigo-400' },
                    { name: 'Straight Flush', mult: 'x50', color: 'text-white' },
                    { name: 'Four of a Kind', mult: 'x25', color: 'text-white' },
                    { name: 'Full House', mult: 'x9', color: 'text-white' },
                    { name: 'Flush', mult: 'x6', color: 'text-white' },
                    { name: 'Straight', mult: 'x4', color: 'text-white' },
                    { name: 'Three of a Kind', mult: 'x3', color: 'text-white' },
                    { name: 'Two Pair', mult: 'x2', color: 'text-white' },
                    { name: 'Jacks or Better', mult: 'x1', color: 'text-white' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${row.color}`}>{row.name}</span>
                      <span className="font-mono text-xs font-black text-neutral-500">{row.mult}</span>
                    </div>
                  ))}
               </div>

               <div className="min-h-[400px] flex flex-col justify-center relative">
                  {vpMessage && (
                    <div className="absolute top-0 left-0 w-full text-center z-20 animate-in slide-in-from-top-4 duration-500">
                      <span className="px-12 py-4 bg-indigo-600 text-white rounded-full text-2xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.5)] border border-indigo-400/30">
                        {vpMessage}
                      </span>
                    </div>
                  )}

                  {/* Player Hand */}
                  <div className="flex justify-center gap-4 sm:gap-8 flex-wrap mt-12">
                    {vpHand.length > 0 ? vpHand.map((card, i) => (
                      <div key={i} className="flex flex-col items-center gap-6 group/card">
                        <div 
                          className={`relative transition-all duration-500 ${vpHeld[i] ? 'translate-y-[-20px]' : 'group-hover/card:translate-y-[-10px]'}`}
                          onClick={() => {
                            if (vpState === 'playing') {
                              const newHeld = [...vpHeld];
                              newHeld[i] = !newHeld[i];
                              setVpHeld(newHeld);
                            }
                          }}
                        >
                          <PlayingCard 
                            card={card} 
                            images={images} 
                            scale={0.8} 
                            className={`${vpHeld[i] ? 'ring-4 ring-indigo-500 ring-offset-8 ring-offset-neutral-900 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)]' : ''}`}
                          />
                          {vpHeld[i] && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl animate-in zoom-in duration-300">
                              Held
                            </div>
                          )}
                        </div>
                        <div className="h-2 w-12 rounded-full bg-neutral-800 overflow-hidden">
                           {vpHeld[i] && <div className="h-full bg-indigo-500 w-full animate-pulse" />}
                        </div>
                      </div>
                    )) : (
                      [1,2,3,4,5].map(i => (
                        <div key={i} className="w-[154px] h-[230px] rounded-2xl border-2 border-dashed border-neutral-800 flex items-center justify-center opacity-30 bg-neutral-950/50">
                          <Layout className="text-neutral-700" size={40} strokeWidth={1} />
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {/* Game Controls */}
               <div className="flex justify-center items-center gap-8 pt-8">
                  {vpState === 'betting' || vpState === 'gameOver' ? (
                    <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex justify-between px-2">
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Select Wager</span>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${currentBet} Credits</span>
                        </div>
                        <div className="relative flex items-center gap-4 bg-neutral-950 p-2 rounded-2xl ring-1 ring-white/5">
                          {[10, 50, 100, 500].map(val => (
                            <button 
                              key={val}
                              onClick={() => setCurrentBet(val)}
                              className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${currentBet === val ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400 hover:bg-white/5'}`}
                            >
                              ${val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={startVideoPoker}
                        className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.05] active:scale-[0.95]"
                      >
                        Deal Hand
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={drawVideoPoker}
                      className="px-24 py-8 bg-neutral-100 hover:bg-white text-neutral-950 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center gap-4 group"
                    >
                      Draw Cards
                      <RotateCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                  )}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: IMAGE EDITOR ================= */}
      {editingId && (
        <div className="fixed inset-0 z-[110] bg-neutral-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-neutral-900 rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[95vh]">
            <div className="p-6 sm:p-10 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                  <Scissors className="text-indigo-400" size={20} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Fine Tune</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest">Adjusting {CARD_TYPES.find(t => t.id === editingId)?.label}</p>
                </div>
              </div>
              <button onClick={() => setEditingId(null)} className="p-2 sm:p-3 hover:bg-white/5 rounded-2xl text-neutral-500 hover:text-white transition-colors"><X /></button>
            </div>
            
            <div className="p-6 sm:p-12 flex flex-col items-center gap-8 sm:gap-12 overflow-y-auto custom-scrollbar">
              <div className="relative w-48 h-72 sm:w-64 sm:h-96 bg-black rounded-2xl overflow-hidden ring-4 ring-indigo-600/30 flex items-center justify-center shadow-2xl shrink-0">
                <img 
                  src={images[editingId]} 
                  alt="Editing" 
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)' }}
                  className="max-w-none w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none border-[20px] sm:border-[30px] border-black/40"></div>
                <div className="absolute inset-0 pointer-events-none border border-white/10 m-[20px] sm:m-[30px]"></div>
              </div>

              <div className="w-full space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-3 text-xs sm:text-sm font-black text-neutral-400 uppercase tracking-widest"><ZoomIn size={16} /> Magnification</span>
                    <span className="font-mono text-indigo-400 font-black text-sm sm:text-base">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"/>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-3 text-xs sm:text-sm font-black text-neutral-400 uppercase tracking-widest"><RotateCw size={16} /> Rotation</span>
                    <span className="font-mono text-indigo-400 font-black text-sm sm:text-base">{rotation}°</span>
                  </div>
                  <input type="range" min="0" max="360" step="1" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 bg-black/40 border-t border-white/5 flex gap-4 sm:gap-6 shrink-0">
              <button onClick={() => { setZoom(1); setRotation(0); setEditingId(null); }} className="flex-1 py-4 sm:py-5 rounded-2xl border-2 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all">Discard</button>
              <button onClick={() => setEditingId(null)} className="flex-1 py-4 sm:py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl shadow-indigo-600/20">Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SECURE PAYMENT ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-neutral-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 animate-in zoom-in slide-in-from-bottom-8 duration-700 shadow-[0_50px_150px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
            
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white tracking-tight">Checkout</h3>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em]">Secure 256-bit SSL Connection</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-neutral-500 hover:text-white transition-colors"><X /></button>
            </div>

            <div className="space-y-10">
              <div className="bg-black/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden group/amount">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover/amount:bg-indigo-600/10 transition-colors" />
                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-3">Amount Due</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-6xl font-black text-white tracking-tighter">${PRICE_MXN}.00</p>
                  <p className="text-neutral-500 font-black uppercase tracking-widest">MXN</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] ml-2">Card Details</label>
                  <div className="bg-neutral-950 border border-white/5 p-5 rounded-2xl text-white flex items-center justify-between group/input focus-within:border-indigo-500/50 transition-colors shadow-inner">
                    <div className="flex items-center gap-4 font-mono text-xl">
                      <CreditCard size={24} className="text-indigo-500" />
                      <span className="tracking-widest opacity-80">•••• •••• •••• 4242</span>
                    </div>
                    <div className="w-10 h-6 bg-neutral-800 rounded-md shadow-inner"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] ml-2">Expiry</label>
                    <div className="bg-neutral-950 border border-white/5 p-5 rounded-2xl text-white font-mono text-lg text-center shadow-inner">12 / 28</div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] ml-2">CVC</label>
                    <div className="bg-neutral-950 border border-white/5 p-5 rounded-2xl text-white font-mono text-lg text-center shadow-inner">•••</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePayment} disabled={isProcessing}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-neutral-800 disabled:text-neutral-600 rounded-2xl font-black text-xl mt-4 transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] group/btn"
              >
                {isProcessing ? (
                  <><div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>Processing...</>
                ) : (
                  <>
                    Confirm & Pay
                    <CheckCircle2 size={22} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[0.2em]">Protected by Stripe & AES-256 Encryption</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATION: SUCCESS ================= */}
      {isPaid && !showPaymentModal && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[130] bg-neutral-900 border border-indigo-500/30 text-white px-10 py-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center gap-6 animate-in slide-in-from-bottom-20 duration-700 ring-1 ring-white/10 backdrop-blur-2xl">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 animate-bounce">
            <CheckCircle2 size={32} strokeWidth={3} />
          </div>
          <div className="space-y-1">
            <p className="font-black text-2xl leading-none tracking-tight">Payment Verified!</p>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Your HD Masterpiece is Ready</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-6 { transform: rotateY(6deg); }
        .-rotate-y-6 { transform: rotateY(-6deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79,70,229,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79,70,229,0.4); }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default App;