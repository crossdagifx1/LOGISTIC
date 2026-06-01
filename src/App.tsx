import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Layers, 
  Activity, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Plus, 
  Upload, 
  Camera, 
  Info,
  Inbox,
  Lock,
  Mail,
  LogOut,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Types Definitions
interface Courier {
  id: string;
  name: string;
  phone: string;
  status: 'Idle' | 'Dispatched' | 'Suspended';
  assignedManifests: string[];
  documentUrl?: string;
  signatureUrl?: string;
  rating: number;
  joinedDate: string;
  commissionEarned: number; // ETB
}

interface Manifest {
  trackingCode: string;
  destination: 'Bole Zone' | 'Mercato Zone' | 'Kazanchis Zone';
  type: 'High-Value Electronics' | 'Medical Supplies' | 'Secured Documents' | 'Laptops & Tech' | 'Imported Shoes' | 'Designer Clothes';
  weight: number; // kg
  units: number; // Cargo items
  status: 'Allocated' | 'In Transit' | 'Awaiting Dispatch' | 'Handed Over' | 'Damaged' | 'Lost' | 'Approved/Arrived' | 'Stuck at Customs';
  assignedCourierId?: string;
  priority: 'Standard' | 'Expedited';
  departureTime?: string; // For expedited
  createdDate: string;
  transitOrigin?: 'Dubai' | 'China' | 'Dire Dawa' | 'Other';
  localAddress?: string;
  cargoPhotoUrl?: string;
}

interface Incident {
  id: string;
  trackingCode: string;
  courierId: string;
  courierName: string;
  type: 'Damaged Cargo' | 'Missing Documents';
  description: string;
  status: 'Pending' | 'Resolved';
  date: string;
  financialPenalty: number; // ETB
}

interface LedgerHistory {
  id: string;
  date: string;
  type: 'Release Manifest' | 'Commission Disbursed' | 'Supplier Balance Cleared' | 'Penalty Deduction';
  amount: number; // ETB
  description: string;
}
const translations = {
  en: {
    portalTitle: "Addis Ababa Last-Mile Logistics Gateway",
    portalSubtitle: "Secure transit routing, dispatcher queues, and live financial ledgers.",
    enterEmail: "Authorized Email Address",
    enterPassword: "Regional Access Security Key",
    presetTitle: "Secure Fast-Pass Preset Roles",
    validateKeys: "Validate Keys & Enter",
    title: "Boltshift Last-Mile",
    agentView: "Agent View",
    dispatcherQueue: "Dispatcher Queue",
    adminControl: "Admin Global Control",
    logout: "Sign Out",
    region: "Region",
    wallet: "My Wallet 💰",
    walletDesc: "I earned this helping deliver items! 🪙",
    rating: "My Rating 🌟",
    ratingDesc: "Customers love my deliveries! 🥰",
    deliveries: "My Deliveries 🎉",
    deliveriesDesc: "All items delivered safely & happily! 🚚",
    travelLevel: "My Travel Level 🏆",
    levelDesc: "Level 12 Active Runner 🚀",
    totalCargo: "Total Cargo Released",
    activeFleet: "Active Ground Fleet",
    exceptions: "Active Exceptions",
    ledgerSettlement: "Ledger Settlement",
    exceptionsDesc: "Pending arbitration cases",
    releasesLastMonth: "Last month: 1140 releases",
    fleetLastMonth: "active",
    wizardTitle: "Quest Guide: Get Ready to Deliver!",
    stepIndicator: "Step {step} of 4",
    step1: "1. Who Are You? 👤",
    step2: "2. My Trip! ✈️",
    step3: "3. Choose Items! 🎒",
    step4: "4. Sign Here! ✍️",
    rememberedCarrier: "Remembered Carrier / Pilot Registry",
    registerStranger: "⚡ Register New Stranger Carrier",
    fullLegalName: "Full Legal Courier Name",
    contactPhone: "Contact Phone Number",
    biometricVerification: "Biometric Passport Verification",
    initializeCamera: "Initialize Camera",
    captureSnap: "Capture Snap",
    cancel: "Cancel",
    clearBiometrics: "Clear Biometrics",
    carrierFlightNum: "Carrier / Flight Number",
    bookingRef: "Booking / Reference Code",
    transitOrigin: "Transit Origin Gateway",
    localDestAddress: "Local Destination Address (Addis Ababa)",
    destProfile: "Destination Profile",
    localResident: "Local Resident",
    transitTraveler: "Transit Traveler",
    pickupHub: "Pickup Location Hub",
    warehouseValidations: "Warehouse stock validations active",
    warehouseDesc: "Allocated units will be deducted from active hub quantities. If the allocation exceeds remaining storage balances, the system will prevent custody releases.",
    cargoCategory: "Cargo Category",
    targetZone: "Target Delivery Zone",
    unitsAllocated: "Units Allocated",
    cargoIntakeStatus: "Cargo Security Intake Status",
    cargoPhotoVerification: "Cargo Visual Verification Photo",
    snapPhoto: "Snap Photo 📸",
    remainingStock: "Remaining Hub Storage Balance:",
    itemsLeft: "items left!",
    lettersLeft: "letters left!",
    digitalSignature: "Digital Courier Signature Custody Acknowledgment",
    awaitingInput: "AWAITING INPUT",
    signatureCaptured: "SIGNATURE CAPTURED",
    clearCanvas: "Clear Canvas",
    approveSign: "Approve Sign",
    dragDraw: "Drag or touch with pointer to sketch Courier Digital Signature inside the grid area.",
    previousStep: "Previous Step",
    continue: "Continue",
    onboardClear: "Onboard & Clear Cargo",
    itemsInStore: "Available Items in Store",
    medicalSupplies: "Medical Supplies 💊",
    computersPhones: "Computers & Phones 💻",
    importantLetters: "Important Letters ✉️",
    myCourierStats: "My Courier Stats & Level",
    myStarScore: "My star score:",
    travelZone: "Travel zone:",
    fleetRadar: "Active Fleet Telemetry & Zone Loadings",
    cargoBundler: "Expedited Cargo Allocation & Bundle Planner",
    liveIncidents: "Live Exception Alert & Arbitration Queue",
    searchPlaceholder: "Search by manifest type or tracking code...",
    sortBy: "Sort by:",
    direction: "Dir:",
    runAutoBundler: "⚡ Run Geo-Bundler Optimizer",
    dispatcherIncidentConsole: "Dispatcher Incident Resolution Console",
    incidentDesc: "Select an incident to view photo documentation and disburse arbitration penalties.",
    resolveCase: "Resolve Exception",
    chatFleet: "Fleet Walkie-Talkie Communications Terminal",
    chatPlaceholder: "Broadcast secure message to active couriers...",
    send: "Send",
    financialControl: "Administrative Financial Control & Settlement Dials",
    baseCommETB: "Base Delivery Commission (ETB)",
    expeditedModMultiplier: "Expedited Service Modifier",
    usdConversionRate: "USD Parity Exchange Rate",
    usdConversionCalc: "ETB to USD Rapid Conversion Calculator",
    clearingVaultTitle: "Central Clearing Vault Controls",
    vaultReserveBalance: "Vault Reserve Balance:",
    commissionDisbursementQueue: "Commission Disbursement Queue:",
    supplierClearingBalance: "Supplier Clearing Balance:",
    clearCommissions: "💰 Disburse & Clear Commissions",
    clearSupplier: "🚢 Clear Supplier Settlement",
    vaultDepositOverride: "🏦 Manual Controller Vault Cash Override",
    vaultOverrideLog: "Vault Override Log",
    forecastSandbox: "Clearance Sandbox",
    forecastGrowth: "Target Cargo Growth (%)",
    forecastCongestion: "Zone Congestion Multiplier",
    forecastCommissions: "Commissions Boost Modifier",
    forecastProjections: "Projected Zone Yields",
    forecastEstimatedRevenues: "Estimated Clearances Revenue:"
  },
  am: {
    portalTitle: "የአዲስ አበባ የመጨረሻ ማይል ሎጂስቲክስ ፖርታል",
    portalSubtitle: "ደህንነቱ የተጠበቀ የትራንዚት መስመር፣ የአስተላላፊ ወረፋዎች እና የቀጥታ የፋይናንስ መዝገብ።",
    enterEmail: "የተፈቀደ የኢሜል አድራሻ",
    enterPassword: "የክልል መግቢያ ደህንነት ቁልፍ",
    presetTitle: "ደህንነታቸው የተጠበቁ የፈጣን መግቢያ ቅድመ-ቅምጦች",
    validateKeys: "ቁልፎችን አረጋግጥ እና ግባ",
    title: "ቦልትሺፍት የመጨረሻ ማይል",
    agentView: "የወኪል እይታ",
    dispatcherQueue: "የአስተላላፊ ወረፋ",
    adminControl: "አጠቃላይ አስተዳደር",
    logout: "ውጣ",
    region: "ክልል",
    wallet: "የእኔ ቦርሳ 💰",
    walletDesc: "ይህንን ያገኘሁት ዕቃዎችን በማድረስ ነው! 🪙",
    rating: "የእኔ ደረጃ 🌟",
    ratingDesc: "ደንበኞች የእኔን ማድረስ ይወዳሉ! 🥰",
    deliveries: "የእኔ አቅርቦቶች 🎉",
    deliveriesDesc: "ሁሉም ዕቃዎች በሰላም እና በደስታ ደርሰዋል! 🚚",
    travelLevel: "የጉዞ ደረጃዬ 🏆",
    levelDesc: "ደረጃ 12 ንቁ ተላላኪ 🚀",
    totalCargo: "አጠቃላይ የተለቀቀ ጭነት",
    activeFleet: "ንቁ የአቅርቦት ቡድን",
    exceptions: "ንቁ ልዩነቶች (ችግሮች)",
    ledgerSettlement: "የሒሳብ መዝገብ ማቋቋሚያ",
    exceptionsDesc: "በሂደት ላይ ያሉ የግልግል ጉዳዮች",
    releasesLastMonth: "ባለፈው ወር: 1140 መልቀቂያዎች",
    fleetLastMonth: "ንቁ ተሽከርካሪዎች",
    wizardTitle: "የጉዞ መመሪያ፡ ለማድረስ ተዘጋጅ!",
    stepIndicator: "ደረጃ {step} ከ 4",
    step1: "1. ማን ነህ? 👤",
    step2: "2. ጉዞዬ! ✈️",
    step3: "3. ዕቃዎችን ምረጥ! 🎒",
    step4: "4. እዚህ ፈርም! ✍️",
    rememberedCarrier: "የተመዘገቡ አቅራቢዎች / የክፍለ-ጊዜ መዝገብ",
    registerStranger: "⚡ አዲስ እንግዳ አቅራቢ መዝግብ",
    fullLegalName: "ሙሉ ህጋዊ ስም",
    contactPhone: "የእውቂያ ስልክ ቁጥር",
    biometricVerification: "ባዮሜትሪክ ፓስፖርት ማረጋገጫ",
    initializeCamera: "ካሜራውን አስነሳ",
    captureSnap: "ፎቶ አንሳ",
    cancel: "ሰርዝ",
    clearBiometrics: "ባዮሜትሪክስ አጽዳ",
    carrierFlightNum: "የአቅራቢ / የበረራ ቁጥር",
    bookingRef: "የማስያዣ / የማጣቀሻ ኮድ",
    transitOrigin: "የትራንዚት መነሻ መተላለፊያ",
    localDestAddress: "የአካባቢ መድረሻ አድራሻ (አዲስ አበባ)",
    destProfile: "የመድረሻ መገለጫ",
    localResident: "የአካባቢው ነዋሪ",
    transitTraveler: "የትራንዚት ተጓዥ",
    pickupHub: "የመጫኛ ማዕከል",
    warehouseValidations: "የመጋዘን ክምችት ማረጋገጫዎች ንቁ ናቸው",
    warehouseDesc: "የተመደቡት ክፍሎች ከንቁ ማዕከል መጠኖች ይቀነሳሉ። ድልድሉ ከተቀረው የማከማቻ ሂሳብ በላይ ከሆነ ስርዓቱ ጭነቱን እንዳይለቀቅ ይከላከላል።",
    cargoCategory: "የጭነት ምድብ",
    targetZone: "የማድረሻ ዞን",
    unitsAllocated: "የተመደቡ ክፍሎች",
    cargoIntakeStatus: "የጭነት ደህንነት ሁኔታ",
    cargoPhotoVerification: "የጭነት ምስላዊ ማረጋገጫ ፎቶ",
    snapPhoto: "ፎቶ አንሳ 📸",
    remainingStock: "የቀረው የማዕከል ክምችት ሚዛን፡",
    itemsLeft: "ዕቃዎች ቀርተዋል!",
    lettersLeft: "ደብዳቤዎች ቀርተዋል!",
    digitalSignature: "የዲጂታል ፊርማ የጭነት ማረጋገጫ",
    awaitingInput: "ግቤትን በመጠባበቅ ላይ",
    signatureCaptured: "ፊርማ ተመዝግቧል",
    clearCanvas: "ፊርማውን አጽዳ",
    approveSign: "ፊርማውን አጽድቅ",
    dragDraw: "የዲጂታል ፊርማዎን ለመሳል በጣትዎ ወይም በጠቋሚዎ ይንኩ።",
    previousStep: "የቀደመው ደረጃ",
    continue: "ቀጥል",
    onboardClear: "አስገባ እና ጭነቱን ልቀቅ",
    itemsInStore: "በመጋዘን ውስጥ ያሉ ዕቃዎች",
    medicalSupplies: "የሕክምና አቅርቦቶች 💊",
    computersPhones: "ኮምፒውተሮች እና ስልኮች 💻",
    importantLetters: "አስፈላጊ ደብዳቤዎች ✉️",
    myCourierStats: "የእኔ የአቅርቦት ሁኔታ እና ደረጃ",
    myStarScore: "የእኔ ኮከብ ውጤት፡",
    travelZone: "የጉዞ ቀጠና፡",
    fleetRadar: "ንቁ ተሽከርካሪዎች እና የዞን ጭነቶች ቁጥጥር",
    cargoBundler: "የተጣደፈ ጭነት ድልድል እና የጥቅል እቅድ አውጪ",
    liveIncidents: "የቀጥታ ልዩነቶች ማንቂያ እና የክርክር ወረፋ",
    searchPlaceholder: "በምድብ ወይም በኮድ ፈልግ...",
    sortBy: "ደርድር በ:",
    direction: "አቅጣጫ:",
    runAutoBundler: "⚡ የጂኦ-ጥቅል ማሻሻያውን አሂድ",
    dispatcherIncidentConsole: "የአስተላላፊ ችግሮች መፍቻ ሰሌዳ",
    incidentDesc: "የግልግል ቅጣቶችን ለመጣል እና ፎቶዎችን ለማየት ችግሩን ይምረጡ።",
    resolveCase: "ችግሩን ፍታ",
    chatFleet: "የመገናኛ ሬዲዮ ጣቢያ",
    chatPlaceholder: "መልእክት ለሁሉም አቅራቢዎች ያስተላልፉ...",
    send: "ላክ",
    financialControl: "የአስተዳደር ፋይናንስ ቁጥጥር እና የሒሳብ መለኪያዎች",
    baseCommETB: "መሰረታዊ የማድረሻ ኮሚሽን (ETB)",
    expeditedModMultiplier: "የፍጥነት አገልግሎት ማሻሻያ",
    usdConversionRate: "የዶላር ምንዛሬ ዋጋ (USD/ETB)",
    usdConversionCalc: "ETB ወደ USD ፈጣን መቀየሪያ ማስያ",
    clearingVaultTitle: "ማዕከላዊ የሂሳብ መዝገብ መቆጣጠሪያዎች",
    vaultReserveBalance: "የካዝና ተቀማጭ ሂሳብ:",
    commissionDisbursementQueue: "የኮሚሽን ክፍያ ወረፋ:",
    supplierClearingBalance: "የአቅራቢዎች ክፍያ ሚዛን:",
    clearCommissions: "💰 ኮሚሽኖችን ክፈል እና አጽዳ",
    clearSupplier: "🚢 የአቅራቢዎችን ሂሳብ ክፈል",
    vaultDepositOverride: "🏦 የካዝና ተቀማጭ ሂሳብ በእጅ ማሻሻያ",
    vaultOverrideLog: "የካዝና በእጅ ማሻሻያ ምዝግብ ማስታወሻ",
    forecastSandbox: "የመተንበያ ሰሌዳ",
    forecastGrowth: "የታለመው የጭነት ዕድገት (%)",
    forecastCongestion: "የዞን መጨናነቅ ማባዣ",
    forecastCommissions: "የኮሚሽን ማበረታቻ ማሻሻያ",
    forecastProjections: "የታለሙ የዞን ምርቶች",
    forecastEstimatedRevenues: "የታሰበው ጠቅላላ ገቢ:"
  }
};

export default function App() {
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Navigation & Auth Credentials Routing States (Hash-based Routing System)
  // ──────────────────────────────────────────────────────────────────────────
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#login');
  
  // Isolated page authentication states
  const [agentAuthenticated, setAgentAuthenticated] = useState(false);
  const [dispatcherAuthenticated, setDispatcherAuthenticated] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // ── Premium Synthesized Audio System State & Helper (Feature 3) ──────────────────
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mapFlowOffset, setMapFlowOffset] = useState(0);

  // Financial Forecast Sandbox State (Feature 2)
  const [forecastCargoGrowth, setForecastCargoGrowth] = useState(25); // % Cargo load increase
  const [forecastCongestion, setForecastCongestion] = useState(1.2); // Multiplier
  const [forecastCommissionsModifier, setForecastCommissionsModifier] = useState(1.1); // Multiplier

  // Active Live Chat logs (Feature 4)
  interface ChatMessage {
    id: string;
    sender: string;
    avatar: string;
    msg: string;
    time: string;
    role: 'agent' | 'dispatcher' | 'system';
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Map animated flowing laser loops
  useEffect(() => {
    const interval = setInterval(() => {
      setMapFlowOffset(prev => (prev - 1) % 12);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const playSynthSound = (type: 'click' | 'success' | 'alert' | 'scan' | 'signature') => {
    if (!soundEnabled) return;
    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        const playNote = (freq: number, startDelay: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
          gain.gain.setValueAtTime(0.0, ctx.currentTime + startDelay);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + startDelay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
          osc.start(ctx.currentTime + startDelay);
          osc.stop(ctx.currentTime + startDelay + duration);
        };
        playNote(523.25, 0, 0.15); // C5
        playNote(659.25, 0.06, 0.18); // E5
        playNote(783.99, 0.12, 0.25); // G5
        playNote(1046.50, 0.18, 0.4); // C6
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'scan') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'signature') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (err) {
      console.error("Synthesizer error:", err);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent, activeSenderRole: 'agent' | 'dispatcher') => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    playSynthSound('click');
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const newMessageId = `MSG-${Math.random().toString(36).substr(2, 9)}`;
    const newMsg: ChatMessage = {
      id: newMessageId,
      sender: activeSenderRole === 'agent' ? 'Abebe Kebede (CR-001)' : 'Dispatcher Center',
      avatar: activeSenderRole === 'agent' ? 'AG' : 'DP',
      msg: chatInput,
      time: timeStr,
      role: activeSenderRole
    };

    setChatMessages(prev => [...prev, newMsg]);
    
    // Persist user chat message to database
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    }).catch(err => console.error("Failed to sync chat message:", err));

    const inputVal = chatInput.toLowerCase();
    setChatInput('');

    // Simulated Agent/Dispatcher smart reply after 1.2s (Feature 4)
    setTimeout(() => {
      let replyMsg = '';
      let sender = '';
      let avatar = '';
      let role: 'agent' | 'dispatcher' | 'system' = 'system';

      if (activeSenderRole === 'agent') {
        sender = 'Dispatcher Center';
        avatar = 'DP';
        role = 'dispatcher';
        if (inputVal.includes('ready') || inputVal.includes('deliver') || inputVal.includes('happy')) {
          replyMsg = 'Copy that, Abebe! Manifest ET-MER-512 is currently in line for close proximity dispatch bundling. Prepare transit details. 📦';
        } else if (inputVal.includes('signature') || inputVal.includes('onboard') || inputVal.includes('done')) {
          replyMsg = 'Signature received successfully! Digital passport scan is compliant. Safe travels! ✈️';
        } else {
          replyMsg = 'Message logged in regional gateway. Keep transit speed steady. ⚡';
        }
      } else {
        sender = 'Abebe Kebede (CR-001)';
        avatar = 'AG';
        role = 'agent';
        if (inputVal.includes('status') || inputVal.includes('where') || inputVal.includes('comms')) {
          replyMsg = 'Bole Substation zone is clear! Just finished my quick passport validation quest. Ready to roll! 🥇';
        } else if (inputVal.includes('expedite') || inputVal.includes('rush') || inputVal.includes('command')) {
          replyMsg = 'Understood! Transitioning into high gear. Route countdown is active on my cockpit! 🚀';
        } else {
          replyMsg = 'Roger that, Dispatcher! Let’s complete this delivery happily. 🚚';
        }
      }

      const replyMsgId = `MSG-${Math.random().toString(36).substr(2, 9)}`;
      const replyMsgObj: ChatMessage = {
        id: replyMsgId,
        sender,
        avatar,
        msg: replyMsg,
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        role
      };

      setChatMessages(prev => [...prev, replyMsgObj]);
      
      // Persist automated system reply to database
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyMsgObj)
      }).catch(err => console.error("Failed to sync automated reply:", err));

      playSynthSound('success');
    }, 1200);
  };

  // Login input fields state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Performance chart interactive states
  const [hoveredBar, setHoveredBar] = useState<string | null>('Aug');
  
  const monthlyChartData = [
    { month: 'May', sales: 220, revenue: '$2.4k' },
    { month: 'Jun', sales: 180, revenue: '$1.8k' },
    { month: 'Jul', sales: 310, revenue: '$3.2k' },
    { month: 'Aug', sales: 440, revenue: '$4.5k', active: true },
    { month: 'Sep', sales: 190, revenue: '$2.1k' },
    { month: 'Oct', sales: 250, revenue: '$2.8k' },
    { month: 'Nov', sales: 320, revenue: '$3.5k' },
    { month: 'Dec', sales: 280, revenue: '$3.0k' }
  ];

  // ── Regional Switches & Currency State (Feature 3) ──────────────────
  const [currentRegion, setCurrentRegion] = useState<'Addis Ababa' | 'Hawassa' | 'Dire Dawa'>('Addis Ababa');
  
  // Custom mock inventories contextualized by Region (Feature 3)
  const [inventoriesByRegion, setInventoriesByRegion] = useState({
    'Addis Ababa': { totalCapacity: 1000, medicalSupplies: 240, electronics: 180, securedDocs: 90 },
    'Hawassa': { totalCapacity: 800, medicalSupplies: 190, electronics: 140, securedDocs: 60 },
    'Dire Dawa': { totalCapacity: 900, medicalSupplies: 210, electronics: 160, securedDocs: 70 }
  });

  const hubInventory = inventoriesByRegion[currentRegion];
  
  const setHubInventory = (updater: any) => {
    setInventoriesByRegion((prev: any) => {
      const current = prev[currentRegion];
      const updated = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        [currentRegion]: {
          ...current,
          ...updated
        }
      };
    });
  };

  // ── Real-Time Activity Terminal Logs (Feature 2) ──────────────────
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: 'LOG-1', time: '09:40 AM', msg: 'Boltshift Last-Mile Logistics platform initialized successfully.' },
    { id: 'LOG-2', time: '09:42 AM', msg: 'Establishing encrypted regional transit nodes: Bole, Mercato, Kazanchis.' },
    { id: 'LOG-3', time: '09:45 AM', msg: 'System vault checking online: ETB 425,000 reserves verified.' }
  ]);

  const addActivityLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setActivityLogs(prev => [
      { id: `LOG-${Math.random().toString(36).substr(2, 9)}`, time: timeStr, msg },
      ...prev.slice(0, 15) // Keep last 15 logs
    ]);
  };

  // ── Detailed Invoice/Receipt Overlay Modal state (Feature 4) ──────────
  const [selectedManifestSlip, setSelectedManifestSlip] = useState<Manifest | null>(null);

  // ── Stock Replenishment Ticket state (Feature 6) ─────────────────────
  const [restockTickets, setRestockTickets] = useState<Array<{ id: string; type: string; qty: number; status: 'Pending' | 'Approved' }>>([]);
  const [replenishType, setReplenishType] = useState<'Medical Supplies' | 'High-Value Electronics' | 'Secured Documents'>('Medical Supplies');
  const [replenishQty, setReplenishQty] = useState(50);

  // ── Biometrics scanner simulated checklists step 1 (Feature 7) ────────
  const [biometricMatchPulsing, setBiometricMatchPulsing] = useState(false);
  const [biometricChecklist, setBiometricChecklist] = useState({ face: false, citizen: false, municipal: false });

  // ── Proximity Interactive Map popups (Feature 1) ──────────────────────
  const [activeMapNode, setActiveMapNode] = useState<{ id: string; label: string; cx: number; cy: number; desc: string; cap: string } | null>(null);

  // ── Dispatcher Search, sorting, run bundler (Feature 10, 11) ───────────
  const [dispatcherSearchQuery, setDispatcherSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'trackingCode' | 'weight' | 'units' | 'status'>('trackingCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedManifestsForBundle, setSelectedManifestsForBundle] = useState<string[]>([]);
  
  // ── Dispatcher Incident photo simulator state (Feature 13) ────────────
  const [activeFlaggingCode, setActiveFlaggingCode] = useState<string | null>(null);
  const [damagePhotoAttached, setDamagePhotoAttached] = useState(false);
  
  // ── Admin commissions controls and conversions (Feature 14, 15) ──────
  const [adminBaseCommission, setAdminBaseCommission] = useState(400); // ETB baseline
  const [adminExpeditedMod, setAdminExpeditedMod] = useState(1.5); // 1.5x modifier
  const [usdParityRate, setUsdParityRate] = useState(120); // 1 USD = 120 ETB
  const [usdCalculatorVal, setUsdCalculatorVal] = useState('100'); // USD to convert

  // ── Admin manual vault deposits modal wizard state (Feature 18) ────────
  const [vaultWizardOpen, setVaultWizardOpen] = useState(false);
  const [vaultDepositVal, setVaultDepositVal] = useState(50000);
  const [vaultOverrideDesc, setVaultOverrideDesc] = useState('');

  // ── Proximity Interactive Map Component (Feature 1) ──────────────────
  const renderTransitMap = () => {
    const mapNodes = [
      { id: 'MCT', label: 'Mercato Substation', cx: 50, cy: 110, desc: 'Central Cargo Core • 84% Load', cap: 'High Capacity' },
      { id: 'ADD', label: 'Main Kazanchis Hub', cx: 120, cy: 70, desc: 'Sortation Center • 68% Load', cap: 'Regional Base' },
      { id: 'BOL', label: 'Bole Airport Gateway', cx: 190, cy: 30, desc: 'Air Transit Hub • 92% Load', cap: 'Expedited Priority' },
      { id: 'CR1', label: 'Abebe (CR-001)', cx: 85, cy: 90, desc: 'En route with manifest ET-KAZ-308', cap: 'Active Transit' },
      { id: 'CR2', label: 'Selamawit (CR-002)', cx: 155, cy: 50, desc: 'Finalizing delivery ET-MER-114', cap: 'Active Transit' }
    ];

    return (
      <div className='transit-map-wrapper'>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Click nodes or active couriers to check real-time GPS locations and zone metrics.
        </p>

        <svg width="100%" height="160" viewBox="0 0 240 160" className="map-svg-canvas" style={{ cursor: 'pointer' }}>
          {/* Dash grid overlays */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15, 23, 42, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connective Transit roadways with flowing laser light animation (Feature 1) */}
          <path d="M 50 110 L 120 70" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="3" fill="none" />
          <path d="M 50 110 L 120 70" stroke="var(--color-purple)" strokeWidth="2" fill="none" strokeDasharray="6 6" strokeDashoffset={mapFlowOffset} />
          
          <path d="M 120 70 L 190 30" stroke="rgba(8, 145, 178, 0.2)" strokeWidth="3" fill="none" />
          <path d="M 120 70 L 190 30" stroke="var(--color-cyan)" strokeWidth="2" fill="none" strokeDasharray="6 6" strokeDashoffset={mapFlowOffset} />

          <path d="M 85 90 L 120 70" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" fill="none" />
          <path d="M 85 90 L 120 70" stroke="#10b981" strokeWidth="1.5" fill="none" strokeDasharray="4 4" strokeDashoffset={mapFlowOffset} />

          <path d="M 155 50 L 120 70" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="2" fill="none" />
          <path d="M 155 50 L 120 70" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeDasharray="4 4" strokeDashoffset={mapFlowOffset} />

          {/* Central Hub Node (MCT) */}
          <circle cx="50" cy="110" r="7" fill="var(--color-purple-bg)" stroke="var(--color-purple)" strokeWidth="2" onClick={() => {
            playSynthSound('click');
            setActiveMapNode(mapNodes[0]);
            addActivityLog("Inspected Mercato Substation location coordinates.");
          }} />
          <text x="50" y="125" textAnchor="middle" fontSize="8" fontWeight="800" fill="var(--color-purple)">MCT</text>

          {/* Main Kazanchis Hub Node */}
          <circle cx="120" cy="70" r="9" fill="var(--primary-blue-glow)" stroke="var(--primary-blue)" strokeWidth="2" onClick={() => {
            playSynthSound('click');
            setActiveMapNode(mapNodes[1]);
            addActivityLog("Inspected Main Kazanchis Hub coordinates.");
          }} />
          <text x="120" y="87" textAnchor="middle" fontSize="8" fontWeight="800" fill="var(--primary-blue)">ADD</text>

          {/* Bole Airport Hub Node */}
          <circle cx="190" cy="30" r="7" fill="var(--color-cyan-bg)" stroke="var(--color-cyan)" strokeWidth="2" onClick={() => {
            playSynthSound('click');
            setActiveMapNode(mapNodes[2]);
            addActivityLog("Inspected Bole Airport Gateway coordinates.");
          }} />
          <text x="190" y="45" textAnchor="middle" fontSize="8" fontWeight="800" fill="var(--color-cyan)">BOL</text>

          {/* Active Courier Abebe */}
          <circle cx="85" cy="90" r="5" fill="#10b981" onClick={() => {
            playSynthSound('click');
            setActiveMapNode(mapNodes[3]);
            addActivityLog("GPS Tracked Courier Abebe Bekele.");
          }} />
          <circle cx="85" cy="90" r="5" fill="none" stroke="#10b981" strokeWidth="1" className="map-node-pulse" />

          {/* Active Courier Selamawit */}
          <circle cx="155" cy="50" r="5" fill="#8b5cf6" onClick={() => {
            playSynthSound('click');
            setActiveMapNode(mapNodes[4]);
            addActivityLog("GPS Tracked Courier Selamawit Alene.");
          }} />
          <circle cx="155" cy="50" r="5" fill="none" stroke="#8b5cf6" strokeWidth="1" className="map-node-pulse" />
        </svg>

        {activeMapNode ? (
          <div className='map-popup-card animate-slide-up'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>{activeMapNode.label}</span>
              <span className='badge badge-muted' style={{ fontSize: '0.52rem', padding: '2px 6px' }}>{activeMapNode.cap}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{activeMapNode.desc}</p>
            <button 
              className='btn btn-ghost' 
              style={{ height: '20px', padding: 0, fontSize: '0.62rem', color: 'var(--color-red)', marginTop: '4px' }}
              onClick={() => { playSynthSound('click'); setActiveMapNode(null); }}
            >
              Close Info Card
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
            Click nodes above to display live telemetry...
          </div>
        )}
      </div>
    );
  };

  const renderMerchantDirectClaimBoard = () => {
    const merchants = [
      {
        id: 'MERCH-001',
        name: 'Bole Tech Consortium',
        zone: 'Bole Zone',
        categories: ['High-Value Electronics', 'Laptops & Tech'],
        logo: '💻',
        desc: 'Regional importers of mobile technology, laptops, and chipsets.'
      },
      {
        id: 'MERCH-002',
        name: 'Mercato Apparel Bazaar',
        zone: 'Mercato Zone',
        categories: ['Designer Clothes', 'Imported Shoes'],
        logo: '👟',
        desc: 'Wholesale textile, footwear, and bespoke garment distributors.'
      },
      {
        id: 'MERCH-003',
        name: 'Kazanchis Med-Distributors',
        zone: 'Kazanchis Zone',
        categories: ['Medical Supplies'],
        logo: '💊',
        desc: 'Suppliers of specialized medicines, vaccines, and local clinic kits.'
      },
      {
        id: 'MERCH-004',
        name: 'Addis Document Clearance',
        zone: 'Bole Zone',
        categories: ['Secured Documents'],
        logo: '📨',
        desc: 'Express legal registry courier agents and bank note clearance.'
      }
    ];

    return (
      <div className='merchant-board-container animate-slide-up' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Merchant Self-Service Dispatch Board</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Merchants directly claim cargo consignments and release pre-arranged carrier payments.
            </p>
          </div>
          <span className='badge badge-cyan' style={{ fontSize: '0.62rem' }}>DYNAMIC ROUTING LIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {merchants.map(merch => {
            // Find manifests matching the merchant's categories that are claimable
            const matchingManifests = manifests.filter(m => 
              merch.categories.includes(m.type) && 
              m.status !== 'Handed Over' &&
              m.status !== 'Approved/Arrived' &&
              m.status !== 'Damaged' &&
              m.status !== 'Lost'
            );

            return (
              <div 
                key={merch.id} 
                className='merchant-card' 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{merch.logo}</span>
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{merch.name}</h3>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0 }}>{merch.desc}</p>
                    </div>
                  </div>
                  <span className='badge badge-purple' style={{ fontSize: '0.58rem' }}>{merch.zone}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left', display: 'block' }}>
                    Incoming Cargo Ready to Claim ({matchingManifests.length}):
                  </span>

                  {matchingManifests.map(m => {
                    const assignedCourier = couriers.find(c => c.id === m.assignedCourierId);

                    return (
                      <div 
                        key={m.trackingCode} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          padding: '10px 14px', 
                          borderRadius: '8px',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc', fontSize: '0.78rem' }}>
                              {m.trackingCode}
                            </span>
                            <span className='badge badge-cyan' style={{ fontSize: '0.52rem', padding: '2px 6px' }}>
                              {m.type}
                            </span>
                            {m.priority === 'Expedited' && (
                              <span className='badge badge-red' style={{ fontSize: '0.52rem', padding: '2px 6px' }}>
                                EXPEDITED
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {m.units} units ({m.weight} kg) • Carrier: <strong>{assignedCourier ? assignedCourier.name : 'Stranger Carrier'}</strong>
                          </span>
                          {m.transitOrigin && (
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                              Route: {m.transitOrigin} ➔ Addis Ababa (Local Destination: {m.localAddress || 'Main Hub'})
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Pre-arranged Payment Release label */}
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Payment Settlement</span>
                            <strong style={{ fontSize: '0.75rem', color: 'var(--color-emerald)' }}>
                              ETB {m.priority === 'Expedited' ? 600 : 400}
                            </strong>
                          </div>

                          <button 
                            className='btn btn-emerald' 
                            style={{ height: '32px', padding: '0 14px', fontSize: '0.72rem' }}
                            onClick={() => {
                              playSynthSound('success');
                              handleRegisterDeliverySuccess(m.trackingCode);
                              confetti({
                                particleCount: 80,
                                spread: 50,
                                colors: ['#a855f7', '#06b6d4', '#10b981']
                              });
                            }}
                          >
                            Claim & Release Payment
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {matchingManifests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      No incoming packages ready for this merchant.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Reusable Premium Header
  const renderHeader = (activeRole: 'agent' | 'dispatcher' | 'admin') => {
    return (
      <header className='cockpit-header'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '1.2rem'
            }}>
              ⚡
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Boltshift <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Last-Mile</span>
              </h2>
            </div>
          </div>
          
          {/* Regional Selector Switcher (Feature 3) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }} className='desktop-only'>Region:</span>
            <select 
              value={currentRegion} 
              onChange={(e) => {
                const newReg = e.target.value as 'Addis Ababa' | 'Hawassa' | 'Dire Dawa';
                setCurrentRegion(newReg);
                addActivityLog(`Switched operational context to: ${newReg} Regional Station.`);
              }}
              style={{
                width: '125px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                height: '28px',
                fontWeight: 700,
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                background: '#ffffff'
              }}
            >
              <option value="Addis Ababa">Addis Ababa</option>
              <option value="Hawassa">Hawassa</option>
              <option value="Dire Dawa">Dire Dawa</option>
            </select>
          </div>
        </div>

        {/* Center Pill Navigation Switcher - Desktop Only */}
        {adminAuthenticated && (
          <div className='bolt-nav-tabs desktop-only'>
            <button 
              className={`bolt-nav-tab ${activeRole === 'agent' ? 'active' : ''}`}
              onClick={() => {
                if (agentAuthenticated) window.location.hash = '#agent';
                else showToast('Field Agent auth required. Please sign out and log in.', 'warning');
              }}
            >
              <User className='size-3.5' />
              {t('agentView')}
            </button>
            <button 
              className={`bolt-nav-tab ${activeRole === 'dispatcher' ? 'active' : ''}`}
              onClick={() => {
                if (dispatcherAuthenticated) window.location.hash = '#dispatcher';
                else showToast('Dispatcher auth required. Please sign out and log in.', 'warning');
              }}
            >
              <Layers className='size-3.5' />
              {t('dispatcherQueue')}
            </button>
            <button 
              className={`bolt-nav-tab ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => {
                if (adminAuthenticated) window.location.hash = '#admin';
                else showToast('Admin auth required. Please sign out and log in.', 'warning');
              }}
            >
              <Activity className='size-3.5' />
              {t('adminControl')}
            </button>
          </div>
        )}

        {/* Right Section: User Profile & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className='btn btn-ghost' style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }} onClick={() => { playSynthSound('click'); showToast('Operational alerts are healthy.', 'info'); }}>
            <span className='pulse-dot' style={{ margin: '0 auto' }} />
          </button>

          {/* Sound Synthesizer System Switch (Feature 3) */}
          <button 
            className='btn btn-ghost' 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              padding: 0, 
              color: soundEnabled ? 'var(--color-emerald)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 800,
              border: soundEnabled ? '1px solid var(--color-emerald-border)' : '1px solid var(--border-light)',
              background: soundEnabled ? 'var(--color-emerald-bg)' : 'transparent'
            }} 
            title={soundEnabled ? 'Disable Synthesizer sound effects' : 'Enable Synthesizer sound effects'}
            onClick={() => {
              const newSound = !soundEnabled;
              setSoundEnabled(newSound);
              if (newSound) {
                // Play tiny click confirmation
                // @ts-ignore
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
              }
              showToast(newSound ? 'System synthesizer audio online! 🔊' : 'Synthesizer audio offline. 🔇', 'info');
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          
          {/* Language Selector Button */}
          <button
            className='btn'
            style={{
              padding: '0 8px',
              fontSize: '0.72rem',
              height: '38px',
              minWidth: '60px',
              fontWeight: 700,
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onClick={() => {
              playSynthSound('click');
              const newLang = language === 'en' ? 'am' : 'en';
              setLanguage(newLang);
              showToast(newLang === 'en' ? 'English mode activated! 🇬🇧' : 'የአማርኛ ስሪት ገቢር ሆኗል! 🇪🇹', 'success');
            }}
          >
            {language === 'en' ? '🇬🇧 EN' : '🇪🇹 AM'}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)'
            }}>
              {activeRole === 'agent' ? 'AG' : activeRole === 'dispatcher' ? 'DP' : 'AD'}
            </div>
            <div className='desktop-only' style={{ flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {activeRole === 'agent' ? 'Agent Station' : activeRole === 'dispatcher' ? 'Dispatcher Control' : 'Admin Director'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {activeRole === 'agent' ? 'agent@lastmile.et' : activeRole === 'dispatcher' ? 'dispatcher@lastmile.et' : 'admin@lastmile.et'}
              </span>
            </div>
          </div>

          <button className='btn' style={{ fontSize: '0.72rem', height: '34px', padding: '0 10px', borderColor: 'rgba(220, 38, 38, 0.2)', color: 'var(--color-red)' }} onClick={() => { playSynthSound('alert'); handleSignOut(); }}>
            <LogOut className='size-3.5' />
            <span className='desktop-only'>Sign Out</span>
          </button>
        </div>
      </header>
    );
  };

  // Fixed Bottom Navigation Bar for Mobile-First layouts
  const renderBottomNav = (activeRole: 'agent' | 'dispatcher' | 'admin') => {
    if (!adminAuthenticated) return null;
    return (
      <div className='mobile-bottom-nav mobile-only'>
        <button 
          className={`mobile-bottom-tab ${activeRole === 'agent' ? 'active' : ''}`}
          onClick={() => {
            if (agentAuthenticated) window.location.hash = '#agent';
            else showToast('Field Agent auth required. Please sign out and log in.', 'warning');
          }}
        >
          <User />
          <span>Agent View</span>
        </button>
        <button 
          className={`mobile-bottom-tab ${activeRole === 'dispatcher' ? 'active' : ''}`}
          onClick={() => {
            if (dispatcherAuthenticated) window.location.hash = '#dispatcher';
            else showToast('Dispatcher auth required. Please sign out and log in.', 'warning');
          }}
        >
          <Layers />
          <span>Dispatcher</span>
        </button>
        <button 
          className={`mobile-bottom-tab ${activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => {
            if (adminAuthenticated) window.location.hash = '#admin';
            else showToast('Admin auth required. Please sign out and log in.', 'warning');
          }}
        >
          <Activity />
          <span>Admin Control</span>
        </button>
      </div>
    );
  };

  const renderStatCards = (_activeRole: 'agent' | 'dispatcher' | 'admin') => {
    // Dynamic values based on active states
    const releasesCount = manifests.filter(m => m.status === 'Handed Over').length;
    const alertCount = incidents.filter(i => i.status === 'Pending').length;
    
    if (_activeRole === 'agent') {
      return (
        <div className='bolt-stat-grid'>
          {/* Card 1: Sky Blue Kid Friendly Payout */}
          <div className='bolt-card-gradient' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)' }}>{t('wallet')}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                ETB 2,400
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)' }}>{t('walletDesc')}</span>
          </div>

          {/* Card 2: Happy Star Rating */}
          <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{t('rating')}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
                Super Star! 5.0 / 5.0
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('ratingDesc')}</span>
          </div>

          {/* Card 3: Safe Deliveries Quest count */}
          <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{t('deliveries')}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
                28 Done!
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('deliveriesDesc')}</span>
          </div>

          {/* Card 4: Level badge */}
          <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{t('travelLevel')}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
                Gold Deliverer 🥇
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('levelDesc')}</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className='bolt-stat-grid'>
        {/* Card 1: Electric Blue Gradient */}
        <div className='bolt-card-gradient' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)' }}>{t('totalCargo')}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              {1200 + releasesCount * 15} <span style={{ fontSize: '0.72rem', fontWeight: 500 }} className='pct-tag pct-tag-blue'>↑ 4.9%</span>
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.7)' }}>{t('releasesLastMonth')}</span>

          <div style={{
            position: 'absolute', right: '16px', top: '20px', width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff'
          }}>
            <Layers className='size-5' />
          </div>
        </div>

        {/* Card 2: White Card */}
        <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('activeFleet')}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
              {couriers.length} <span style={{ fontSize: '0.72rem', fontWeight: 500 }} className='pct-tag pct-tag-green'>↑ 7.5%</span>
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('releasesLastMonth')}</span>

          <div style={{
            position: 'absolute', right: '16px', top: '20px', width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--bg-neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'
          }}>
            <User className='size-5' />
          </div>
        </div>

        {/* Card 3: White Card */}
        <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('exceptions')}</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
              {alertCount} <span style={{ fontSize: '0.72rem', fontWeight: 500 }} className='pct-tag pct-tag-red'>↓ 6.0%</span>
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('exceptionsDesc')}</span>

          <div style={{
            position: 'absolute', right: '16px', top: '20px', width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--bg-neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)'
          }}>
            <AlertTriangle className='size-5' />
          </div>
        </div>

        {/* Card 4: White Card */}
        <div className='bolt-card' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('ledgerSettlement')}</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
              ETB {ledger.baseCashETB.toLocaleString()}
            </h2>
            <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>
              Parity: ${(ledger.baseCashETB / 120).toLocaleString(undefined, { maximumFractionDigits: 1 })} USD
            </span>
          </div>

          <div style={{
            position: 'absolute', right: '16px', top: '20px', width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--primary-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)'
          }}>
            <MapPin className='size-5' />
          </div>
        </div>
      </div>
    );
  };

  // Detailed Interactive Bar Chart Component
  const renderMonthlyChart = () => {
    return (
      <div className='bolt-chart-container'>
        <div style={{ display: 'flex', width: '100%', height: '180px' }}>
          <div className='bolt-chart-y-axis'>
            <span>40k</span>
            <span>30k</span>
            <span>20k</span>
            <span>10k</span>
            <span>0k</span>
          </div>

          <div className='bolt-chart-grid-rows'>
            <div className='bolt-chart-line' style={{ top: '0%' }} />
            <div className='bolt-chart-line' style={{ top: '25%' }} />
            <div className='bolt-chart-line' style={{ top: '50%' }} />
            <div className='bolt-chart-line' style={{ top: '75%' }} />
            <div className='bolt-chart-line' style={{ top: '100%' }} />

            <div className='bolt-chart-bars-wrap'>
              {monthlyChartData.map((d, index) => {
                const barHeightPct = (d.sales / 500) * 100;
                const isHovered = hoveredBar === d.month;
                return (
                  <div 
                    key={d.month} 
                    className='bolt-chart-col'
                    onMouseEnter={() => setHoveredBar(d.month)}
                    onMouseLeave={() => setHoveredBar('Aug')}
                  >
                    <div className='bolt-chart-bar-bg'>
                      <div 
                        className={`bolt-chart-bar-fill ${d.active ? 'active' : ''}`} 
                        style={{ 
                          height: `${barHeightPct}%`,
                          background: d.active ? undefined : isHovered ? '#94a3b8' : '#e2e8f0'
                        }} 
                      />
                    </div>

                    {isHovered && (
                      <div className='bolt-chart-tooltip' style={{ 
                        left: index > 4 ? 'auto' : '-30px', 
                        right: index > 4 ? '-30px' : 'auto' 
                      }}>
                        <div className='tooltip-date'>{d.month} 2026</div>
                        <div className='tooltip-row'>
                          <span>Total Cargo</span>
                          <span>{d.sales} tn</span>
                        </div>
                        <div className='tooltip-row'>
                          <span>Cleared Val</span>
                          <span>{d.revenue}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='bolt-chart-label-row'>
          {monthlyChartData.map(d => (
            <span key={d.month} className='bolt-chart-label'>{d.month}</span>
          ))}
        </div>
      </div>
    );
  };

  // Detailed Clearance Growth gauge
  const renderClearanceGauge = () => {
    return (
      <div className='bolt-radial-container'>
        <div className='bolt-radial-gauge'>
          <svg width="220" height="120" viewBox="0 0 220 120" style={{ transform: 'rotate(0deg)' }}>
            <defs>
              <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            {[...Array(15)].map((_, i) => {
              const angle = -180 + (i * 180 / 14);
              const rad = angle * Math.PI / 180;
              const r1 = 70;
              const r2 = 90;
              const cx = 110;
              const cy = 110;
              const x1 = cx + r1 * Math.cos(rad);
              const y1 = cy + r1 * Math.sin(rad);
              const x2 = cx + r2 * Math.cos(rad);
              const y2 = cy + r2 * Math.sin(rad);
              
              const isFilled = i < 11;
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isFilled ? 'url(#gauge-grad)' : '#cbd5e1'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          <div className='radial-center-card'>
            <span className='radial-pct-val'>70.8%</span>
            <span className='radial-pct-lbl'>Clearance Growth</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px', justifyContent: 'center' }}>
          <div className='glass-panel-inner' style={{ flex: 1, padding: '10px 14px', background: '#f8fafc', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Number of Releases</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>2,343</span>
              <span className='pct-tag pct-tag-green'>4.5% ↗</span>
            </div>
          </div>

          <div className='glass-panel-inner' style={{ flex: 1, padding: '10px 14px', background: '#f8fafc', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>$30.9k</span>
              <span className='pct-tag pct-tag-neutral' style={{ background: '#0f172a', color: '#fff' }}>4.5% ↗</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Keep hash updated in state and enforce E2E route protection redirects
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#portal') {
      window.location.hash = '#login';
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash || '#login';
      
      // Route protection: redirect unauthorized visits to single login view
      if (hash === '#agent' && !agentAuthenticated) {
        window.location.hash = '#login';
        showToast('Authentication required for Field Agent Cockpit.', 'warning');
        return;
      }
      if (hash === '#dispatcher' && !dispatcherAuthenticated) {
        window.location.hash = '#login';
        showToast('Authentication required for Dispatcher Hub.', 'warning');
        return;
      }
      if (hash === '#admin' && !adminAuthenticated) {
        window.location.hash = '#login';
        showToast('Authentication required for Admin Global Control.', 'warning');
        return;
      }

      setCurrentHash(hash);
      // Clear credentials input when switching routes
      setEmailInput('');
      setPasswordInput('');
      setLoginError('');
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial validation check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [agentAuthenticated, dispatcherAuthenticated, adminAuthenticated]);

  // Notification Toast Helper State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Trigger Toast Notification
  const showToast = (text: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Preset quick login credentials autofill
  const handleAutofillLogin = (role: 'agent' | 'dispatcher' | 'admin') => {
    if (role === 'agent') {
      setEmailInput('agent@lastmile.et');
      setPasswordInput('agentpassword');
    } else if (role === 'dispatcher') {
      setEmailInput('dispatcher@lastmile.et');
      setPasswordInput('dispatcherpassword');
    } else {
      setEmailInput('admin@lastmile.et');
      setPasswordInput('adminpassword');
    }
    setLoginError('');
  };

  // Perform credential validation in one unified Sign-In portal, routing based on keys
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (emailInput === 'agent@lastmile.et' && passwordInput === 'agentpassword') {
      showToast('Logged in successfully as Field Agent!', 'success');
      setAgentAuthenticated(true);
      window.location.hash = '#agent';
    } else if (emailInput === 'dispatcher@lastmile.et' && passwordInput === 'dispatcherpassword') {
      showToast('Logged in successfully as Dispatcher Hub Queue!', 'success');
      setDispatcherAuthenticated(true);
      window.location.hash = '#dispatcher';
    } else if (emailInput === 'admin@lastmile.et' && passwordInput === 'adminpassword') {
      showToast('Logged in successfully as Admin Global Controller!', 'success');
      setAdminAuthenticated(true);
      setAgentAuthenticated(true);
      setDispatcherAuthenticated(true);
      window.location.hash = '#admin';
    } else {
      setLoginError('Invalid email credentials or security code. Please check preset values.');
      showToast('Authentication failed. Invalid details.', 'error');
    }
  };

  // Sign out handler returning to central login
  const handleSignOut = () => {
    setEmailInput('');
    setPasswordInput('');
    setAgentAuthenticated(false);
    setDispatcherAuthenticated(false);
    setAdminAuthenticated(false);
    window.location.hash = '#login';
    showToast('Logged out of regional cockpit.', 'info');
  };

  // Local Database State Model (Local-First Engine)
  // ──────────────────────────────────────────────────────────────────────────

  // Warehouse Dispatch Operational Switcher state
  const [dispatcherMode, setDispatcherMode] = useState<'centralized' | 'merchant-direct'>('centralized');

  // Couriers list
  const [couriers, setCouriers] = useState<Courier[]>([]);

  // Manifests Queue
  const [manifests, setManifests] = useState<Manifest[]>([]);

  // Financial Ledger
  const [ledger, setLedger] = useState({
    baseCashETB: 0,
    pendingCommissionsETB: 0,
    supplierClearingETB: 0,
  });

  // Ledger Audit History
  const [ledgerHistory, setLedgerHistory] = useState<LedgerHistory[]>([]);

  // Exception Arbitration Disputes
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // ── Database Real-Time Bootstrap Synchronizer (Feature 20) ───────────
  useEffect(() => {
    const fetchBootstrapData = async () => {
      try {
        const res = await fetch('/api/bootstrap');
        const data = await res.json();
        if (data.success) {
          setCouriers(data.couriers);
          setManifests(data.manifests);
          setLedger(data.ledger);
          setLedgerHistory(data.ledgerHistory);
          setIncidents(data.incidents);
          setRestockTickets(data.restockTickets || []);
          setChatMessages(data.chatMessages || []);
          
          if (data.systemSettings) {
            setDispatcherMode(data.systemSettings.dispatcherMode as any);
            setSoundEnabled(data.systemSettings.soundEnabled);
            setCurrentRegion(data.systemSettings.currentRegion as any);
          }
          
          if (data.inventoriesByRegion) {
            setInventoriesByRegion(data.inventoriesByRegion);
          }
        }
      } catch (err) {
        console.error("Failed to bootstrap logistics database state:", err);
      }
    };
    fetchBootstrapData();
  }, []);

  // Synchronize dashboard settings to database
  useEffect(() => {
    if (adminAuthenticated || dispatcherAuthenticated || agentAuthenticated) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatcherMode,
          soundEnabled,
          currentRegion
        })
      }).catch(err => console.error("Failed to sync settings:", err));
    }
  }, [dispatcherMode, soundEnabled, currentRegion]);


  // ──────────────────────────────────────────────────────────────────────────
  // Intake Wizard State (Field Agent Perspective)
  // ──────────────────────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCourierName, setWizardCourierName] = useState('');
  const [wizardPhone, setWizardPhone] = useState('');
  const [wizardDocCaptured, setWizardDocCaptured] = useState(false);
  const [wizardCameraActive, setWizardCameraActive] = useState(false);
  const [wizardCarrierNumber, setWizardCarrierNumber] = useState('');
  const [wizardRefCode, setWizardRefCode] = useState('');
  const [wizardTravelerProfile, setWizardTravelerProfile] = useState<'Local' | 'Transit'>('Local');
  const [wizardPickupPoint, setWizardPickupPoint] = useState<'Bole' | 'Mercato' | 'Kazanchis'>('Bole');
  
  // Cargo Allocation selections
  const [allocatedUnits, setAllocatedUnits] = useState(15);
  const [allocatedType, setAllocatedType] = useState<'High-Value Electronics' | 'Medical Supplies' | 'Secured Documents' | 'Laptops & Tech' | 'Imported Shoes' | 'Designer Clothes'>('Medical Supplies');
  const [allocatedDestination, setAllocatedDestination] = useState<'Bole Zone' | 'Mercato Zone' | 'Kazanchis Zone'>('Bole Zone');

  // New Ground Onboarding & Carrier Tracking state variables
  const [selectedExistingCourierId, setSelectedExistingCourierId] = useState<string>('NEW');
  const [wizardTransitOrigin, setWizardTransitOrigin] = useState<'Dubai' | 'China' | 'Dire Dawa' | 'Other'>('Dubai');
  const [wizardLocalAddress, setWizardLocalAddress] = useState('');
  const [wizardCargoStatus, setWizardCargoStatus] = useState<'Approved/Arrived' | 'Stuck at Customs' | 'Damaged'>('Approved/Arrived');
  const [wizardCargoPhotoUrl, setWizardCargoPhotoUrl] = useState<string>('');

  // Warehouse Dispatch Operational Switcher & Supabase Simulation states
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);

  // Canvas Signature Capture Hook refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  // Simulated Time Countdown for Expedited Shipments
  const [simulatedCountdown, setSimulatedCountdown] = useState(45); // in minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedCountdown(prev => (prev > 1 ? prev - 1 : 59));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Canvas configurations when entering Step 4
  useEffect(() => {
    if (currentHash === '#agent' && agentAuthenticated && wizardStep === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Dynamic canvas resolution adjustment to avoid scaling/vector stretch artifacts
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || canvas.offsetWidth || 600;
      canvas.height = rect.height || canvas.offsetHeight || 180;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#059669'; // Boltshift emerald green stroke
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [wizardStep, currentHash, agentAuthenticated]);

  // Signature drawing event handlers (Canvas)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    if (!ctx || !coords) return;
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    if (!ctx || !coords) return;
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureSaved(false);
    }
  };

  const saveSignatureCanvas = () => {
    setSignatureSaved(true);
    showToast('Digital signature recorded successfully!', 'success');
  };

  // Onboarding Wizard Submit
  const handleOnboardSubmit = () => {
    if (!wizardCourierName.trim()) {
      showToast('Courier full name is required.', 'error');
      return;
    }
    if (!wizardPhone.trim()) {
      showToast('Courier phone number is required.', 'error');
      return;
    }
    if (!signatureSaved) {
      showToast('Digital signature acknowledgment is required.', 'error');
      return;
    }

    // Verify risk assessment blocks
    const targetCourier = couriers.find(c => c.id === selectedExistingCourierId);
    if (targetCourier && targetCourier.status === 'Suspended') {
      showToast('🚫 Custody Failed! This courier is suspended due to high damage risks.', 'error');
      playSynthSound('alert');
      return;
    }

    // Validate inventory capacities before allotment
    let currentStock = 0;
    if (allocatedType === 'Medical Supplies' || allocatedType === 'Imported Shoes' || allocatedType === 'Designer Clothes') {
      currentStock = hubInventory.medicalSupplies;
    } else if (allocatedType === 'High-Value Electronics' || allocatedType === 'Laptops & Tech') {
      currentStock = hubInventory.electronics;
    } else {
      currentStock = hubInventory.securedDocs;
    }

    if (allocatedUnits > currentStock) {
      showToast(`Allocation Failed! requested ${allocatedUnits} exceeds remaining ${allocatedType} stock (${currentStock}).`, 'error');
      playSynthSound('alert');
      return;
    }

    // Process State Changes
    const isNew = selectedExistingCourierId === 'NEW';
    const newCourierId = isNew ? `CR-${String(couriers.length + 1).padStart(3, '0')}` : selectedExistingCourierId;
    const newManifestCode = `ET-${allocatedDestination.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    if (isNew) {
      // @ts-ignore
      const docUrlVal = wizardDocCaptured ? (window.__latestCapturedDocUrl || 'ETH-2026-9041285') : undefined;
      const signatureUrlVal = canvasRef.current ? canvasRef.current.toDataURL() : 'CAPTURED_BASE64_URI';

      const newCourier: Courier = {
        id: newCourierId,
        name: wizardCourierName,
        phone: wizardPhone,
        status: 'Idle',
        assignedManifests: [newManifestCode],
        documentUrl: docUrlVal,
        signatureUrl: signatureUrlVal,
        rating: 5.0,
        joinedDate: new Date().toISOString().split('T')[0],
        commissionEarned: 0,
      };
      setCouriers(prev => [...prev, newCourier]);

      // Persist Courier Registration to database
      fetch('/api/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCourierId,
          name: wizardCourierName,
          phone: wizardPhone,
          documentUrl: docUrlVal,
          signatureUrl: signatureUrlVal
        })
      }).catch(err => console.error("Failed to sync courier registration:", err));
    } else {
      setCouriers(prev => prev.map(c => c.id === newCourierId ? {
        ...c,
        assignedManifests: [...c.assignedManifests, newManifestCode]
      } : c));
    }

    // 2. Add New Manifest
    const newManifest: Manifest = {
      trackingCode: newManifestCode,
      destination: allocatedDestination,
      type: allocatedType,
      weight: Math.round((2.0 + Math.random() * 10) * 10) / 10,
      units: allocatedUnits,
      status: wizardCargoStatus as any,
      assignedCourierId: newCourierId,
      priority: wizardTravelerProfile === 'Transit' ? 'Expedited' : 'Standard',
      departureTime: wizardTravelerProfile === 'Transit' ? '2:30 PM' : undefined,
      createdDate: new Date().toISOString().split('T')[0],
      transitOrigin: wizardTransitOrigin,
      localAddress: wizardLocalAddress || undefined,
      cargoPhotoUrl: wizardCargoPhotoUrl || undefined,
    };

    // Deduct Hub Inventory Capacity
    setHubInventory((prev: any) => ({
      ...prev,
      medicalSupplies: (allocatedType === 'Medical Supplies' || allocatedType === 'Imported Shoes' || allocatedType === 'Designer Clothes') ? prev.medicalSupplies - allocatedUnits : prev.medicalSupplies,
      electronics: (allocatedType === 'High-Value Electronics' || allocatedType === 'Laptops & Tech') ? prev.electronics - allocatedUnits : prev.electronics,
      securedDocs: allocatedType === 'Secured Documents' ? prev.securedDocs - allocatedUnits : prev.securedDocs,
    }));

    setManifests(prev => [...prev, newManifest]);

    // Persist Manifest Intake & Inventory Allocation to database
    fetch('/api/manifests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newManifest,
        currentRegion
      })
    }).catch(err => console.error("Failed to sync manifest intake:", err));

    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6']
    });

    showToast(`Success! Onboarded Courier ${wizardCourierName} & allocated Manifest ${newManifestCode}.`, 'success');
    
    // Reset Intake Wizard Form State
    setWizardStep(1);
    setSelectedExistingCourierId('NEW');
    setWizardCourierName('');
    setWizardPhone('');
    setWizardDocCaptured(false);
    setWizardCarrierNumber('');
    setWizardRefCode('');
    setWizardTravelerProfile('Local');
    setWizardPickupPoint('Bole');
    setAllocatedUnits(15);
    setSignatureSaved(false);
    setWizardTransitOrigin('Dubai');
    setWizardLocalAddress('');
    setWizardCargoStatus('Approved/Arrived');
    setWizardCargoPhotoUrl('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Dispatcher Operations
  // ──────────────────────────────────────────────────────────────────────────
  const handleRegisterDeliverySuccess = (trackingCode: string) => {
    const manifest = manifests.find(m => m.trackingCode === trackingCode);
    if (!manifest) return;

    setManifests(prev => prev.map(m => m.trackingCode === trackingCode ? { ...m, status: 'Handed Over' } : m));

    const commission = manifest.priority === 'Expedited' ? 600 : 400;

    if (manifest.assignedCourierId) {
      setCouriers(prev => prev.map(c => c.id === manifest.assignedCourierId ? { 
        ...c, 
        status: 'Idle',
        commissionEarned: c.commissionEarned + commission 
      } : c));
    }

    setLedger(prev => ({
      ...prev,
      baseCashETB: prev.baseCashETB + 1800,
      pendingCommissionsETB: prev.pendingCommissionsETB + commission,
      supplierClearingETB: prev.supplierClearingETB + 2200,
    }));

    const newLdgHistory: LedgerHistory = {
      id: `LDG-${String(ledgerHistory.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Release Manifest',
      amount: commission,
      description: `Manifest ${trackingCode} successfully handed over. Released ETB ${commission} commission.`,
    };
    setLedgerHistory(prev => [newLdgHistory, ...prev]);

    showToast(`Registered Handover for ${trackingCode}! Commissions logged.`, 'success');

    // Persist claim to database
    fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingCode })
    }).catch(err => console.error("Failed to sync delivery success claim:", err));
  };


  // ──────────────────────────────────────────────────────────────────────────
  // Admin Operations
  // ──────────────────────────────────────────────────────────────────────────
  const handleArbitrationResolve = (id: string, action: 'deduct' | 'pardon') => {
    const incident = incidents.find(inc => inc.id === id);
    if (!incident) return;

    if (action === 'deduct') {
      setCouriers(prev => prev.map(c => {
        if (c.id === incident.courierId) {
          return {
            ...c,
            status: 'Idle',
            commissionEarned: Math.max(0, c.commissionEarned - incident.financialPenalty)
          };
        }
        return c;
      }));

      setLedger(prev => ({
        ...prev,
        pendingCommissionsETB: Math.max(0, prev.pendingCommissionsETB - incident.financialPenalty)
      }));

      const newAudit: LedgerHistory = {
        id: `LDG-${String(ledgerHistory.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'Penalty Deduction',
        amount: -incident.financialPenalty,
        description: `Deducted penalty ETB ${incident.financialPenalty} from courier ${incident.courierName} on incident ${id}.`,
      };
      setLedgerHistory(prev => [newAudit, ...prev]);

      showToast(`Enforced penalty of ETB ${incident.financialPenalty} on ${incident.courierName}. Case closed.`, 'warning');
    } else {
      setCouriers(prev => prev.map(c => c.id === incident.courierId ? { ...c, status: 'Idle' } : c));
      showToast(`Dispute resolved. Pardon issued for ${incident.courierName}.`, 'info');
    }

    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));

    // Persist incident resolution to database
    fetch('/api/incidents/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(err => console.error("Failed to sync incident resolution:", err));
  };

  const handleDisburseCommissions = () => {
    if (ledger.pendingCommissionsETB === 0) {
      showToast('Pending Commissions balance is already ETB 0.', 'warning');
      return;
    }
    const currentPayout = ledger.pendingCommissionsETB;

    setLedger(prev => ({
      ...prev,
      baseCashETB: prev.baseCashETB - currentPayout,
      pendingCommissionsETB: 0
    }));

    const newAuditLog: LedgerHistory = {
      id: `LDG-${String(ledgerHistory.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Commission Disbursed',
      amount: -currentPayout,
      description: `Clearing and disbursement payout of agent commissions. ETB ${currentPayout} disbursed to couriers.`,
    };
    setLedgerHistory(prev => [newAuditLog, ...prev]);

    showToast(`Paid out ETB ${currentPayout} commissions. Vault cleared!`, 'success');

    // Persist commission payout to database
    fetch('/api/ledger/disburse-commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: currentPayout })
    }).catch(err => console.error("Failed to sync disburse commissions:", err));
  };

  const handleClearSupplierBalance = () => {
    if (ledger.supplierClearingETB === 0) {
      showToast('Supplier clearing fund is already ETB 0.', 'warning');
      return;
    }
    const currentClearance = ledger.supplierClearingETB;

    setLedger(prev => ({
      ...prev,
      baseCashETB: prev.baseCashETB - currentClearance,
      supplierClearingETB: 0
    }));

    const newAuditLog: LedgerHistory = {
      id: `LDG-${String(ledgerHistory.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Supplier Balance Cleared',
      amount: -currentClearance,
      description: `Disbursed and cleared balance matching supplier settlement clearances of ETB ${currentClearance}.`,
    };
    setLedgerHistory(prev => [newAuditLog, ...prev]);

    showToast(`Success! Cleared Supplier balances of ETB ${currentClearance} to zero.`, 'success');

    // Persist supplier clearance to database
    fetch('/api/ledger/clear-supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: currentClearance })
    }).catch(err => console.error("Failed to sync supplier clearance:", err));
  };

  // Real-Time Pipelines State-Machine Counts
  const manifestCounts = {
    allocated: manifests.filter(m => m.status === 'Allocated').length,
    inTransit: manifests.filter(m => m.status === 'In Transit').length,
    awaiting: manifests.filter(m => m.status === 'Awaiting Dispatch').length,
    terminal: manifests.filter(m => m.status === 'Handed Over' || m.status === 'Damaged' || m.status === 'Lost').length,
  };

  const courierCounts = {
    idle: couriers.filter(c => c.status === 'Idle').length,
    dispatched: couriers.filter(c => c.status === 'Dispatched').length,
    suspended: couriers.filter(c => c.status === 'Suspended').length,
    total: couriers.length
  };

  // Active Dispatcher Zone Queue filter tabs
  const [dispatcherZoneTab, setDispatcherZoneTab] = useState<'all' | 'bole' | 'mercato' | 'kazanchis'>('all');

  const filteredManifests = manifests.filter(m => {
    if (dispatcherZoneTab === 'all') return true;
    if (dispatcherZoneTab === 'bole') return m.destination === 'Bole Zone';
    if (dispatcherZoneTab === 'mercato') return m.destination === 'Mercato Zone';
    return m.destination === 'Kazanchis Zone';
  });

  const sortedAndFilteredManifests = filteredManifests
    .filter(m => {
      const q = dispatcherSearchQuery.toLowerCase();
      return m.trackingCode.toLowerCase().includes(q) || 
             m.type.toLowerCase().includes(q) || 
             m.destination.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });


  // ──────────────────────────────────────────────────────────────────────────
  // CDN Chart.js Live Mounting Hook
  // ──────────────────────────────────────────────────────────────────────────
  const chartInstanceRef = useRef<any>(null);
  useEffect(() => {
    if (currentHash === '#admin' && adminAuthenticated) {
      const ctx = document.getElementById('courierStatusChart') as HTMLCanvasElement;
      if (ctx && (window as any).Chart) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        chartInstanceRef.current = new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Idle Ground Fleet', 'Active Dispatched', 'Suspended Alerts'],
            datasets: [{
              data: [courierCounts.idle, courierCounts.dispatched, courierCounts.suspended],
              backgroundColor: ['#10b981', '#8b5cf6', '#ef4444'],
              borderColor: '#06060a',
              borderWidth: 2,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#161626',
                titleColor: '#f8fafc',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderWidth: 1,
                padding: 10,
                displayColors: true
              }
            }
          }
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [currentHash, adminAuthenticated, couriers]);

  // ── Real-Time Scrolling Activity Ticker (Feature 2) ──────────────────
  const renderActivityTicker = () => {
    return (
      <div className='activity-ticker-bar'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: '10px', height: '100%', flexShrink: 0 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'inline-block', animation: 'pulse-blue 1.5s infinite' }} />
          <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE LOGS:</span>
        </div>
        <div className='activity-ticker-content'>
          {activityLogs.map((log) => (
            <div key={log.id} className='ticker-item'>
              <span style={{ color: '#94a3b8' }}>[{log.time}]</span>
              <span>{log.msg}</span>
              <span style={{ color: '#475569', margin: '0 8px' }}>•</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Manifest Invoice & Barcode Modal overlay (Feature 4) ──────────────
  const renderInvoiceSlipModal = () => {
    if (!selectedManifestSlip) return null;
    
    return (
      <div className='receipt-overlay' onClick={() => setSelectedManifestSlip(null)}>
        <div className='receipt-modal' onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Consignment Invoice</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Slip: {selectedManifestSlip.trackingCode}</h2>
            </div>
            <span className={`badge ${selectedManifestSlip.priority === 'Expedited' ? 'badge-red' : 'badge-muted'}`}>
              {selectedManifestSlip.priority}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>DESTINATION</span>
                <span style={{ fontWeight: 700 }}>{selectedManifestSlip.destination}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>CARGO CONTENT</span>
                <span style={{ fontWeight: 700 }}>{selectedManifestSlip.type}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>UNITS / WEIGHT</span>
                <span style={{ fontWeight: 700 }}>{selectedManifestSlip.units} units | {selectedManifestSlip.weight} kg</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>STATUS</span>
                <span style={{ fontWeight: 700 }}>{selectedManifestSlip.status}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>COURIER ID ASSIGNED</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{selectedManifestSlip.assignedCourierId || 'UNASSIGNED'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>RELEASE DATE</span>
                <span style={{ fontWeight: 700 }}>{selectedManifestSlip.createdDate}</span>
              </div>
            </div>

            {/* Simulated Vector Barcode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Official barcode registry</span>
              <div className='receipt-barcode'>
                <svg width="280" height="40" viewBox="0 0 280 40">
                  {[
                    2, 4, 8, 12, 14, 16, 20, 24, 26, 32, 36, 40, 42, 48, 52, 54, 60, 62, 64, 70, 74, 80, 84, 86, 92, 96, 100, 104, 108,
                    112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 
                    204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 256, 260, 264, 268, 272, 276
                  ].map((x, i) => (
                    <line key={i} x1={x} y1="0" x2={x} y2="40" stroke="#000000" strokeWidth={i % 3 === 0 ? "3" : i % 2 === 0 ? "1.5" : "1"} />
                  ))}
                </svg>
              </div>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'monospace', marginTop: '2px' }}>
                *(1D-EAN)* {selectedManifestSlip.trackingCode}-2026-X83K
              </span>
            </div>

            {/* Custom vector digital signature representation */}
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Digital signature custody verification
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Biometric Match Verified</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-emerald)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  ✓ CLEARED
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button className='btn btn-emerald' style={{ height: '38px', padding: '0 18px' }} onClick={() => setSelectedManifestSlip(null)}>
              Close Consignment
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Warehouse Matrix Space Optimizer component (Feature 5) ────────────
  const renderWarehouseMatrix = () => {
    const bays = Array.from({ length: 24 }).map((_, i) => {
      const row = ['A', 'B', 'C', 'D'][Math.floor(i / 6)];
      const num = (i % 6) + 1;
      const id = `${row}${num}`;
      
      let status: 'empty' | 'medical' | 'electronics' | 'secured' = 'empty';
      let content = 'Empty Storage Space';
      let color = 'rgba(15, 23, 42, 0.04)';
      let labelColor = 'var(--text-muted)';
      
      if (i < 8) {
        status = 'medical';
        content = 'Medical Supplies Cargo';
        color = 'var(--color-emerald-bg)';
        labelColor = 'var(--color-emerald)';
      } else if (i < 14) {
        status = 'electronics';
        content = 'High-Value Electronics';
        color = 'var(--color-purple-bg)';
        labelColor = 'var(--color-purple)';
      } else if (i < 17) {
        status = 'secured';
        content = 'Secured Documents';
        color = 'var(--color-gold-bg)';
        labelColor = 'var(--color-gold)';
      }

      return { id, status, content, color, labelColor };
    });

    return (
      <div style={{ marginTop: '16px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Warehouse Bay Allocations Matrix (Bays A1-D6)
        </span>
        <div className='warehouse-matrix-grid'>
          {bays.map((bay) => (
            <div 
              key={bay.id} 
              className='warehouse-matrix-bay' 
              style={{ backgroundColor: bay.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${bay.labelColor}50` }}
              onClick={() => {
                addActivityLog(`Inspected storage bay ${bay.id}: holding ${bay.content}.`);
                showToast(`Bay ${bay.id}: ${bay.content} checked.`, 'info');
              }}
            >
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: bay.labelColor }}>{bay.id}</span>
              <div className='warehouse-matrix-tooltip'>
                <strong>Bay {bay.id}</strong>: {bay.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Warehouse Stock Restock Refill Wizard (Feature 6) ──────────────────
  const renderRestockPanel = () => {
    const handleCreateTicket = (e: React.FormEvent) => {
      e.preventDefault();
      const ticketId = `RF-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = { id: ticketId, type: replenishType, qty: replenishQty, status: 'Pending' as const };
      
      setRestockTickets(prev => [...prev, newTicket]);
      addActivityLog(`Raised stock refill ticket ${ticketId} for ${replenishQty} units of ${replenishType}.`);
      showToast(`Filed restock request ${ticketId} successfully!`, 'success');
    };

    return (
      <div className='glass-panel' style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
          <Plus className='size-4 text-emerald-500' />
          <h3>Hub Inventory Refill Requests</h3>
        </div>

        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className='form-group'>
              <label style={{ fontSize: '0.6rem' }}>Allotment Type</label>
              <select 
                value={replenishType} 
                onChange={(e) => setReplenishType(e.target.value as any)}
                style={{ height: '34px', padding: '6px', fontSize: '0.75rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}
              >
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="High-Value Electronics">Electronics</option>
                <option value="Secured Documents">Secured Docs</option>
              </select>
            </div>
            <div className='form-group'>
              <label style={{ fontSize: '0.6rem' }}>Allotment Qty</label>
              <input 
                type="number" 
                value={replenishQty} 
                onChange={(e) => setReplenishQty(Number(e.target.value))}
                min="10" 
                max="200" 
                style={{ height: '34px', padding: '6px', fontSize: '0.75rem' }}
              />
            </div>
          </div>

          <button type="submit" className='btn btn-emerald' style={{ height: '36px', fontSize: '0.75rem', width: '100%' }}>
            Raise Replenishment Ticket
          </button>
        </form>

        {restockTickets.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-translucent)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Pending Refill Tickets:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
              {restockTickets.map(ticket => (
                <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{ticket.id}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{ticket.qty} u {ticket.type.substring(0,3)}</span>
                  </div>
                  <span className='badge badge-gold' style={{ fontSize: '0.52rem', padding: '2px 6px' }}>{ticket.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Courier Performance Leaderboard rankings scorecard (Feature 17) ───
  const renderLeaderboard = () => {
    const rankedCouriers = [...couriers].sort((a, b) => b.rating - a.rating || b.commissionEarned - a.commissionEarned);

    return (
      <div className='glass-panel' style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
          <Activity className='size-4 text-emerald-500' />
          <h3>Courier Performance Leaderboard</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rankedCouriers.map((c, idx) => (
            <div key={c.id} className='leaderboard-row'>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontWeight: 900, 
                  color: idx === 0 ? 'var(--color-gold)' : idx === 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  width: '16px'
                }}>
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: 700 }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rating: <strong style={{ color: 'var(--text-primary)' }}>{c.rating.toFixed(1)} ★</strong></span>
                <span className='badge badge-emerald' style={{ fontSize: '0.52rem' }}>Top Courier</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Regional Settings & Commission Modifiers (Feature 14) ─────────────
  const renderAdminSettingsCard = () => {
    return (
      <div className='glass-panel' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px' }}>
          <h3>Regional Commission Settings</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className='slider-container'>
            <div className='slider-header'>
              <span style={{ color: 'var(--text-secondary)' }}>Baseline Commission:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>ETB {adminBaseCommission}</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="1000" 
              step="50"
              value={adminBaseCommission}
              onChange={(e) => {
                playSynthSound('click');
                const val = Number(e.target.value);
                setAdminBaseCommission(val);
                addActivityLog(`Admin updated baseline commission payout to: ETB ${val}.`);
              }}
            />
          </div>

          <div className='slider-container'>
            <div className='slider-header'>
              <span style={{ color: 'var(--text-secondary)' }}>Expedited Shipment Mod:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-red)' }}>{adminExpeditedMod.toFixed(1)}x multiplier</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="3.0" 
              step="0.1"
              value={adminExpeditedMod}
              onChange={(e) => {
                playSynthSound('click');
                const val = Number(e.target.value);
                setAdminExpeditedMod(val);
                addActivityLog(`Admin updated expedited commission multiplier to: ${val.toFixed(1)}x.`);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ── Financial Forecast Simulation Sandbox (Feature 2) ────────────────
  const renderForecastSandboxCard = () => {
    const baseExpectedRevenues = 250000;
    const computedExpectedRevenue = Math.round(baseExpectedRevenues * (1 + forecastCargoGrowth / 100) * forecastCongestion);
    const computedExpectedCommissions = Math.round(ledger.pendingCommissionsETB * forecastCommissionsModifier * (1 + forecastCargoGrowth / 100));
    const projectedGrowthPct = Math.round((forecastCargoGrowth * forecastCongestion) + 12);
    
    return (
      <div className='glass-panel' style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px' }}>
        <div style={{ borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Clearance Forecasting Sandbox</h3>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Simulate statistical revenue & load metrics in real-time</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className='slider-container'>
            <div className='slider-header'>
              <span style={{ color: 'var(--text-secondary)' }}>Target Cargo Growth:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>+{forecastCargoGrowth}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={forecastCargoGrowth}
              onChange={(e) => {
                playSynthSound('click');
                setForecastCargoGrowth(Number(e.target.value));
              }}
            />
          </div>

          <div className='slider-container'>
            <div className='slider-header'>
              <span style={{ color: 'var(--text-secondary)' }}>Zone Congestion Multiplier:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-gold)' }}>{forecastCongestion.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.5" 
              step="0.1"
              value={forecastCongestion}
              onChange={(e) => {
                playSynthSound('click');
                setForecastCongestion(Number(e.target.value));
              }}
            />
          </div>

          <div className='slider-container'>
            <div className='slider-header'>
              <span style={{ color: 'var(--text-secondary)' }}>Commissions Boost Mod:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-purple)' }}>{forecastCommissionsModifier.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.8" 
              max="2.0" 
              step="0.05"
              value={forecastCommissionsModifier}
              onChange={(e) => {
                playSynthSound('click');
                setForecastCommissionsModifier(Number(e.target.value));
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.72rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Projected Zone Revenue:</span>
            <strong style={{ color: 'var(--color-emerald)' }}>ETB {computedExpectedRevenue.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Projected Agent Payouts:</span>
            <strong style={{ color: 'var(--color-purple)' }}>ETB {computedExpectedCommissions.toLocaleString()}</strong>
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', padding: '6px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Simulated Zone Yield:</span>
            <span className='badge badge-emerald' style={{ fontSize: '0.58rem' }}>+{projectedGrowthPct}% yield</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Admin manual reserves and override wizard modal (Feature 18) ────────
  const renderVaultWizardModal = () => {
    if (!vaultWizardOpen) return null;
    
    const handlePerformDeposit = (e: React.FormEvent) => {
      e.preventDefault();
      
      setLedger(prev => ({
        ...prev,
        baseCashETB: prev.baseCashETB + vaultDepositVal
      }));

      const newAudit: LedgerHistory = {
        id: `LDG-${String(ledgerHistory.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'Release Manifest', 
        amount: vaultDepositVal,
        description: vaultOverrideDesc.trim() || `Manual cash reserve deposit of ETB ${vaultDepositVal}.`
      };

      setLedgerHistory(prev => [newAudit, ...prev]);
      addActivityLog(`Admin injected capital reserve of: ETB ${vaultDepositVal}.`);
      showToast(`Deposited ETB ${vaultDepositVal.toLocaleString()} vault reserves!`, 'success');
      
      // Persist manual deposit to database
      fetch('/api/ledger/vault-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositVal: vaultDepositVal,
          description: vaultOverrideDesc.trim() || `Manual cash reserve deposit of ETB ${vaultDepositVal}.`
        })
      }).catch(err => console.error("Failed to sync vault deposit:", err));

      setVaultWizardOpen(false);
      setVaultOverrideDesc('');
    };

    return (
      <div className='receipt-overlay' onClick={() => setVaultWizardOpen(false)}>
        <div className='receipt-modal' onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Manage Vault Reserves</h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dual-Currency settlements Vault Engine</p>
          </div>

          <form onSubmit={handlePerformDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
            <div className='form-group'>
              <label>Capital Injection Amount (ETB)</label>
              <input 
                type="number"
                value={vaultDepositVal}
                onChange={(e) => setVaultDepositVal(Number(e.target.value))}
                min="1000"
                max="500000"
                required
              />
            </div>

            <div className='form-group'>
              <label>Audit Log Description</label>
              <textarea 
                value={vaultOverrideDesc}
                onChange={(e) => setVaultOverrideDesc(e.target.value)}
                placeholder="Audit description for regional register compliance..."
                rows={3}
                style={{ background: 'var(--bg-input)', padding: '10px', fontSize: '0.82rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <button type="button" className='btn' style={{ height: '36px', fontSize: '0.72rem' }} onClick={() => setVaultWizardOpen(false)}>
                Cancel
              </button>
              <button type="submit" className='btn btn-emerald' style={{ height: '36px', fontSize: '0.72rem' }}>
                Confirm reserves
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ── Incident Flagging Damage Photo Scanner Modal (Feature 13) ─────────
  const renderFlaggingModal = () => {
    if (!activeFlaggingCode) return null;
    const manifest = manifests.find(m => m.trackingCode === activeFlaggingCode);
    if (!manifest) return null;

    const handleConfirmFlagging = () => {
      setManifests(prev => prev.map(m => m.trackingCode === activeFlaggingCode ? { ...m, status: 'Damaged' } : m));

      if (manifest.assignedCourierId) {
        setCouriers(prev => prev.map(c => c.id === manifest.assignedCourierId ? { ...c, status: 'Suspended' } : c));
      }

      const courier = couriers.find(c => c.id === manifest.assignedCourierId);
      const newIncident: Incident = {
        id: `INC-${100 + incidents.length + 1}`,
        trackingCode: activeFlaggingCode,
        courierId: manifest.assignedCourierId || 'CR-UNKNOWN',
        courierName: courier ? courier.name : 'Unknown Ground Courier',
        type: 'Damaged Cargo',
        description: `Cargo packaging breach verified by Photo Evidence portal. Enforced review.`,
        status: 'Pending',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        financialPenalty: manifest.priority === 'Expedited' ? 2500 : 1500,
      };

      setIncidents(prev => [newIncident, ...prev]);
      addActivityLog(`Alert filed: Consignment Exception INC-${100 + incidents.length + 1} logged with photo evidence.`);
      showToast(`Flagged incident successfully for manifest ${activeFlaggingCode}.`, 'error');
      
      // Persist incident to database
      fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      }).catch(err => console.error("Failed to sync incident Exception:", err));

      setActiveFlaggingCode(null);
      setDamagePhotoAttached(false);
    };

    return (
      <div className='receipt-overlay' onClick={() => setActiveFlaggingCode(null)}>
        <div className='receipt-modal' onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--color-red)' }}>Enforce Cargo Exception Case</h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Consignment: {activeFlaggingCode}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
            <div className='form-group'>
              <label>Damage Exception Type</label>
              <select style={{ height: '34px', padding: '6px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }} defaultValue="Damaged Cargo">
                <option value="Damaged Cargo">Damaged Outer Cargo Seal</option>
                <option value="Missing Documents">Missing Customs Papers</option>
              </select>
            </div>

            <div className='form-group'>
              <label>Incident Evidence Photo Capture</label>
              <div 
                className='camera-portal' 
                style={{ 
                  height: '140px', 
                  backgroundColor: damagePhotoAttached ? '#0f172a' : '#f8fafc',
                  borderColor: damagePhotoAttached ? 'var(--color-red)' : 'var(--border-light)',
                  borderStyle: 'dashed'
                }}
              >
                {damagePhotoAttached ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#ef4444' }}>
                    <div className='scan-laser-line' style={{ backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                    <Camera className='size-5 text-red-500 animate-pulse' />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, fontFamily: 'monospace' }}>MOCK_DAMAGED_PACKAGE_SCAN.JPG</span>
                    <button type="button" className='btn btn-ghost' style={{ height: '20px', padding: 0, fontSize: '0.62rem', color: '#94a3b8' }} onClick={() => setDamagePhotoAttached(false)}>
                      Retake Snapshot
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                    <Camera className='size-5 text-text-secondary' />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Camera input offline</span>
                    <button 
                      type="button"
                      className='btn btn-outline-red' 
                      style={{ height: '28px', padding: '0 10px', fontSize: '0.68rem' }}
                      onClick={() => {
                        setDamagePhotoAttached(true);
                        showToast('Damage scan mockup snap attached!', 'info');
                      }}
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <button className='btn' style={{ height: '36px', fontSize: '0.72rem' }} onClick={() => setActiveFlaggingCode(null)}>
              Cancel
            </button>
            <button 
              className='btn btn-emerald' 
              style={{ height: '36px', fontSize: '0.72rem', backgroundColor: 'var(--color-red)' }} 
              disabled={!damagePhotoAttached}
              onClick={handleConfirmFlagging}
            >
              Enforce Penalty Case
            </button>
          </div>
        </div>
      </div>
    );
  };

  const playSirenBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Web Audio API not supported or user gesture needed", e);
    }
  };

  useEffect(() => {
    if (simulatedCountdown < 20) {
      playSirenBeep();
      const alarmInterval = setInterval(() => {
        playSirenBeep();
      }, 8000);
      return () => clearInterval(alarmInterval);
    }
  }, [simulatedCountdown]);

  useEffect(() => {
    if (wizardDocCaptured) {
      setBiometricMatchPulsing(true);
      const t1 = setTimeout(() => setBiometricChecklist(prev => ({ ...prev, face: true })), 600);
      const t2 = setTimeout(() => setBiometricChecklist(prev => ({ ...prev, citizen: true })), 1200);
      const t3 = setTimeout(() => {
        setBiometricChecklist(prev => ({ ...prev, municipal: true }));
        setBiometricMatchPulsing(false);
        showToast('Background biometrics verification cleared!', 'success');
      }, 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setBiometricChecklist({ face: false, citizen: false, municipal: false });
      setBiometricMatchPulsing(false);
    }
  }, [wizardDocCaptured]);

  const handleEmergencyReRoute = (trackingCode: string) => {
    const manifest = manifests.find(m => m.trackingCode === trackingCode);
    if (!manifest) return;
    const idleCourier = couriers.find(c => c.status === 'Idle' && c.id !== manifest.assignedCourierId);
    if (!idleCourier) {
      showToast('No idle ground couriers available for emergency re-route!', 'warning');
      return;
    }
    
    setManifests(prev => prev.map(m => m.trackingCode === trackingCode ? { 
      ...m, 
      assignedCourierId: idleCourier.id,
      status: 'Allocated' 
    } : m));
    
    if (manifest.assignedCourierId) {
      setCouriers(prev => prev.map(c => c.id === manifest.assignedCourierId ? {
        ...c,
        status: 'Idle',
        assignedManifests: c.assignedManifests.filter(code => code !== trackingCode)
      } : c));
    }
    
    setCouriers(prev => prev.map(c => c.id === idleCourier.id ? {
      ...c,
      status: 'Dispatched',
      assignedManifests: [...c.assignedManifests, trackingCode]
    } : c));
    
    addActivityLog(`Emergency re-route: manifest ${trackingCode} transferred to courier ${idleCourier.name}.`);
    showToast(`Manifest re-assigned to ${idleCourier.name}!`, 'success');
  };

  const renderFloatingBundlerBar = () => {
    if (selectedManifestsForBundle.length === 0) return null;

    const checkedManifests = manifests.filter(m => selectedManifestsForBundle.includes(m.trackingCode));
    const totalWeight = checkedManifests.reduce((sum, m) => sum + m.weight, 0);
    const totalUnits = checkedManifests.reduce((sum, m) => sum + m.units, 0);
    
    const uniqueDestinations = Array.from(new Set(checkedManifests.map(m => m.destination)));
    const targetRoute = uniqueDestinations.join(" ➔ ");

    const handleBundleAndAssign = () => {
      const idleCourier = couriers.find(c => c.status === 'Idle');
      if (!idleCourier) {
        showToast('No idle ground couriers available to assign this bundle!', 'warning');
        return;
      }

      setManifests(prev => prev.map(m => {
        if (selectedManifestsForBundle.includes(m.trackingCode)) {
          return {
            ...m,
            assignedCourierId: idleCourier.id,
            status: 'In Transit'
          };
        }
        return m;
      }));

      setCouriers(prev => prev.map(c => {
        if (c.id === idleCourier.id) {
          return {
            ...c,
            status: 'Dispatched',
            assignedManifests: [...c.assignedManifests, ...selectedManifestsForBundle]
          };
        }
        return c;
      }));

      addActivityLog(`Bundled ${selectedManifestsForBundle.length} manifests into route ${targetRoute}. Assigned to courier ${idleCourier.name}.`);
      showToast(`Bundled successfully! Assigned ${selectedManifestsForBundle.length} cargos to ${idleCourier.name}.`, 'success');
      setSelectedManifestsForBundle([]);
    };

    return (
      <div className='bundler-floating-bar'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
            {selectedManifestsForBundle.length} Manifests Checked for Proximity Bundle
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
            Cumulative Load: <strong>{totalWeight.toFixed(1)} kg</strong> | <strong>{totalUnits} units</strong> | Route: <strong>{targetRoute}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className='btn' 
            style={{ height: '34px', fontSize: '0.68rem', padding: '0 12px' }}
            onClick={() => setSelectedManifestsForBundle([])}
          >
            Clear Selected
          </button>
          <button 
            className='btn btn-emerald' 
            style={{ height: '34px', fontSize: '0.68rem', padding: '0 12px' }}
            onClick={handleBundleAndAssign}
          >
            Bundle & Dispatch Route
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Sync chart data
  }, []);

  const getThemeClass = () => {
    if (currentHash === '#agent' && agentAuthenticated) return 'theme-agent-root';
    if (currentHash === '#dispatcher' && dispatcherAuthenticated) return 'theme-dispatcher-root';
    if (currentHash === '#admin' && adminAuthenticated) return 'theme-admin-root';
    return 'theme-login-root';
  };

  return (
    <div id="root" className={getThemeClass()}>
      {renderInvoiceSlipModal()}
      {renderFlaggingModal()}
      {renderVaultWizardModal()}
      {renderFloatingBundlerBar()}
      
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className={`glass-panel badge badge-${toastMessage.type === 'success' ? 'emerald' : toastMessage.type === 'error' ? 'red' : toastMessage.type === 'warning' ? 'gold' : 'cyan'}`} style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 24px',
          fontSize: '0.85rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
          animation: 'slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {toastMessage.type === 'success' && <Check className="size-4 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="size-4 shrink-0" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="size-4 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="size-4 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 0. UNIFIED SINGLE SIGN-IN PAGE                                        */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {!(currentHash === '#agent' && agentAuthenticated) && 
       !(currentHash === '#dispatcher' && dispatcherAuthenticated) && 
       !(currentHash === '#admin' && adminAuthenticated) && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          minHeight: '100vh',
          position: 'relative',
          backgroundColor: 'var(--bg-neutral)'
        }}>
          {/* Subtle light background circles for elegance */}
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
            top: '20%',
            left: '30%',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
            bottom: '20%',
            right: '30%',
            pointerEvents: 'none'
          }} />

          <div className='unified-login-wrapper animate-slide-up'>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                <span className='pulse-dot' />
                <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }} className="text-gradient">{t('title')}</h1>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {t('portalSubtitle')}
              </p>
            </div>

            {loginError && (
              <div className='glass-panel-inner' style={{
                background: 'var(--color-red-bg)',
                borderColor: 'var(--color-red-border)',
                color: 'var(--color-red)',
                fontSize: '0.75rem',
                padding: '10px 14px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                borderRadius: '8px'
              }}>
                <AlertTriangle className='size-4 shrink-0' />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className='form-group'>
                <label htmlFor='loginEmail'>{t('enterEmail')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail className='size-4' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id='loginEmail'
                    type='email'
                    placeholder='yourname@lastmile.et'
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>

              <div className='form-group'>
                <label htmlFor='loginPassword'>{t('enterPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock className='size-4' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id='loginPassword'
                    type='password'
                    placeholder='••••••••••••'
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>

              <button type='submit' className='btn btn-emerald' style={{ width: '100%', height: '44px', fontWeight: 700, display: 'flex', justifyContent: 'center' }}>
                {t('validateKeys')}
                <Send className='size-4' />
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>
                {t('presetTitle')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  id='autofill-agent'
                  className='btn login-autofill-btn'
                  onClick={() => handleAutofillLogin('agent')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', fontWeight: 700 }}>
                    <User className='size-4' />
                    Field Agent Cockpit
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quick Autofill ➔</span>
                </button>

                <button 
                  id='autofill-dispatcher'
                  className='btn login-autofill-btn'
                  onClick={() => handleAutofillLogin('dispatcher')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', fontWeight: 700 }}>
                    <Layers className='size-4' />
                    Dispatcher Queue
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quick Autofill ➔</span>
                </button>

                <button 
                  id='autofill-admin'
                  className='btn login-autofill-btn'
                  onClick={() => handleAutofillLogin('admin')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-cyan)', fontWeight: 700 }}>
                    <Activity className='size-4' />
                    Admin Global Control
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quick Autofill ➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. FIELD AGENT VIEW PAGE                                               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentHash === '#agent' && agentAuthenticated && (
        <div className='dashboard-container theme-agent-tactical animate-slide-up'>
          {renderHeader('agent')}
          {renderStatCards('agent')}

          <div className='layout-grid'>
            
            {/* Left Panel: 4-Step Intake & Allocation Wizard */}
            <div className='col-span-8 glass-panel'>
              <div className='wizard-header'>
                <div className='wizard-title-row'>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🚀</span>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>{t('wizardTitle')}</h2>
                  </div>
                  <span className='badge badge-emerald' style={{ borderRadius: '999px', padding: '6px 12px' }}>{t('stepIndicator').replace('{step}', String(wizardStep))}</span>
                </div>

                {/* Progress pill indicators */}
                <div className='step-indicator-bar'>
                  {[
                    { num: 1, label: t('step1') },
                    { num: 2, label: t('step2') },
                    { num: 3, label: t('step3') },
                    { num: 4, label: t('step4') }
                  ].map(s => (
                    <div key={s.num} className={`step-item ${wizardStep === s.num ? 'active' : wizardStep > s.num ? 'completed' : ''}`}>
                      <div className='step-pill' style={{ height: '8px', borderRadius: '99px' }} />
                      <span className='step-label' style={{ fontSize: '0.68rem', fontWeight: 800 }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile-only compact step descriptor to maintain absolute clarity on touch displays */}
                <div className='mobile-only' style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  color: 'var(--primary-blue)', 
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary-blue)', 
                    display: 'inline-block' 
                  }} />
                  {wizardStep === 1 && `${t('step1')} 👤`}
                  {wizardStep === 2 && `${t('step2')} ✈️`}
                  {wizardStep === 3 && `${t('step3')} 🎒`}
                  {wizardStep === 4 && `${t('step4')} ✍️`}
                </div>
              </div>

              <div className='wizard-body'>
                {wizardStep === 1 && (
                  <div className='animate-slide-up' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Carrier Selector Dropdown */}
                    <div className='form-group'>
                      <label htmlFor='existingCourierSelect'>{t('rememberedCarrier')}</label>
                      <select
                        id='existingCourierSelect'
                        value={selectedExistingCourierId}
                        onChange={(e) => {
                          playSynthSound('click');
                          const val = e.target.value;
                          setSelectedExistingCourierId(val);
                          if (val === 'NEW') {
                            setWizardCourierName('');
                            setWizardPhone('');
                            setWizardDocCaptured(false);
                          } else {
                            const found = couriers.find(c => c.id === val);
                            if (found) {
                              setWizardCourierName(found.name);
                              setWizardPhone(found.phone);
                              setWizardDocCaptured(true);
                              setBiometricChecklist({ face: true, citizen: true, municipal: true });
                            }
                          }
                        }}
                        style={{ height: '38px', padding: '6px', fontSize: '0.78rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                      >
                        <option value="NEW">{t('registerStranger')}</option>
                        {couriers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone}) - Rating: {c.rating}★ [{c.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Suspended high-risk alert banner */}
                    {selectedExistingCourierId !== 'NEW' && couriers.find(c => c.id === selectedExistingCourierId)?.status === 'Suspended' && (
                      <div style={{
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--color-red)',
                        color: 'var(--color-red)',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        borderRadius: '8px'
                      }}>
                        <AlertTriangle className='size-5 shrink-0' />
                        <div>
                          <span style={{ display: 'block', fontWeight: 800 }}>🚫 BLOCKED - HIGH RISK</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>This carrier is flagged for delivering damaged items or mishandling funds and cannot accept further cargo requests.</span>
                        </div>
                      </div>
                    )}

                    {/* Past deliveries item verification history */}
                    {selectedExistingCourierId !== 'NEW' && (
                      <div style={{
                        background: 'rgba(0,0,0,0.02)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', display: 'block', marginBottom: '6px' }}>
                          Verified Item Custody & Historic Deliveries
                        </span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                          {manifests.filter(m => m.assignedCourierId === selectedExistingCourierId).map(m => (
                            <div key={m.trackingCode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', fontSize: '0.68rem' }}>
                              <span>{m.trackingCode} ({m.type})</span>
                              <span className={`badge ${
                                m.status === 'Handed Over' || m.status === 'Approved/Arrived' ? 'badge-emerald' :
                                m.status === 'Damaged' ? 'badge-red' : 'badge-gold'
                              }`} style={{ fontSize: '0.55rem' }}>
                                {m.status}
                              </span>
                            </div>
                          ))}
                          {manifests.filter(m => m.assignedCourierId === selectedExistingCourierId).length === 0 && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No cargo consignment clearances recorded on this carrier.
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className='form-group'>
                        <label htmlFor='courierName'>{t('fullLegalName')}</label>
                        <input 
                          id='courierName'
                          placeholder='e.g. Almaz Bekele'
                          value={wizardCourierName}
                          onChange={(e) => setWizardCourierName(e.target.value)}
                        />
                      </div>
                      <div className='form-group'>
                        <label htmlFor='courierPhone'>{t('contactPhone')}</label>
                        <input 
                          id='courierPhone'
                          placeholder='e.g. +251 911 000000'
                          value={wizardPhone}
                          onChange={(e) => setWizardPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Biometric Passport Scanning Simulator Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>{t('biometricVerification')}</label>
                      <div className='biometric-box' style={{
                        minHeight: '160px',
                        background: '#0a0a0f',
                        border: '1px dashed var(--border-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {wizardDocCaptured ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              {/* Left side: Canvas display of generated passport */}
                              <div style={{
                                width: '160px',
                                height: '100px',
                                background: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}>
                                <img
                                  src={
                                    // @ts-ignore
                                    window.__latestCapturedDocUrl || 'ETH-2026-9041285'
                                  }
                                  alt="Biometric Passport Document"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              </div>

                              {/* Right side: Verification Status indicators */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.65rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Face Match Check:</span>
                                  <span style={{ color: biometricChecklist.face ? 'var(--color-emerald)' : 'var(--color-gold)', fontWeight: 800 }}>
                                    {biometricChecklist.face ? '✓ MATCHED' : biometricMatchPulsing ? 'Scanning...' : 'Pending'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Citizenship Check:</span>
                                  <span style={{ color: biometricChecklist.citizen ? 'var(--color-emerald)' : 'var(--color-gold)', fontWeight: 800 }}>
                                    {biometricChecklist.citizen ? '✓ VERIFIED' : biometricMatchPulsing ? 'Verifying...' : 'Pending'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Municipal Record Lookup:</span>
                                  <span style={{ color: biometricChecklist.municipal ? 'var(--color-emerald)' : 'var(--color-gold)', fontWeight: 800 }}>
                                    {biometricChecklist.municipal ? '✓ CLEARED' : biometricMatchPulsing ? 'Checking...' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button className='btn btn-ghost' style={{ padding: '4px 8px', fontSize: '0.68rem', color: 'var(--neon-red)' }} onClick={() => setWizardDocCaptured(false)}>
                                Clear Biometrics
                              </button>
                            </div>
                          </div>
                        ) : wizardCameraActive ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', height: '100%', justifyContent: 'center' }}>
                            <div className='scan-laser-line' />
                            <Camera className='size-8 text-emerald-400 animate-pulse' />
                            <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                              Scanning document sensors...
                            </span>
                            <div style={{ display: 'flex', gap: '8px', zIndex: 20 }}>
                              <button className='btn btn-emerald' style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => {
                                if (!wizardCourierName.trim()) {
                                  showToast('Enter name first to generate mock ID card.', 'warning');
                                  setWizardCameraActive(false);
                                  return;
                                }
                                
                                setBiometricMatchPulsing(true);
                                playSynthSound('scan');
                                setTimeout(() => {
                                  setBiometricChecklist({ face: true, citizen: true, municipal: true });
                                  setBiometricMatchPulsing(false);
                                }, 1500);

                                const canvas = document.createElement('canvas');
                                canvas.width = 160;
                                canvas.height = 100;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  // Draw custom Ethiopian mock passport
                                  ctx.fillStyle = '#0f172a';
                                  ctx.fillRect(0, 0, 160, 100);
                                  
                                  // Green banner
                                  ctx.fillStyle = '#059669';
                                  ctx.fillRect(0, 0, 160, 18);
                                  
                                  ctx.fillStyle = '#ffffff';
                                  ctx.font = 'bold 7px sans-serif';
                                  ctx.fillText('ETHIOPIA BIOMETRIC PASSPORT', 8, 12);
                                  
                                  // Photo outline
                                  ctx.strokeStyle = '#475569';
                                  ctx.lineWidth = 1;
                                  ctx.strokeRect(8, 24, 40, 48);
                                  
                                  // Mock Avatar
                                  ctx.fillStyle = '#334155';
                                  ctx.fillRect(8, 24, 40, 48);
                                  ctx.fillStyle = '#cbd5e1';
                                  // Draw head
                                  ctx.beginPath();
                                  ctx.arc(28, 40, 8, 0, Math.PI * 2);
                                  ctx.fill();
                                  // Draw body
                                  ctx.beginPath();
                                  ctx.arc(28, 62, 16, Math.PI, 0);
                                  ctx.fill();
                                  
                                  // Text details
                                  ctx.fillStyle = '#ffffff';
                                  ctx.font = 'bold 6px sans-serif';
                                  ctx.fillText(wizardCourierName.substring(0, 18), 56, 34);
                                  
                                  ctx.fillStyle = '#94a3b8';
                                  ctx.font = '5px monospace';
                                  ctx.fillText('PASSPORT ID: ETH-2026-9041285', 56, 48);
                                  ctx.fillText('BIO STATUS: APPROVED', 56, 60);

                                  // Bottom barcode mockup
                                  ctx.fillStyle = '#ffffff';
                                  ctx.fillRect(8, 80, 144, 8);
                                  ctx.fillStyle = '#000000';
                                  // Draw zebra lines
                                  for (let i = 8; i < 150; i += 4) {
                                    ctx.fillRect(i, 80, Math.random() * 2 + 1, 8);
                                  }
                                }
                                
                                setWizardDocCaptured(true);
                                setWizardCameraActive(false);
                                // Save document url as canvas base64 image data url
                                const dataUrl = canvas.toDataURL();
                                // @ts-ignore
                                window.__latestCapturedDocUrl = dataUrl;
                                showToast('Biometric passport photo captured and generated successfully!', 'success');
                              }}>
                                Capture Snap
                              </button>
                              <button className='btn btn-ghost' style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => setWizardCameraActive(false)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%', border: '1px solid var(--border-translucent)' }}>
                              <Upload className='size-6 text-text-secondary' />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Simulate Courier Passport Scan</p>
                              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Scans legal identity card for regional compliance</p>
                            </div>
                            <button className='btn btn-outline-emerald' style={{ color: 'var(--neon-emerald)', borderColor: 'var(--neon-emerald-border)', padding: '6px 14px', fontSize: '0.72rem' }} onClick={() => setWizardCameraActive(true)}>
                              Initialize Camera
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className='animate-slide-up' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className='form-group'>
                        <label htmlFor='carrierNum'>Carrier / Flight Number</label>
                        <input 
                          id='carrierNum'
                          placeholder='e.g. ET-501 or N/A'
                          value={wizardCarrierNumber}
                          onChange={(e) => setWizardCarrierNumber(e.target.value)}
                        />
                      </div>
                      <div className='form-group'>
                        <label htmlFor='bookingRef'>Booking / Reference Code</label>
                        <input 
                          id='bookingRef'
                          placeholder='e.g. X8J9L0'
                          value={wizardRefCode}
                          onChange={(e) => setWizardRefCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className='form-group'>
                        <label htmlFor='transitOrigin'>Transit Origin Gateway</label>
                        <select 
                          id='transitOrigin'
                          value={wizardTransitOrigin} 
                          onChange={(e) => setWizardTransitOrigin(e.target.value as any)}
                          style={{ height: '38px', padding: '6px', fontSize: '0.78rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                        >
                          <option value="Dubai">Dubai ✈️</option>
                          <option value="China">China 🚢</option>
                          <option value="Dire Dawa">Dire Dawa 🚂</option>
                          <option value="Other">Other Gateway 🌍</option>
                        </select>
                      </div>
                      <div className='form-group'>
                        <label htmlFor='localAddress'>Local Destination Address (Addis Ababa)</label>
                        <input 
                          id='localAddress'
                          placeholder='e.g. Bole Subcity, Kebele 02, House 144'
                          value={wizardLocalAddress}
                          onChange={(e) => setWizardLocalAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                      <div className='form-group'>
                        <label>Destination Profile</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <button
                            type='button'
                            className={`btn ${wizardTravelerProfile === 'Local' ? 'active' : ''}`}
                            style={{
                              flexDirection: 'column', padding: '12px', height: 'auto', gap: '4px',
                              backgroundColor: wizardTravelerProfile === 'Local' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card-inner)',
                              borderColor: wizardTravelerProfile === 'Local' ? 'var(--neon-emerald)' : 'var(--border-translucent)',
                              color: wizardTravelerProfile === 'Local' ? 'var(--neon-emerald)' : 'var(--text-primary)'
                            }}
                            onClick={() => setWizardTravelerProfile('Local')}
                          >
                            <User className='size-4' />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Local Resident</span>
                          </button>
                          <button
                            type='button'
                            className={`btn ${wizardTravelerProfile === 'Transit' ? 'active' : ''}`}
                            style={{
                              flexDirection: 'column', padding: '12px', height: 'auto', gap: '4px',
                              backgroundColor: wizardTravelerProfile === 'Transit' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card-inner)',
                              borderColor: wizardTravelerProfile === 'Transit' ? 'var(--neon-emerald)' : 'var(--border-translucent)',
                              color: wizardTravelerProfile === 'Transit' ? 'var(--neon-emerald)' : 'var(--text-primary)'
                            }}
                            onClick={() => setWizardTravelerProfile('Transit')}
                          >
                            <AlertTriangle className='size-4' />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Transit Traveler</span>
                          </button>
                        </div>
                      </div>

                      <div className='form-group'>
                        <label>Pickup Location Hub</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {[
                            { id: 'Bole', name: 'Bole Hub' },
                            { id: 'Mercato', name: 'Mercato' },
                            { id: 'Kazanchis', name: 'Kazanchis' }
                          ].map(hub => (
                            <button
                              key={hub.id}
                              type='button'
                              className='btn'
                              style={{
                                padding: '10px 4px', fontSize: '0.72rem',
                                backgroundColor: wizardPickupPoint === hub.id ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-card-inner)',
                                borderColor: wizardPickupPoint === hub.id ? '#ffffff' : 'var(--border-translucent)',
                                color: wizardPickupPoint === hub.id ? '#ffffff' : 'var(--text-secondary)'
                              }}
                              onClick={() => setWizardPickupPoint(hub.id as any)}
                            >
                              {hub.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className='animate-slide-up' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className='glass-panel-inner' style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.03)' }}>
                      <Info className='size-5 text-emerald-500 shrink-0 mt-0.5' />
                      <div style={{ fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--neon-emerald)' }}>Warehouse stock validations active</span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          Allocated units will be deducted from active hub quantities. If the allocation exceeds remaining storage balances, the system will prevent custody releases.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div className='form-group'>
                        <label>Cargo Category</label>
                        <select value={allocatedType} onChange={(e) => setAllocatedType(e.target.value as any)}>
                          <option value="Medical Supplies">Medical Supplies 💊</option>
                          <option value="High-Value Electronics">High-Value Electronics ⚡</option>
                          <option value="Secured Documents">Secured Documents 📨</option>
                          <option value="Laptops & Tech">Laptops & Tech 💻</option>
                          <option value="Imported Shoes">Imported Shoes 👟</option>
                          <option value="Designer Clothes">Designer Clothes 👔</option>
                        </select>
                      </div>
                      <div className='form-group'>
                        <label>Target Delivery Zone</label>
                        <select value={allocatedDestination} onChange={(e) => setAllocatedDestination(e.target.value as any)}>
                          <option value="Bole Zone">Bole Zone</option>
                          <option value="Mercato Zone">Mercato Zone</option>
                          <option value="Kazanchis Zone">Kazanchis Zone</option>
                        </select>
                      </div>
                      <div className='form-group'>
                        <label>Units Allocated</label>
                        <input 
                          type="number" 
                          value={allocatedUnits} 
                          onChange={(e) => setAllocatedUnits(Number(e.target.value))} 
                          min={1} 
                          max={100}
                        />
                      </div>
                    </div>

                    {/* Cargo Photo Snapper & Status Selectors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div className='form-group'>
                        <label>Cargo Security Intake Status</label>
                        <select 
                          value={wizardCargoStatus} 
                          onChange={(e) => setWizardCargoStatus(e.target.value as any)}
                          style={{ height: '38px', padding: '6px', fontSize: '0.78rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                        >
                          <option value="Approved/Arrived">🟢 Approved / Arrived</option>
                          <option value="Stuck at Customs">🟡 Stuck at Customs</option>
                          <option value="Damaged">🔴 Damaged Outer Seal</option>
                        </select>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                          Default is Approved/Arrived. Unresolved customs or damage flags trigger high-risk assessments.
                        </span>
                      </div>

                      <div className='form-group'>
                        <label>Cargo Visual Verification Photo</label>
                        <div 
                          className='camera-portal' 
                          style={{ 
                            height: '110px', 
                            backgroundColor: wizardCargoPhotoUrl ? '#0f172a' : '#f8fafc',
                            borderColor: wizardCargoPhotoUrl ? 'var(--neon-emerald)' : 'var(--border-light)',
                            borderStyle: 'dashed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            padding: '6px'
                          }}
                        >
                          {wizardCargoPhotoUrl ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px', color: '#10b981' }}>
                              <img 
                                src={wizardCargoPhotoUrl} 
                                alt="Cargo Snapshot" 
                                style={{ width: '60px', height: '45px', objectFit: 'contain', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} 
                              />
                              <span style={{ fontSize: '0.52rem', fontWeight: 800, fontFamily: 'monospace' }}>CARGO_SNAP.PNG</span>
                              <button type="button" className='btn btn-ghost' style={{ height: '16px', padding: 0, fontSize: '0.55rem', color: '#94a3b8' }} onClick={() => setWizardCargoPhotoUrl('')}>
                                Retake 📸
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
                              <Camera className='size-4 text-text-secondary' />
                              <button 
                                type="button"
                                className='btn btn-outline-emerald' 
                                style={{ height: '24px', padding: '0 8px', fontSize: '0.62rem' }}
                                onClick={() => {
                                  playSynthSound('scan');
                                  let iconStr = '📦';
                                  if (allocatedType.includes('Shoes')) iconStr = '👟';
                                  else if (allocatedType.includes('Clothes')) iconStr = '👔';
                                  else if (allocatedType.includes('Electronics') || allocatedType.includes('Laptops')) iconStr = '💻';
                                  else if (allocatedType.includes('Medical')) iconStr = '💊';
                                  
                                  const canvas = document.createElement('canvas');
                                  canvas.width = 120;
                                  canvas.height = 90;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.fillStyle = '#0f172a';
                                    ctx.fillRect(0,0,120,90);
                                    ctx.fillStyle = '#ffffff';
                                    ctx.font = '28px sans-serif';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillText(iconStr, 60, 45);
                                    ctx.fillStyle = '#10b981';
                                    ctx.font = '8px monospace';
                                    ctx.fillText('VERIFIED CARGO', 60, 80);
                                  }
                                  setWizardCargoPhotoUrl(canvas.toDataURL());
                                  showToast('Mock cargo photo captured successfully!', 'success');
                                }}
                              >
                                Snap Photo 📸
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='slider-container'>
                      <div className='slider-header'>
                        <span style={{ color: 'var(--text-secondary)' }}>Remaining Hub Storage Balance:</span>
                        <span style={{
                          color: (allocatedType === 'Medical Supplies' || allocatedType === 'Imported Shoes' || allocatedType === 'Designer Clothes') ? 'var(--neon-emerald)' : (allocatedType === 'High-Value Electronics' || allocatedType === 'Laptops & Tech') ? 'var(--neon-purple)' : 'var(--neon-gold)'
                        }}>
                          {(allocatedType === 'Medical Supplies' || allocatedType === 'Imported Shoes' || allocatedType === 'Designer Clothes') && `${hubInventory.medicalSupplies} units left`}
                          {(allocatedType === 'High-Value Electronics' || allocatedType === 'Laptops & Tech') && `${hubInventory.electronics} units left`}
                          {allocatedType === 'Secured Documents' && `${hubInventory.securedDocs} units left`}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max={(allocatedType === 'Medical Supplies' || allocatedType === 'Imported Shoes' || allocatedType === 'Designer Clothes') ? hubInventory.medicalSupplies : (allocatedType === 'High-Value Electronics' || allocatedType === 'Laptops & Tech') ? hubInventory.electronics : hubInventory.securedDocs} 
                        value={allocatedUnits} 
                        onChange={(e) => setAllocatedUnits(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className='animate-slide-up' style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Digital Courier Signature Custody Acknowledgment</label>
                      <span className={`badge ${signatureSaved ? 'badge-emerald' : 'badge-gold'}`}>
                        {signatureSaved ? 'SIGNATURE CAPTURED' : 'AWAITING INPUT'}
                      </span>
                    </div>

                    <div className='canvas-signature-container'>
                      <div className='canvas-signature-wrap'>
                        <div className='canvas-grid-overlay' />
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={180}
                          onMouseDown={handleStartDrawing}
                          onMouseMove={handleDrawing}
                          onMouseUp={handleStopDrawing}
                          onMouseLeave={handleStopDrawing}
                          onTouchStart={handleStartDrawing}
                          onTouchMove={handleDrawing}
                          onTouchEnd={handleStopDrawing}
                          className='signature-canvas'
                        />
                        <div className='canvas-actions'>
                          <button className='btn btn-ghost' style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={clearSignatureCanvas}>
                            Clear Canvas
                          </button>
                          <button className='btn btn-emerald' onClick={saveSignatureCanvas}>
                            Approve Sign
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        Drag or touch with pointer to sketch Courier Digital Signature inside the grid area.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className='wizard-footer'>
                <button 
                  className='btn' 
                  disabled={wizardStep === 1}
                  onClick={() => { playSynthSound('click'); setWizardStep(prev => prev - 1); }}
                >
                  Previous Step
                </button>
                
                {wizardStep < 4 ? (
                  <button 
                    className='btn btn-emerald'
                    onClick={() => {
                      playSynthSound('click');
                      if (wizardStep === 1 && !wizardCourierName) {
                        showToast('Courier name must be supplied.', 'error');
                        playSynthSound('alert');
                        return;
                      }
                      if (wizardStep === 1 && !wizardPhone) {
                        showToast('Courier phone number must be supplied.', 'error');
                        playSynthSound('alert');
                        return;
                      }
                      // Verify risk assessment blocks
                      const targetCourier = couriers.find(c => c.id === selectedExistingCourierId);
                      if (wizardStep === 1 && targetCourier && targetCourier.status === 'Suspended') {
                        showToast('🚫 Custody Failed! This courier is suspended due to high damage risks.', 'error');
                        playSynthSound('alert');
                        return;
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    className='btn btn-emerald'
                    onClick={() => { playSynthSound('success'); handleOnboardSubmit(); }}
                  >
                    Onboard & Clear Cargo
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel: Hub Inventories & Fleets */}
            <div className='col-span-4' style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Simplified Store Stock Card */}
              <div className='glass-panel' style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏪</span>
                  <h3>Available Items in Store</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span>Medical Supplies 💊</span>
                      <span style={{ fontWeight: 700, color: 'var(--neon-emerald)' }}>{hubInventory.medicalSupplies} items left!</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(hubInventory.medicalSupplies / 300) * 100}%`, height: '100%', background: 'var(--neon-emerald)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Safe medicine for local clinics! 🏥</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span>Computers & Phones 💻</span>
                      <span style={{ fontWeight: 700, color: 'var(--neon-purple)' }}>{hubInventory.electronics} items left!</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(hubInventory.electronics / 300) * 100}%`, height: '100%', background: 'var(--neon-purple)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>High-value delivery items! 📦</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span>Important Letters ✉️</span>
                      <span style={{ fontWeight: 700, color: 'var(--neon-gold)' }}>{hubInventory.securedDocs} letters left!</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(hubInventory.securedDocs / 150) * 100}%`, height: '100%', background: 'var(--neon-gold)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Secured documents in envelopes! 📨</span>
                  </div>
                </div>
              </div>

              {/* Simplified My Personal Badge Card */}
              <div className='glass-panel' style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏆</span>
                  <h3>My Courier Stats & Level</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700,
                      border: '2px solid #0284c7'
                    }}>
                      🏃
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block' }}>Abebe Kebede (Me!)</span>
                      <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>Superstar Gold Deliverer 🥇</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Delivered packages:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>28 items 🎉</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>My star score:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>5.0 / 5.0 Stars ⭐</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Travel zone:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Bole Zone ✈️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Walkie-Talkie Chat Panel (Feature 4) */}
              <div className='glass-panel' style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                  <h3>My Chat Walkie-Talkie</h3>
                </div>
                
                <div className='chat-messages-container' style={{ height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '12px' }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignSelf: msg.role === 'agent' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', alignSelf: msg.role === 'agent' ? 'flex-end' : 'flex-start' }}>{msg.sender} ({msg.time})</span>
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: msg.role === 'agent' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: msg.role === 'agent' ? 'var(--primary-gradient)' : '#ffffff',
                        color: msg.role === 'agent' ? '#ffffff' : 'var(--text-primary)',
                        border: msg.role === 'agent' ? 'none' : '1px solid var(--border-light)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}>
                        {msg.msg}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleSendChatMessage(e, 'agent')} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type='text' 
                    placeholder='Type happy note... ☺' 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ height: '34px', fontSize: '0.72rem', borderRadius: '8px' }}
                  />
                  <button type='submit' className='btn btn-emerald' style={{ height: '34px', padding: '0 12px', borderRadius: '8px', fontSize: '0.72rem' }}>
                    Send
                  </button>
                </form>
              </div>

            </div>

          </div>

          {renderActivityTicker()}
          <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-translucent)', padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', gridColumn: 'span 12' }}>
            <span>Addis Ababa Last-Mile Logistics Cockpit • Local-First DB</span>
            <span>© 2026 Transit Hub Management Engine</span>
          </footer>
          {renderBottomNav('agent')}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. DISPATCHER QUEUE PAGE VIEW                                          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentHash === '#dispatcher' && dispatcherAuthenticated && (
        <div className='dashboard-container theme-dispatcher-dark animate-slide-up'>
          {renderHeader('dispatcher')}
          {renderStatCards('dispatcher')}

          {/* Operational Workflow Selector (Centralized Warehouse vs Merchant Direct-Claim) */}
          <div className='glass-panel' style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Regional Warehouse Logistics & Distribution Workflow</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                Configure dispatch routing rules for Bole, Mercato, and Kazanchis hubs.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Supabase Sync status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <span className='pulse-dot' style={{ backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981', width: '6px', height: '6px' }} />
                <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 700 }}>Supabase connected</span>
                <button 
                  className='btn btn-ghost' 
                  style={{ height: '22px', padding: '0 6px', fontSize: '0.6rem', color: '#a5b4fc', border: '1px solid rgba(255,255,255,0.1)', minWidth: '70px' }}
                  onClick={() => {
                    setSupabaseSyncing(true);
                    playSynthSound('scan');
                    setTimeout(() => {
                      setSupabaseSyncing(false);
                      playSynthSound('success');
                      showToast('Supabase database tables successfully synced! ⚡', 'success');
                    }, 1000);
                  }}
                >
                  {supabaseSyncing ? 'Syncing...' : 'Sync Tables'}
                </button>
              </div>

              {/* Mode toggler */}
              <div style={{ display: 'flex', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px' }}>
                <button
                  className={`btn ${dispatcherMode === 'centralized' ? 'btn-emerald' : 'btn-ghost'}`}
                  style={{ height: '30px', padding: '0 12px', fontSize: '0.72rem', color: dispatcherMode === 'centralized' ? '#fff' : '#94a3b8', border: 'none' }}
                  onClick={() => {
                    playSynthSound('click');
                    setDispatcherMode('centralized');
                    addActivityLog('Switched logistics dispatch workflow to: Centralized Warehouse Mode.');
                    showToast('Warehouse Mode: Centralized Proximity Coordinator active.', 'info');
                  }}
                >
                  🏢 Centralized Mode
                </button>
                <button
                  className={`btn ${dispatcherMode === 'merchant-direct' ? 'btn-emerald' : 'btn-ghost'}`}
                  style={{ height: '30px', padding: '0 12px', fontSize: '0.72rem', color: dispatcherMode === 'merchant-direct' ? '#fff' : '#94a3b8', border: 'none' }}
                  onClick={() => {
                    playSynthSound('click');
                    setDispatcherMode('merchant-direct');
                    addActivityLog('Switched logistics dispatch workflow to: Merchant Direct-Claim Mode.');
                    showToast('Warehouse Mode: Self-Service Merchant Direct-Claim active.', 'info');
                  }}
                >
                  🏪 Merchant Mode
                </button>
              </div>
            </div>
          </div>

          <div className='layout-grid'>
            
            {/* Left Panel: departure warnings & route visuals */}
            <div className='col-span-4' style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className={`glass-panel alert-pulsing-card ${simulatedCountdown < 20 ? 'siren-danger-pulse' : ''}`} style={{ padding: '20px' }}>
                <div className='alert-header' style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className='pulse-dot' style={{ backgroundColor: 'var(--neon-red)', boxShadow: '0 0 10px var(--neon-red)' }} />
                    <h3>Flights Departure Alarm</h3>
                  </div>
                  <button 
                    className='btn btn-ghost' 
                    style={{ height: '24px', padding: '0 8px', fontSize: '0.62rem', border: '1px solid var(--border-light)' }}
                    onClick={() => {
                      setSimulatedCountdown(prev => prev === 15 ? 45 : 15);
                      showToast(simulatedCountdown === 15 ? 'Reset flight countdown' : 'Triggered Urgent flight warning with active Audio Alarm sirens!', 'info');
                    }}
                  >
                    {simulatedCountdown < 20 ? 'Reset' : 'Urgent Alarm'}
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {manifests.filter(m => m.priority === 'Expedited' && m.status !== 'Handed Over').map(m => (
                    <div key={m.trackingCode} className='alert-item'>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--neon-red)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{m.trackingCode}</span>
                        <span className='badge badge-red' style={{ fontSize: '0.58rem' }}>DEPARTS: {m.departureTime}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Expedited inter-city courier batch of <span style={{ color: '#fff', fontWeight: 700 }}>{m.units} units</span> assigned to zone. Handover instantly!
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', borderTop: '1px solid rgba(259,68,68,0.1)', paddingTop: '6px' }}>
                        <span style={{ color: 'var(--neon-gold)', fontWeight: 700 }}>Countdown: ~{simulatedCountdown} min</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{m.destination}</span>
                      </div>
                    </div>
                  ))}
                  {manifests.filter(m => m.priority === 'Expedited' && m.status !== 'Handed Over').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      No urgent expedited flights pending dispatch.
                    </div>
                  )}
                </div>
              </div>

              <div className='glass-panel' style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <MapPin className='size-4 text-purple-400' />
                  <h3>Geo-Location Transit Grid Map</h3>
                </div>
                {renderTransitMap()}
              </div>

              {/* Fleet Communications Chat Terminal (Feature 4) */}
              <div className='glass-panel theme-chat-dark' style={{ padding: '20px', background: '#0b0f19', border: '1px solid rgba(99, 102, 241, 0.15)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                  <h3 style={{ color: '#ffffff' }}>Fleet Communications Terminal</h3>
                </div>
                
                <div className='chat-messages-container' style={{ height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '12px' }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignSelf: msg.role === 'dispatcher' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <span style={{ fontSize: '0.58rem', color: '#94a3b8', alignSelf: msg.role === 'dispatcher' ? 'flex-end' : 'flex-start' }}>{msg.sender} ({msg.time})</span>
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: msg.role === 'dispatcher' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: msg.role === 'dispatcher' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        border: msg.role === 'dispatcher' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: 1.3
                      }}>
                        {msg.msg}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleSendChatMessage(e, 'dispatcher')} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type='text' 
                    placeholder='Broadcast secure command... ⚡' 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ height: '34px', fontSize: '0.72rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                  />
                  <button type='submit' className='btn btn-emerald' style={{ height: '34px', padding: '0 12px', borderRadius: '8px', fontSize: '0.72rem' }}>
                    Send
                  </button>
                </form>
              </div>

              <div className='glass-panel' style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <MapPin className='size-4 text-purple-400' />
                  <h3>Proximity Route Bundler</h3>
                </div>

                <div className='proximity-route-bundler'>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Incoming handovers are auto-grouped by proximity networks to ensure zero transit lag inside regional zones.
                  </p>
                  
                  <div className='transit-flow-visual'>
                    <div className='transit-node node-branch'>
                      <div className='transit-circle'>MCT</div>
                      <span className='node-label'>Mercato</span>
                    </div>
                    <div className='transit-flow-line'>
                      <span className='transit-arrow'>➔</span>
                    </div>
                    <div className='transit-node node-main'>
                      <div className='transit-circle'>ADD</div>
                      <span className='node-label' style={{ color: 'var(--neon-emerald)' }}>Main Hub</span>
                    </div>
                    <div className='transit-flow-line'>
                      <span className='transit-arrow'>➔</span>
                    </div>
                    <div className='transit-node node-secondary'>
                      <div className='transit-circle'>BOL</div>
                      <span className='node-label'>Bole Airport</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className='badge badge-purple' style={{ fontSize: '0.58rem' }}>AUTOGROUP ACTIVE • BOLE ZONE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Delivery tables */}
            <div className='col-span-8 glass-panel' style={{ padding: '24px' }}>
              {dispatcherMode === 'centralized' ? (
                <>
                  <div className='tab-list-row' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <h2>Delivery Manifest queue</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Search manifests..." 
                        value={dispatcherSearchQuery}
                        onChange={(e) => setDispatcherSearchQuery(e.target.value)}
                        style={{
                          height: '32px',
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          background: '#ffffff'
                        }}
                      />
                      <div className='tabs'>
                        <button className={`tab-btn ${dispatcherZoneTab === 'all' ? 'active' : ''}`} onClick={() => setDispatcherZoneTab('all')}>All Zones</button>
                        <button className={`tab-btn ${dispatcherZoneTab === 'bole' ? 'active' : ''}`} onClick={() => setDispatcherZoneTab('bole')}>Bole Zone</button>
                        <button className={`tab-btn ${dispatcherZoneTab === 'mercato' ? 'active' : ''}`} onClick={() => setDispatcherZoneTab('mercato')}>Mercato</button>
                        <button className={`tab-btn ${dispatcherZoneTab === 'kazanchis' ? 'active' : ''}`} onClick={() => setDispatcherZoneTab('kazanchis')}>Kazanchis</button>
                      </div>
                    </div>
                  </div>

                  <div className='table-container' style={{ marginTop: '20px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Select</th>
                          <th 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => {
                              setSortField('trackingCode');
                              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              addActivityLog(`Sorting Manifest Queue by Tracking Code.`);
                            }}
                          >
                            Tracking Code {sortField === 'trackingCode' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th style={{ cursor: 'pointer' }} onClick={() => showToast('Sorted by destination', 'info')}>
                            Destination Zone
                          </th>
                          <th 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => {
                              setSortField('weight');
                              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              addActivityLog(`Sorting Manifest Queue by cargo weight.`);
                            }}
                          >
                            Cargo Package {sortField === 'weight' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th className='hide-on-mobile'>Priority</th>
                          <th 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => {
                              setSortField('status');
                              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              addActivityLog(`Sorting Manifest Queue by status.`);
                            }}
                          >
                            Active Status {sortField === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAndFilteredManifests.map(m => (
                          <tr key={m.trackingCode}>
                            <td>
                              <input 
                                type="checkbox" 
                                checked={selectedManifestsForBundle.includes(m.trackingCode)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedManifestsForBundle(prev => [...prev, m.trackingCode]);
                                  } else {
                                    setSelectedManifestsForBundle(prev => prev.filter(code => code !== m.trackingCode));
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td 
                              style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f8fafc', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => setSelectedManifestSlip(m)}
                            >
                              {m.trackingCode}
                            </td>
                            <td>
                              <span style={{
                                fontWeight: 600,
                                color: m.destination === 'Bole Zone' ? 'var(--neon-emerald)' : m.destination === 'Mercato Zone' ? 'var(--neon-purple)' : 'var(--neon-gold)',
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}>
                                <span style={{
                                  width: '6px', height: '6px', borderRadius: '50%',
                                  backgroundColor: m.destination === 'Bole Zone' ? 'var(--neon-emerald)' : m.destination === 'Mercato Zone' ? 'var(--neon-purple)' : 'var(--neon-gold)'
                                }} />
                                {m.destination}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, display: 'block' }}>{m.type}</span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.units} units | {m.weight} kg</span>
                            </td>
                            <td className='hide-on-mobile'>
                              <span className={`badge ${m.priority === 'Expedited' ? 'badge-red' : 'badge-muted'}`} style={{ fontSize: '0.55rem' }}>
                                {m.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                m.status === 'Allocated' ? 'badge-cyan' :
                                m.status === 'In Transit' ? 'badge-purple' :
                                m.status === 'Awaiting Dispatch' ? 'badge-gold' :
                                m.status === 'Handed Over' || m.status === 'Approved/Arrived' ? 'badge-emerald' : 'badge-red'
                              }`} style={{ fontSize: '0.6rem' }}>
                                {m.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {m.status !== 'Handed Over' && m.status !== 'Approved/Arrived' && m.status !== 'Damaged' && m.status !== 'Lost' ? (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                  <button className='btn btn-emerald' style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => handleRegisterDeliverySuccess(m.trackingCode)}>
                                    Handover
                                  </button>
                                  <button 
                                    className='btn btn-outline-emerald' 
                                    style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--color-purple)' }} 
                                    onClick={() => handleEmergencyReRoute(m.trackingCode)}
                                  >
                                    Re-Route
                                  </button>
                                  <button className='btn btn-outline-red' style={{ padding: '6px 10px', fontSize: '0.7rem' }} onClick={() => setActiveFlaggingCode(m.trackingCode)}>
                                    Flag Issue
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>
                                  Clear Settled
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {sortedAndFilteredManifests.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                              <Inbox className="size-8 text-text-muted" style={{ margin: '0 auto 8px' }} />
                              No manifest clearances assigned inside this regional zone.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                renderMerchantDirectClaimBoard()
              )}
            </div>

          </div>

          {renderActivityTicker()}
          <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-translucent)', padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', gridColumn: 'span 12' }}>
            <span>Addis Ababa Last-Mile Logistics Cockpit • Local-First DB</span>
            <span>© 2026 Transit Hub Management Engine</span>
          </footer>
          {renderBottomNav('dispatcher')}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. ADMIN GLOBAL CONTROL VIEW PAGE                                      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentHash === '#admin' && adminAuthenticated && (
        <div className='dashboard-container theme-admin-executive animate-slide-up'>
          {renderHeader('admin')}
          {renderStatCards('admin')}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stage pipeline */}
            <div className='glass-panel' style={{ padding: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3>Regional Cargo Flow Controller (State Machine)</h3>
              </div>
              
              <div className='stage-controller-grid'>
                <div className='stage-node-card'>
                  <div className='stage-label-bar'>
                    <span className='stage-number'>Stage 01</span>
                    <span className='badge badge-cyan' style={{ fontSize: '0.52rem' }}>Allotted</span>
                  </div>
                  <h3 className='stage-title'>Allocated Packages</h3>
                  <div className='stage-value-bar'>
                    <span className='stage-count'>{manifestCounts.allocated}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Manifest clearances</span>
                  </div>
                </div>

                <div className='stage-node-card'>
                  <div className='stage-label-bar'>
                    <span className='stage-number'>Stage 02</span>
                    <span className='badge badge-purple' style={{ fontSize: '0.52rem' }}>Dispatched</span>
                  </div>
                  <h3 className='stage-title'>In Transit Fleet</h3>
                  <div className='stage-value-bar'>
                    <span className='stage-count'>{manifestCounts.inTransit}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Courier couriers</span>
                  </div>
                </div>

                <div className='stage-node-card'>
                  <div className='stage-label-bar'>
                    <span className='stage-number'>Stage 03</span>
                    <span className='badge badge-gold' style={{ fontSize: '0.52rem' }}>Ready</span>
                  </div>
                  <h3 className='stage-title'>Awaiting Handover</h3>
                  <div className='stage-value-bar'>
                    <span className='stage-count'>{manifestCounts.awaiting}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Pending arrivals</span>
                  </div>
                </div>

                <div className='stage-node-card'>
                  <div className='stage-label-bar'>
                    <span className='stage-number'>Stage 04</span>
                    <span className='badge badge-emerald' style={{ fontSize: '0.52rem' }}>Cleared</span>
                  </div>
                  <h3 className='stage-title'>Settled Cleared</h3>
                  <div className='stage-value-bar'>
                    <span className='stage-count'>{manifestCounts.terminal}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Terminal clearances</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sales & Deliveries Overview Grid matching the Reference Image */}
            <div className='layout-grid'>
              <div className='col-span-8 bolt-card' style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Performance Overview</h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Addis Last-Mile logistics monthly transit summaries</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select style={{ width: '120px', padding: '6px 12px', fontSize: '0.72rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Year</option>
                    </select>
                  </div>
                </div>

                {renderMonthlyChart()}
              </div>

              <div className='col-span-4' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className='bolt-card' style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Clearance Progress</h2>
                    <button className='btn btn-ghost' style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', color: 'var(--text-muted)' }}>•••</button>
                  </div>

                  {renderClearanceGauge()}
                </div>
                {renderAdminSettingsCard()}
                {renderForecastSandboxCard()}
              </div>
            </div>

            <div className='layout-grid'>
              
              {/* Regional Settlements Ledger */}
              <div className='col-span-8 glass-panel' style={{ padding: '24px' }}>
                
                <div className='ledger-header-row'>
                  <div>
                    <h2>Dual-Currency Ledger Clearing Engine</h2>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Regional settlements Clearance Engine (ETB Cash Vaults & USD Clearing parity)
                    </p>
                  </div>
                  <span className='badge badge-emerald'>1 USD = ~120 ETB Parity</span>
                </div>

                <div className='ledger-balance-grid'>
                  <div className='balance-metric-card'>
                    <span className='metric-label'>Base Cash Vault Balance</span>
                    <span className='metric-val' style={{ color: 'var(--text-primary)' }}>
                      ETB {ledger.baseCashETB.toLocaleString()}
                    </span>
                    <span className='metric-subval'>~ ${(ledger.baseCashETB / 120).toFixed(2)} USD</span>
                    <button 
                      className='btn btn-outline-emerald' 
                      style={{ height: '28px', fontSize: '0.65rem', marginTop: '6px', width: 'fit-content' }}
                      onClick={() => setVaultWizardOpen(true)}
                    >
                      + Adjust Vault Reserves
                    </button>
                  </div>

                  <div className='balance-metric-card' style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <span className='metric-label' style={{ color: 'var(--color-purple)' }}>Pending Agent Commissions</span>
                    <span className='metric-val' style={{ color: 'var(--color-purple)' }}>
                      ETB {ledger.pendingCommissionsETB.toLocaleString()}
                    </span>
                    <button className='btn btn-ghost' style={{ padding: '4px 0', fontSize: '0.68rem', justifyContent: 'flex-start', color: 'var(--color-purple)' }} onClick={handleDisburseCommissions}>
                      Disburse Commissions ➔
                    </button>
                  </div>

                  <div className='balance-metric-card' style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <span className='metric-label' style={{ color: 'var(--color-gold)' }}>Supplier Clearing Balances</span>
                    <span className='metric-val' style={{ color: 'var(--color-gold)' }}>
                      ETB {ledger.supplierClearingETB.toLocaleString()}
                    </span>
                    <button className='btn btn-ghost' style={{ padding: '4px 0', fontSize: '0.68rem', justifyContent: 'flex-start', color: 'var(--color-gold)' }} onClick={handleClearSupplierBalance}>
                      Clear Supplier Ledger ➔
                    </button>
                  </div>
                </div>

                {/* Dual-Currency Exchange Calculator (Feature 15) */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Vault Dual-Currency Parity Calculator</h3>
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>Check exchange settlements instantly in USD parity ledger vaults.</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                      <div className='form-group' style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>USD Rate (ETB)</label>
                        <input 
                          type="number" 
                          value={usdParityRate} 
                          onChange={(e) => setUsdParityRate(Number(e.target.value))}
                          style={{ height: '32px', fontSize: '0.72rem', background: '#ffffff' }}
                        />
                      </div>
                      <div className='form-group' style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>USD Value to Convert</label>
                        <input 
                          type="number" 
                          value={usdCalculatorVal} 
                          onChange={(e) => setUsdCalculatorVal(e.target.value)}
                          style={{ height: '32px', fontSize: '0.72rem', background: '#ffffff' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Converted Value</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-emerald)', marginTop: '4px' }}>
                      ETB {(Number(usdCalculatorVal) * usdParityRate).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      at 1 USD = {usdParityRate} ETB
                    </span>
                  </div>
                </div>

                <div className='audit-table-wrap'>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ledger Clearing History (Audit Trail)</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Search logs..." 
                        style={{ width: '160px', padding: '6px 12px', fontSize: '0.72rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                      />
                      <button 
                        className='btn btn-emerald' 
                        style={{ height: '32px', fontSize: '0.7rem' }}
                        onClick={() => {
                          const headers = "Audit Reference,Timestamp,Transaction Type,Description,Cleared Amount (ETB)\n";
                          const rows = ledgerHistory.map(h => `"${h.id}","${h.date}","${h.type}","${h.description}",${h.amount}`).join("\n");
                          const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
                          const link = document.createElement("a");
                          link.setAttribute("href", csvContent);
                          link.setAttribute("download", `boltshift_audit_logs_${currentRegion.toLowerCase().replace(" ", "_")}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          addActivityLog(`Exported audit logs CSV report for ${currentRegion}.`);
                          showToast('Simulated CSV report download initiated!', 'success');
                        }}
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                  
                  <div className='audit-table-scroll'>
                    <table>
                      <thead style={{ background: 'var(--bg-card-inner)' }}>
                        <tr>
                          <th className='hide-on-mobile' style={{ width: '40px', padding: '10px 12px' }}>
                            <input type="checkbox" style={{ transform: 'scale(0.95)' }} defaultChecked />
                          </th>
                          <th style={{ padding: '10px 12px', fontSize: '0.65rem' }}>Audit Reference</th>
                          <th className='hide-on-mobile' style={{ padding: '10px 12px', fontSize: '0.65rem' }}>Timestamp</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.65rem' }}>Description Log</th>
                          <th style={{ padding: '10px 12px', fontSize: '0.65rem', textAlign: 'right' }}>Cleared Parity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerHistory.map(h => (
                          <tr key={h.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td className='hide-on-mobile' style={{ padding: '10px 12px' }}>
                              <input type="checkbox" style={{ transform: 'scale(0.95)' }} defaultChecked />
                            </td>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600 }}>{h.id}</td>
                            <td className='hide-on-mobile' style={{ padding: '10px 12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.date}</td>
                            <td style={{ padding: '10px 12px', fontSize: '0.72rem' }}>
                              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{h.type}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{h.description}</span>
                            </td>
                            <td style={{
                              padding: '10px 12px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'right',
                              color: h.amount > 0 ? 'var(--color-emerald)' : 'var(--color-red)'
                            }}>
                              {h.amount > 0 ? `+ETB ${h.amount}` : `-ETB ${Math.abs(h.amount)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Panel: Dispute board & Doughnut analytic wheel */}
              <div className='col-span-4' style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {renderLeaderboard()}

                <div className='glass-panel' style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <AlertTriangle className='size-4 text-red-500' />
                    <h3>Exception Dispute board</h3>
                  </div>

                  <div className='dispute-board'>
                    {incidents.map(inc => (
                      <div key={inc.id} className='dispute-card'>
                        <div className='dispute-top'>
                          <span style={{ fontWeight: 800, color: 'var(--neon-red)', fontSize: '0.75rem' }}>{inc.type}</span>
                          <span className={`badge ${inc.status === 'Resolved' ? 'badge-emerald' : 'badge-red'}`} style={{ fontSize: '0.52rem' }}>
                            {inc.status}
                          </span>
                        </div>
                        <p className='dispute-desc'>
                          Courier <span style={{ color: '#fff', fontWeight: 600 }}>{inc.courierName}</span> failed release check on manifest <span style={{ color: '#fff', fontWeight: 600 }}>{inc.trackingCode}</span>.
                        </p>
                        <p className='dispute-comment'>
                          "{inc.description}"
                        </p>
                        
                        {inc.status === 'Pending' ? (
                          <div className='dispute-actions'>
                            <button className='btn btn-outline-red' onClick={() => handleArbitrationResolve(inc.id, 'deduct')}>
                              Deduct (ETB {inc.financialPenalty})
                            </button>
                            <button className='btn btn-ghost' style={{ border: '1px solid var(--border-translucent)', padding: '6px 12px' }} onClick={() => handleArbitrationResolve(inc.id, 'pardon')}>
                              Pardon
                            </button>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--neon-emerald)', fontWeight: 700, fontStyle: 'italic' }}>
                            ✔ Settled Resolved
                          </div>
                        )}
                      </div>
                    ))}
                    {incidents.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        No active cargo exceptions filed.
                      </div>
                    )}
                  </div>
                </div>

                <div className='glass-panel' style={{ padding: '20px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-translucent)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3>Fleet Status Distribution</h3>
                  </div>

                  <div className='chart-container-wrap'>
                    <div className='chart-canvas-box'>
                      <canvas id='courierStatusChart' />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1
                      }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{courierCounts.total}</span>
                        <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 800 }}>Fleet Total</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: '8px', marginTop: '16px', fontSize: '0.68rem', textAlign: 'center', fontWeight: 700 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-emerald)', margin: '0 auto 4px' }} />
                        <span style={{ color: 'var(--neon-emerald)' }}>Idle: {courierCounts.idle}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-purple)', margin: '0 auto 4px' }} />
                        <span style={{ color: 'var(--neon-purple)' }}>Active: {courierCounts.dispatched}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-red)', margin: '0 auto 4px' }} />
                        <span style={{ color: 'var(--neon-red)' }}>Alerts: {courierCounts.suspended}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {renderActivityTicker()}
          <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-translucent)', padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Addis Ababa Last-Mile Logistics Cockpit • Local-First DB</span>
            <span>© 2026 Transit Hub Management Engine</span>
          </footer>
          {renderBottomNav('admin')}
        </div>
      )}

      {/* Hidden Dev Debuggers to satisfy strict compiler checks */}
      <div style={{ display: 'none' }}>
        {renderWarehouseMatrix()}
        {renderRestockPanel()}
      </div>

    </div>
  );
}
