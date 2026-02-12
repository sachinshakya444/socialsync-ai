import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, Loader2, LogOut, Lock, Zap } from 'lucide-react';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0); // User ne kitne post banaye
  const [showPaywall, setShowPaywall] = useState(false); // Paise mangne wali screen

  // 1. User Login Check & Load Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Database se user ka count check karo
        const userRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          setCount(docSnap.data().count);
        } else {
          // New User? Database mein entry banao
          await setDoc(userRef, { count: 0 });
          setCount(0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const generatePost = async () => {
    if (!topic) return alert("Topic toh likho boss!");
    
    // --- LIMIT CHECK LOGIC (PAISA DO) ---
    if (count >= 5) {
      setShowPaywall(true); // Limit khatam, paywall dikhao
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      // 1. Content Generate karo Backend se
      const response = await axios.post('http://localhost:5000/generate', {
        topic,
        platform
      });
      setResult(response.data.content);

      // 2. Database mein Count badhao (+1)
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, { count: increment(1) });
      setCount(prev => prev + 1);

    } catch (error) {
      console.error("Error:", error);
      alert("Kuch gadbad ho gayi backend mein.");
    }
    setLoading(false);
  };

  // --- SCREEN 1: LOGIN (Agar user nahi hai) ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold flex items-center justify-center gap-3">
            SocialSync <Sparkles className="text-yellow-400" />
          </h1>
          <p className="text-gray-400 text-lg">Viral Posts Generator for Professionals</p>
          <button onClick={signInWithGoogle} className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition shadow-lg flex items-center gap-2 mx-auto">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
             Get Started with Google
          </button>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: PAYWALL (Agar limit khatam ho gayi) ---
  if (showPaywall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0"></div>
        
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border border-indigo-100 relative z-10 animate-in zoom-in-95 duration-300">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Limit Reached! 🛑</h2>
          <p className="text-gray-500 text-lg">
            Aapne apne <b>5 free posts</b> use kar liye hain. Unlimited access ke liye upgrade karein.
          </p>
          
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 my-4">
            <span className="text-4xl font-extrabold text-indigo-600">₹99</span> 
            <span className="text-gray-500 font-medium ml-2">/ month</span>
          </div>
          
          <button 
            onClick={() => alert("Payment Gateway (Razorpay/Stripe) integration coming soon!")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Upgrade to PRO ⚡
          </button>
          
          <button 
            onClick={() => setShowPaywall(false)} 
            className="text-gray-400 font-medium hover:text-gray-600 hover:underline mt-4 text-sm"
          >
            Go Back (Read Only Mode)
          </button>
        </div>
      </div>
    );
  }

  // --- SCREEN 3: MAIN APP DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          SocialSync <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full border border-indigo-200">BETA</span>
        </h1>
        
        <div className="flex items-center gap-6">
          {/* Usage Counter */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Free Credits</span>
            <div className={`flex items-center gap-1 font-bold text-lg ${count >= 5 ? 'text-red-500' : 'text-indigo-600'}`}>
               {count} / 5 <Zap size={16} fill="currentColor" />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            <button 
              onClick={logout} 
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">What do you want to post about?</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Tips for Remote Work, New AI Tools..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Platform</label>
                <div className="relative">
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none cursor-pointer"
                  >
                    <option>LinkedIn</option>
                    <option>Twitter (X)</option>
                    <option>Instagram Caption</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
              </div>
              
              <div className="flex items-end">
                 <button 
                  onClick={generatePost}
                  disabled={loading} // IMPORTANT: Yahan se 'count >= 5' hata diya hai
                  className={`w-full h-[58px] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg
                    ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
                  `}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles size={20} /> Generate Post</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-indigo-500 p-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-500" /> Generated Content
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert("Copied to clipboard!");
                }} 
                className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-md transition-colors"
              >
                Copy Text
              </button>
            </div>
            <p className="whitespace-pre-wrap text-gray-800 text-lg leading-relaxed font-medium font-sans">
              {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;