import { useState, useMemo, useEffect } from 'react';
import { 
  Upload, CreditCard, Download, Image as ImageIcon, 
  CheckCircle2, X, Maximize2, 
  RotateCw, ZoomIn, Scissors, Palette, Loader2,
  Eye, Layout, Coins, Play, RotateCcw,
  Share2, Save, Link as LinkIcon, Cloud, Rabbit, ShieldCheck
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// ================= STRIPE INITIALIZATION =================
const stripePromise = loadStripe('pk_test_51SsyuyJx3w1bRrWK1BP69wWpOO3qooxOMxnFlJSfV7r9cchJeTp4ElisQbJbli4HwkERDZAndezh69SZ0pd41Fmy00AGeEuuO4');

// ================= FIREBASE INITIALIZATION =================
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'poker-studio-custom';

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {
        // Correct API Key and configuration
        apiKey: "AIzaSyBD3nbgsOehg7nLpqU3flWZlbn2Y084kRw", 
        authDomain: "atpoker-a07e0.firebaseapp.com",
        projectId: "atpoker-a07e0",
        storageBucket: "atpoker-a07e0.firebasestorage.app",
        messagingSenderId: "722444230328",
        appId: "1:722444230328:web:8437d76a048f7b19a89e4d"
      };
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase failed to initialize. Make sure you have an internet connection.", error);
}

// Configuration Constants
const PRICE_MXN = 199;

// ================= TIME LIMIT CONFIGURATION =================
// Cambia esto a 'false' para desactivar el límite de tiempo de juego
const ENABLE_TIME_LIMIT = false;
const TIME_LIMIT_SECONDS = 300; // 5 minutos de juego
const COOLDOWN_HOURS = 8; // 8 horas de espera entre sesiones (1 turno de trabajo)

// ================= REDIRECT CONFIGURATION =================
// Cuando está en 'true', al hacer clic en "Got It" redirige a Atlas Senior Living
// Cuando está en 'false', solo cierra el mensaje y va al editor (para desarrollo local)
const ENABLE_REDIRECT_ON_TIMEOUT = false;
const REDIRECT_URL = 'https://atlasseniorliving.net';

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

// ================= IMAGE COMPRESSOR HELPER =================
const compressImage = (base64Str, maxSize = 600) => {
  return new Promise((resolve) => {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
      resolve(base64Str); 
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
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
            {!card.isCustom && !card.isJoker && bgImg && (
              <div className="absolute inset-0 z-0">
                <img src={bgImg} className="w-full h-full object-cover opacity-40 mix-blend-multiply" alt="Background" />
              </div>
            )}

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
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.02)_100%)] pointer-events-none z-20" />
          </div>
        )}
      </div>
    </div>
  );
};


// ================= STRIPE COMPONENTS FOR LOCAL DEVELOPMENT =================
/* DESCOMENTA ESTE CÓDIGO EN TU VS CODE (DESPUÉS DE INSTALAR LAS LIBRERÍAS)
  Y BORRA EL COMPONENTE "StripeCheckoutFormMock" QUE ESTÁ ABAJO.

const StripeCheckoutFormReal = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      console.log('[Stripe] PaymentMethod Created successfully:', paymentMethod);
      // Simula el procesamiento del backend o conéctalo a tu API
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 2000);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSmoothing: 'antialiased',
        fontSize: '18px',
        '::placeholder': { color: '#525252' },
        iconColor: '#818cf8',
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handlePayment} className="space-y-10">
      <div className="bg-black/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden group/amount">
        <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-3">Amount Due</p>
        <div className="flex items-baseline gap-3">
          <p className="text-6xl font-black text-white tracking-tighter">${amount}.00</p>
          <p className="text-neutral-500 font-black uppercase tracking-widest">MXN</p>
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] ml-2">Secure Card Details</label>
        <div className="bg-neutral-950 border border-white/5 p-5 rounded-2xl shadow-inner focus-within:border-indigo-500/50 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
        {errorMessage && <div className="text-red-400 mt-2 text-sm font-medium">{errorMessage}</div>}
      </div>
      <button type="submit" disabled={!stripe || isProcessing} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl flex items-center justify-center">
        {isProcessing ? "Processing..." : "Confirm & Pay"}
      </button>
    </form>
  );
};
*/

// ================= STRIPE CHECKOUT FORM (REAL) =================
const StripeCheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      console.log('[Stripe] PaymentMethod Created successfully:', paymentMethod);
      
      try {
        // Al usar el proxy de Vite configurado en vite.config.js, 
        // simplemente llamamos a la ruta relativa y Vite se encargará de redirigirla al puerto 3000 (Vercel).
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            amount: amount
          }),
        });

        const data = await response.json();
        console.log('[Stripe Backend Response]:', data);

        if (data.success) {
          setIsProcessing(false);
          onSuccess();
        } else {
          setErrorMessage(data.error || "Payment failed at the server.");
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('[Stripe Network Error]:', err);
        setErrorMessage("Network error: Could not reach the payment server. Make sure you are running 'npx vercel dev' in a second terminal.");
        setIsProcessing(false);
      }
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSmoothing: 'antialiased',
        fontSize: '18px',
        '::placeholder': { color: '#525252' },
        iconColor: '#818cf8',
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handlePayment} className="space-y-10">
      {/* Sandbox Badge */}
      <div className="absolute top-12 -right-12 rotate-45 bg-amber-500 text-black text-[10px] font-black px-12 py-1 shadow-xl z-50 uppercase tracking-widest">
        Sandbox Mode
      </div>

      <div className="bg-black/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden group/amount">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] rounded-full -mr-16 -mt-16" />
        <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-3">Amount Due</p>
        <div className="flex items-baseline gap-3">
          <p className="text-6xl font-black text-white tracking-tighter">${amount}.00</p>
          <p className="text-neutral-500 font-black uppercase tracking-widest">MXN</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Secure Payment Details</label>
          <div className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
          </div>
        </div>
        
        <div className="bg-neutral-950 border border-white/5 p-5 rounded-2xl shadow-inner focus-within:border-indigo-500/50 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>

        <div className="flex items-center gap-3 px-3 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
           <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Test Card: <span className="font-mono ml-1">4242 4242 4242 4242</span></p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-400 mt-2 ml-2 text-sm font-medium">
            <X size={16} className="text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 border-2 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-white rounded-2xl font-black text-sm uppercase transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-2 py-6 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-neutral-800 disabled:text-neutral-600 rounded-2xl font-black text-xl transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] group/btn"
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
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-bold uppercase tracking-[0.2em]">
          <ShieldCheck size={14} className="text-green-500/50" /> Secure 256-bit SSL Encryption
        </div>
        <p className="text-[9px] text-neutral-700 font-medium text-center leading-relaxed">
          Your payment is processed securely by Stripe. We do not store your card details.
        </p>
      </div>
    </form>
  );
};


const App = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState({});
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState('editor'); // editor | preview | games | blackjack | poker
  const [balance, setBalance] = useState(1000);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLoadingDesign, setIsLoadingDesign] = useState(true);
  const [isSharedMode, setIsSharedMode] = useState(false); // <--- New State for Header Visibility
  
  // Image editor state
  const [editingId, setEditingId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // ================= TIME LIMIT STATE (5 MINUTES) =================
  const [gameStartTime, setGameStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(TIME_LIMIT_SECONDS);
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // ================= FIREBASE AUTH & INIT =================
  useEffect(() => {
    const initAuth = async () => {
      if (!auth) return; // Safely skip if Firebase auth wasn't initialized
      try {
        if (typeof __firebase_config !== 'undefined' && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // This signs in anonymously locally
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    
    initAuth();
    
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  // Check for shared design ID in URL
  useEffect(() => {
    const checkUrlForDesign = async () => {
      // Only check this if we have authentication and an active database
      if (!user || !db) {
         setIsLoadingDesign(false);
         return; 
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const sharedDesignId = urlParams.get('deck');

      if (sharedDesignId) {
        setIsLoadingDesign(true);
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'designs', sharedDesignId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setImages(docSnap.data().images || {});
            setIsSharedMode(true); // <--- Hide the header
            setView('games'); // Skip directly to games
          } else {
            console.error("Shared design not found.");
            alert("We couldn't find the shared deck. Starting with a new one.");
            // Remove the invalid param from URL cleanly
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newUrl},'',newUrl);
          }
        } catch (err) {
          console.error("Error loading shared design:", err);
        } finally {
          setIsLoadingDesign(false);
        }
      } else {
        setIsLoadingDesign(false);
      }
    };

    checkUrlForDesign();
  }, [user]);


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

  // ================= TIME LIMIT LOGIC (5 MINUTES) =================
  // Verificar cooldown al cargar la aplicación
  useEffect(() => {
    if (!ENABLE_TIME_LIMIT) return;
    
    const storedCooldownEnd = localStorage.getItem('gameCooldownEnd');
    if (storedCooldownEnd) {
      const cooldownEnd = parseInt(storedCooldownEnd);
      const now = Date.now();
      
      if (now < cooldownEnd) {
        setCooldownEndTime(cooldownEnd);
        setIsTimeLimitReached(true);
      } else {
        // El cooldown ya expiró, limpiar
        localStorage.removeItem('gameCooldownEnd');
      }
    }
  }, []);

  // Actualizar el tiempo restante de cooldown cada segundo
  useEffect(() => {
    if (!ENABLE_TIME_LIMIT || !cooldownEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((cooldownEndTime - now) / 1000));
      
      setRemainingCooldown(remaining);
      
      if (remaining <= 0) {
        // Cooldown terminado
        setCooldownEndTime(null);
        setIsTimeLimitReached(false);
        localStorage.removeItem('gameCooldownEnd');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  useEffect(() => {
    if (!ENABLE_TIME_LIMIT) return; // Si está desactivado, no hacer nada
    
    // Iniciar temporizador cuando el usuario entra a los juegos
    if ((view === 'blackjack' || view === 'poker') && !gameStartTime && !isTimeLimitReached) {
      setGameStartTime(Date.now());
    }

    // Resetear cuando sale de los juegos (pero NO resetear el cooldown)
    if (view !== 'blackjack' && view !== 'poker' && view !== 'games') {
      setGameStartTime(null);
      setRemainingTime(TIME_LIMIT_SECONDS);
      setShowTimeWarning(false);
    }
  }, [view]);

  useEffect(() => {
    if (!ENABLE_TIME_LIMIT || !gameStartTime || isTimeLimitReached) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = TIME_LIMIT_SECONDS - elapsed;

      if (remaining <= 0) {
        setIsTimeLimitReached(true);
        setRemainingTime(0);
        setShowTimeWarning(false);
        
        // Establecer el cooldown de 8 horas
        const cooldownEnd = Date.now() + (COOLDOWN_HOURS * 60 * 60 * 1000);
        setCooldownEndTime(cooldownEnd);
        localStorage.setItem('gameCooldownEnd', cooldownEnd.toString());
        
        // Forzar salida a la pantalla de selección de juegos
        setView('games');
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
        // Mostrar advertencia cuando quedan 30 segundos
        if (remaining <= 30 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime, isTimeLimitReached, showTimeWarning]);

  // ================= BLACKJACK STATE & LOGIC =================
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
    if (balance < currentBet) { alert("Insufficient funds"); return; }
    setBalance(prev => prev - currentBet);
    const newDeck = shuffleDeck(generateDeck(false));
    setBjPlayerHand([newDeck[0], newDeck[2]]);
    setBjDealerHand([newDeck[1], newDeck[3]]);
    setBjDeck(newDeck.slice(4));
    setBjState('playing');
    setBjMessage('');

    if (getBjScore([newDeck[0], newDeck[2]]) === 21) {
      setBjState('gameOver');
      setBjMessage('Blackjack! You win.');
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
      setBjMessage('Bust. Dealer wins.');
    }
  };

  const standBlackjack = () => {
    setBjState('dealerTurn');
    let currentDealerHand = [...bjDealerHand];
    let currentDeck = [...bjDeck];
    
    // Dealer plays automatically
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
      setBjMessage('Dealer busts. You win!');
      setBalance(prev => prev + (currentBet * 2));
    } else if (playerScore > dealerScore) {
      setBjMessage('You win!');
      setBalance(prev => prev + (currentBet * 2));
    } else if (dealerScore > playerScore) {
      setBjMessage('Dealer wins.');
    } else {
      setBjMessage('Push.');
      setBalance(prev => prev + currentBet); // Return bet
    }
  };

  // ================= VIDEO POKER STATE & LOGIC (Jacks or Better) =================
  const [vpDeck, setVpDeck] = useState([]);
  const [vpHand, setVpHand] = useState([]);
  const [vpHeld, setVpHeld] = useState([false, false, false, false, false]);
  const [vpState, setVpState] = useState('betting'); // betting, playing, gameOver
  const [vpMessage, setVpMessage] = useState('');

  const rankValues = { '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14 };

  const evaluatePokerHand = (hand) => {
    if (hand.length < 5) return { name: "Nothing", mult: 0 };
    const suits = hand.map(c => c.suit);
    const ranks = hand.map(c => rankValues[c.rank]).sort((a,b) => a - b);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i-1] + 1) || 
                       (ranks.join(',') === '2,3,4,5,14'); // A-2-3-4-5 straight
    
    const counts = {};
    ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
    const freq = Object.values(counts).sort((a,b) => b - a);

    if (isFlush && isStraight && ranks[4] === 14) return { name: "Royal Flush", mult: 250 };
    if (isFlush && isStraight) return { name: "Straight Flush", mult: 50 };
    if (freq[0] === 4) return { name: "Four of a Kind", mult: 25 };
    if (freq[0] === 3 && freq[1] === 2) return { name: "Full House", mult: 9 };
    if (isFlush) return { name: "Flush", mult: 6 };
    if (isStraight) return { name: "Straight", mult: 4 };
    if (freq[0] === 3) return { name: "Three of a Kind", mult: 3 };
    if (freq[0] === 2 && freq[1] === 2) return { name: "Two Pair", mult: 2 };
    
    // Jacks or Better
    const hasJacksOrBetter = Object.keys(counts).some(r => counts[r] === 2 && parseInt(r) >= 11);
    if (hasJacksOrBetter) return { name: "Jacks or Better", mult: 1 };

    return { name: "Nothing", mult: 0 };
  };

  const startVideoPoker = () => {
    if (balance < currentBet) { alert("Insufficient funds"); return; }
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
      setVpMessage(`¡${result.name}! You win $${winAmount}`);
      setBalance(prev => prev + winAmount + currentBet);
    } else {
      setVpMessage('No win. Better luck next time.');
    }
  };

  // ================= BASE FUNCTIONS =================
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

  const handleSaveDesignLocal = () => {
    const data = JSON.stringify(images);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poker-studio-design-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToCloud = async () => {
    if (!db || !auth) {
      alert("Error: Firebase configuration is not initialized correctly. Check your firebaseConfig.");
      return;
    }
    
    let currentUser = user || auth.currentUser;

    if (!currentUser) {
      try {
        const credential = await signInAnonymously(auth);
        currentUser = credential.user;
        setUser(currentUser);
      } catch (err) {
        alert("🚨 Firebase Authentication Error:\n\n" + err.message + "\n\nMake sure 'Anonymous' is enabled in Firebase.");
        return;
      }
    }
    
    setIsSavingToCloud(true);
    try {
      // 1. Strong Image Compression before uploading (Avoids exceeding 1MB limit)
      const compressedImages = {};
      for (const [key, base64Data] of Object.entries(images)) {
          // Use 600px instead of 800px to be even safer
          compressedImages[key] = await compressImage(base64Data, 600); 
      }

      // 2. Save to Database
      const designId = crypto.randomUUID();
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'designs', designId);
      
      await setDoc(docRef, {
        creatorId: currentUser.uid,
        createdAt: new Date().toISOString(),
        images: compressedImages // Save the already compressed images
      });

      // 3. Generate final URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('deck', designId);
      setShareUrl(currentUrl.toString());

    } catch (error) {
      console.error("Error saving design to cloud:", error);
      if (error.message && error.message.includes("payload size")) {
        alert("🚨 The deck is still too large for the database (1MB limit).\n\nTry uploading simpler or lower resolution images.");
      } else {
        alert("🚨 Firestore Error:\n\n" + error.message + "\n\nIf it says 'Missing or insufficient permissions', go to Firestore -> Rules and set them to Test Mode (allow read, write: if true;).");
      }
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleCopyLink = () => {
    try {
      // Using execCommand as clipboard API might be restricted in iframes
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert("Link copied to clipboard! Anyone with this link will enter directly to play with your deck.");
    } catch (err) {
      console.error("Failed to copy", err);
    }
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

      const deck = generateDeck(true); // With Jokers
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

      const fileName = isSample ? 'Sample_Poker_Deck.pdf' : 'Custom_Poker_Deck.pdf';
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Make sure you have installed jspdf (npm install jspdf)");
    } finally {
      setIsGenerating(false);
    }
  };

  const allImagesUploaded = CARD_TYPES.filter(t => t.id !== 'customBackground').every(type => images[type.id]);
  const hasAnyImage = Object.keys(images).length > 0;

  if (isLoadingDesign) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <h2 className="text-2xl font-black tracking-widest uppercase">Loading Custom Deck</h2>
        <p className="text-neutral-500 mt-2">Preparing the casino floor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden antialiased">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar - Hides if isSharedMode is true */}
      {!isSharedMode && (
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
                { id: 'games', label: 'Casino', icon: Rabbit }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer ${
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
      )}

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
                          <button onClick={() => setEditingId(type.id)} className="p-2.5 bg-white/5 hover:bg-indigo-500/20 rounded-xl text-neutral-400 hover:text-indigo-400 transition-all duration-300 cursor-pointer">
                            <Maximize2 size={16} />
                          </button>
                          <button onClick={() => removeImage(type.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-neutral-500 hover:text-red-400 transition-all duration-300 cursor-pointer">
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
                            onClick={handleSaveDesignLocal}
                            title="Save Backup Locally"
                            className="p-2 bg-neutral-950 rounded-lg ring-1 ring-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                          >
                            <Save size={14} />
                          </button>
                          <label className="p-2 bg-neutral-950 rounded-lg ring-1 ring-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer" title="Load Backup">
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

                  {/* Public Share Section */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center px-1 mb-2">
                       <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><Cloud size={14} /> Cloud Casino</span>
                    </div>
                    
                    {!shareUrl ? (
                      <button 
                        disabled={!hasAnyImage || isSavingToCloud}
                        onClick={handleSaveToCloud}
                        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                          hasAnyImage && !isSavingToCloud
                            ? "bg-neutral-800 text-white hover:bg-neutral-700 shadow-lg cursor-pointer" 
                            : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {isSavingToCloud ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                        Publish & Share Link
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                           <p className="text-green-400 text-xs font-bold text-center">Design published to the cloud!</p>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={shareUrl} 
                            className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-3 text-xs font-mono text-neutral-400 focus:outline-none"
                          />
                          <button 
                            onClick={handleCopyLink}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors cursor-pointer"
                            title="Copy Link"
                          >
                            <LinkIcon size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-500 text-center leading-tight">Share this link. Anyone opening it will go directly to the casino with your deck.</p>
                      </div>
                    )}
                  </div>


                  <div className="space-y-8 pt-4 border-t border-white/5">
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
                              ? "bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer" 
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
                          className="w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 border-2 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} strokeWidth={2.5} />}
                          Get Watermarked Sample
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <button 
                          className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all duration-500 shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
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
                 <Rabbit size={40} className="text-white" />
              </div>
              <div className="space-y-6">
                <h1 className="text-7xl font-black text-indigo-500 tracking-tight">You Followed the <span className="text-white">White Rabbit</span></h1>
                <p className="text-neutral-500 text-xl max-w-1l mx-auto leading-relaxed">Curiouser and curiouser! You followed the White Rabbit down the hole and landed straight at the Atlas Blackjack and Poker table. Welcome to the madness—ready to chase 21.</p>
                
                {/* Mensaje motivacional para empleados */}
                <div className="max-w-2xl mx-auto mt-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-neutral-300 text-center leading-relaxed text-base">
                    We deeply value your dedication and commitment to our community. 
                    <span className="text-indigo-400 font-semibold"> Take 5 minutes to clear your mind, recharge, and return to work refreshed.</span>
                    <br />
                    <span className="text-neutral-500 text-sm mt-2 block">You've earned this break.</span>
                  </p>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-4 bg-neutral-900 px-8 py-4 rounded-[2rem] border border-white/5 font-black text-2xl shadow-2xl ring-1 ring-white/5 relative group">
                 <Coins className="text-yellow-500" size={28} /> 
                 <span className="text-white">${balance.toLocaleString()}</span>
                 <span className="text-neutral-600 text-xs uppercase tracking-[0.3em] ml-2">Credits</span>
                 
                 {balance < 10 && (
                   <button 
                     onClick={() => setBalance(prev => prev + 1000)}
                     className="absolute -right-2 -top-2 bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90 cursor-pointer"
                     title="Refill Credits"
                   >
                     <RotateCcw size={16} strokeWidth={3} />
                   </button>
                 )}
              </div>

              {/* Mensaje de límite de tiempo alcanzado */}
              {ENABLE_TIME_LIMIT && isTimeLimitReached && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-2xl mx-auto">
                  <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-[2rem] p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <X size={24} className="text-white" strokeWidth={3} />
                      </div>
                      <h3 className="text-3xl font-black text-amber-400 tracking-tight">Game Time Depleted</h3>
                    </div>
                    <p className="text-neutral-300 text-center leading-relaxed mb-4">
                      You've reached the 5-minute play limit. Remember, this is just a quick break. 
                      <br />
                      <span className="text-amber-400 font-bold">Get back to work and return later!</span>
                    </p>
                    
                    {remainingCooldown > 0 && (
                      <div className="mt-6 bg-neutral-900/60 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">⏳</span>
                          </div>
                          <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">Next Session Available In:</p>
                        </div>
                        <div className="flex justify-center gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-black text-white font-mono">
                              {Math.floor(remainingCooldown / 3600)}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">Hours</div>
                          </div>
                          <div className="text-4xl font-black text-neutral-600 self-center">:</div>
                          <div className="text-center">
                            <div className="text-4xl font-black text-white font-mono">
                              {String(Math.floor((remainingCooldown % 3600) / 60)).padStart(2, '0')}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">Minutes</div>
                          </div>
                          <div className="text-4xl font-black text-neutral-600 self-center">:</div>
                          <div className="text-center">
                            <div className="text-4xl font-black text-white font-mono">
                              {String(remainingCooldown % 60).padStart(2, '0')}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">Seconds</div>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 text-center mt-4 font-medium">
                          You can play again after your work shift (8 hours)
                        </p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        if (ENABLE_REDIRECT_ON_TIMEOUT) {
                          // Producción: Redirigir a Atlas Senior Living
                          window.location.href = REDIRECT_URL;
                        } else {
                          // Desarrollo local: Solo cerrar el mensaje y volver al editor
                          setView('editor');
                        }
                      }}
                      className="mt-6 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-sm uppercase tracking-widest transition-all mx-auto block cursor-pointer"
                    >
                      Let's Back to Work
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {[
                { 
                  id: 'blackjack', 
                  title: 'Blackjack', 
                  desc: 'Challenge the house and hit 21 using your unique custom deck.',
                  icon: Rabbit,
                  accent: 'indigo',
                  action: () => { 
                    if (ENABLE_TIME_LIMIT && isTimeLimitReached) {
                      const hours = Math.floor(remainingCooldown / 3600);
                      const minutes = Math.floor((remainingCooldown % 3600) / 60);
                      alert(`⏳ You must wait ${hours}h ${minutes}m before you can play again.\n\nYou can play after your work shift.`);
                      return;
                    }
                    setBjState('betting'); 
                    setView('blackjack'); 
                  }
                },
                { 
                  id: 'poker', 
                  title: 'Video Poker', 
                  desc: 'Classic Jacks or Better. Aim for the Royal Flush and multiply your credits.',
                  icon: Play,
                  accent: 'purple',
                  action: () => { 
                    if (ENABLE_TIME_LIMIT && isTimeLimitReached) {
                      const hours = Math.floor(remainingCooldown / 3600);
                      const minutes = Math.floor((remainingCooldown % 3600) / 60);
                      alert(`⏳ You must wait ${hours}h ${minutes}m before you can play again.\n\nYou can play after your work shift.`);
                      return;
                    }
                    setVpState('betting'); 
                    setView('poker'); 
                  }
                }
              ].map(game => (
                <div 
                  key={game.id}
                  onClick={game.action}
                  className={`group bg-neutral-900/40 border border-white/5 rounded-[3rem] p-12 hover:bg-neutral-900/60 hover:border-white/10 transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden flex flex-col items-start ${isTimeLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`absolute -right-12 -bottom-12 opacity-[0.03] text-white group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none`}>
                     {game.id === 'blackjack' ? <Rabbit size={280} /> : <div className="font-serif font-black text-[18rem] leading-none">A♠</div>}
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
                className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/5 transition-all cursor-pointer"
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
               
               {/* Atlas Logo Watermark - Grabado en el terciopelo */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] group-hover/table:opacity-[0.06] transition-opacity duration-700">
                 <img 
                   src="/atlas-globe-icon-large.png" 
                   alt="Atlas Logo" 
                   className="w-[400px] h-[400px] object-contain grayscale brightness-200 contrast-50"
                 />
               </div>
               
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
                         className="shadow-2xl hover:translate-y-[-10px] transition-transform duration-500 cursor-grab active:cursor-grabbing"
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
                         className="w-20 h-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full font-black text-xs uppercase tracking-widest border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-90 flex flex-col items-center justify-center gap-1 group/hit animate-in fade-in slide-in-from-right-4 duration-500 cursor-pointer"
                       >
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/hit:bg-white/10 transition-colors">
                            <Play size={14} className="rotate-90 fill-white" />
                         </div>
                         Hit
                       </button>
                     )}

                     <div className="flex justify-center space-x-4 perspective-1000">
                        {bjPlayerHand.map((card, i) => (
                          <PlayingCard key={i} card={card} images={images} scale={0.8} className="shadow-2xl hover:translate-y-[-20px] transition-transform duration-500 cursor-grab active:cursor-grabbing" />
                        ))}
                     </div>

                     {/* Stand Button Right */}
                     {bjState === 'playing' && (
                       <button 
                         onClick={standBlackjack}
                         className="w-20 h-20 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] border border-white/10 transition-all hover:scale-110 active:scale-90 flex flex-col items-center justify-center gap-1 group/stand animate-in fade-in slide-in-from-left-4 duration-500 cursor-pointer"
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
                           className={`flex-1 py-3 rounded-xl font-black text-xs transition-all cursor-pointer ${currentBet === val ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400 hover:bg-white/5'}`}
                         >
                           ${val}
                         </button>
                       ))}
                     </div>
                   </div>
                   <button 
                     onClick={startBlackjack}
                     className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
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
                className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/5 transition-all cursor-pointer"
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
               
               {/* Atlas Logo Watermark - Grabado en el terciopelo */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] hover:opacity-[0.05] transition-opacity duration-700">
                 <img 
                   src="/atlas-globe-icon-large.png" 
                   alt="Atlas Logo" 
                   className="w-[500px] h-[500px] object-contain grayscale brightness-200 contrast-50"
                 />
               </div>
               
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
                          className={`relative transition-all duration-500 cursor-grab active:cursor-grabbing ${vpHeld[i] ? 'translate-y-[-20px]' : 'group-hover/card:translate-y-[-10px]'}`}
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
                        className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
                      >
                        Deal Hand
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={drawVideoPoker}
                      className="px-24 py-8 bg-neutral-100 hover:bg-white text-neutral-950 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center gap-4 group cursor-pointer"
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

            <Elements stripe={stripePromise}>
              <StripeCheckoutForm 
                amount={PRICE_MXN} 
                onSuccess={() => {
                  setShowPaymentModal(false);
                  setIsPaid(true);
                }}
                onCancel={() => setShowPaymentModal(false)} 
              />
            </Elements>

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

      {/* ================= NOTIFICATION: TIME WARNING (30 SECONDS) ================= */}
      {showTimeWarning && !isTimeLimitReached && (view === 'blackjack' || view === 'poker') && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[130] bg-amber-500/90 border-2 border-amber-400 text-black px-8 py-4 rounded-[2rem] shadow-[0_20px_60px_rgba(251,191,36,0.6)] flex items-center gap-4 animate-in slide-in-from-top-8 duration-500 backdrop-blur-xl">
          <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-2xl">⏰</span>
          </div>
          <div className="space-y-0.5">
            <p className="font-black text-lg leading-none tracking-tight">Time Almost Up!</p>
            <p className="text-xs font-bold opacity-80">{remainingTime} seconds remaining</p>
          </div>
        </div>
      )}

      {/* ================= FIXED TIMER DISPLAY (ALWAYS VISIBLE) ================= */}
      {ENABLE_TIME_LIMIT && (view === 'blackjack' || view === 'poker') && (
        <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-8 duration-500">
          <div className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-3 font-black transition-all shadow-2xl backdrop-blur-xl ${
            remainingTime <= 30 
              ? 'bg-red-500/90 border-red-400 animate-pulse' 
              : 'bg-neutral-900/90 border-white/10'
          }`}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${remainingTime <= 30 ? 'bg-white animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[8px] uppercase tracking-wider opacity-60 text-white">Time</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-mono leading-none ${remainingTime <= 30 ? 'text-white' : 'text-white'}`}>
                {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-60 text-white mt-0.5">
                {remainingTime <= 30 ? 'Hurry!' : 'Remaining'}
              </span>
            </div>
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
        
        /* Cursor personalizado para cartas de poker */
        .cursor-grab {
          cursor: grab;
          cursor: -webkit-grab;
          cursor: -moz-grab;
        }
        .cursor-grab:active,
        .active\\:cursor-grabbing:active {
          cursor: grabbing;
          cursor: -webkit-grabbing;
          cursor: -moz-grabbing;
        }
      `}} />
    </div>
  );
};

export default App;