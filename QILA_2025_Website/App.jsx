import React, { useState, useEffect, useContext, createContext } from 'react';
import { Home, Trophy, BarChart3, Image, Phone, Speaker, Settings, Edit3, Save, Loader2, Zap, Menu, X, Calendar, MapPin, Heart } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION ---

// Use the content fetch IDs for direct access to the uploaded files
const LOGO_IMAGE_URL = 'uploaded:LOGO.jpeg-306f70c0-0ef6-46f4-ae99-dc4b4fb57607'; 
const EVENT_NAME_IMAGE_URL = 'uploaded:EVENT NAME.jpeg-e353dcc5-fbf3-491a-86d0-04a844a09585';
const BACKGROUND_IMAGE_URL = 'uploaded:BAGROUND.jpg-36499cef-5a62-4b01-9d2c-3a894fb2fd17';

// Event details for text elements
const EVENT_NAME = "QILA 2025";
const EVENT_TAGLINE = "The Art, The Culture, The Competition. Embrace the bloom of talent!";
const EVENT_DATE = "2025 ഒക്ടോബർ 19-22";
const EVENT_VENUE = "മെഡിക്കൽ കോളേജ്, കോട്ടയം";

// Color scheme based on the logo (Red and Green)
const ACCENT_RED = 'red-600';
const ACCENT_GREEN = 'green-500';
const BG_DARK = 'gray-900';
const CARD_DARK = 'gray-800';

// Fixed categories for the scoreboard
const CATEGORIES = [
  { key: 'literary', name: 'Literary' },
  { key: 'fineArts', name: 'Fine Arts' },
  { key: 'music', name: 'Music' },
  { key: 'dance', name: 'Dance' },
  { key: 'theatre', name: 'Theatre' },
];

const INITIAL_COLLEGE_SETUP = [
    { id: 'collegeA', name: 'College of Arts', points: { literary: 0, fineArts: 0, music: 0, dance: 0, theatre: 0 }, total: 0 },
    { id: 'collegeB', name: 'Regional Medical College', points: { literary: 0, fineArts: 0, music: 0, dance: 0, theatre: 0 }, total: 0 },
    { id: 'collegeC', name: 'State University', points: { literary: 0, fineArts: 0, music: 0, dance: 0, theatre: 0 }, total: 0 },
];

// --- FIREBASE SETUP AND CONTEXT ---

const APP_ID = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const FIREBASE_CONFIG = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};
const INITIAL_AUTH_TOKEN = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
const STANDINGS_DOC_PATH = `/artifacts/${APP_ID}/public/data/scoreboard/current_standings`;
const ADMIN_DOC_REF = 'main_standings'; // Document ID within the collection

const FirebaseContext = createContext(null);
const useFirebase = () => useContext(FirebaseContext);

const FirebaseProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                if (Object.keys(FIREBASE_CONFIG).length === 0) {
                    console.warn("Firebase config is empty. Functionality limited.");
                    setIsReady(true);
                    return;
                }
                
                const app = initializeApp(FIREBASE_CONFIG);
                const firestore = getFirestore(app);
                const authInstance = getAuth(app);

                setDb(firestore);
                setAuth(authInstance);

                const handleAuth = async (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        try {
                            if (INITIAL_AUTH_TOKEN) {
                                await signInWithCustomToken(authInstance, INITIAL_AUTH_TOKEN);
                            } else {
                                const userCredential = await signInAnonymously(authInstance);
                                setUserId(userCredential.user.uid);
                            }
                        } catch (error) {
                            console.error("Firebase Auth Error:", error);
                        }
                    }
                    setIsReady(true);
                };

                const unsubscribe = onAuthStateChanged(authInstance, handleAuth);
                return () => unsubscribe();
            } catch (e) {
                console.error("Failed to initialize Firebase:", e);
                setIsReady(true);
            }
        };
        initializeFirebase();
    }, []);

    return (
        <FirebaseContext.Provider value={{ db, auth, userId, isReady }}>
            {children}
        </FirebaseContext.Provider>
    );
};

// --- UTILITY COMPONENTS ---

const MessageModal = ({ message, type, onClose }) => {
    if (!message) return null;

    const color = type === 'error' ? 'bg-red-600' : 'bg-green-600';
    const Icon = type === 'error' ? X : Zap;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`rounded-xl shadow-2xl p-6 max-w-sm w-full ${color} text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Icon className="w-6 h-6 mr-3" />
                        <span className="font-semibold text-lg">{type === 'error' ? 'Error' : 'Success'}</span>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-75">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="mt-4">{message}</p>
            </div>
        </div>
    );
};

const SplashScreen = ({ onFadeOut }) => {
    const [isFaded, setIsFaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFaded(true);
            const fadeTimer = setTimeout(onFadeOut, 1000); 
            return () => clearTimeout(fadeTimer);
        }, 2000); 
        
        return () => clearTimeout(timer);
    }, [onFadeOut]);

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center transition-opacity duration-1000 z-[100]`}
            style={{ 
                backgroundColor: `#111827`, 
                opacity: isFaded ? 0 : 1,
                pointerEvents: isFaded ? 'none' : 'auto'
            }}
        >
            <img 
                src={LOGO_IMAGE_URL} 
                alt="Event Logo" 
                className="w-full max-w-xs md:max-w-sm h-auto object-contain animate-pulse"
                onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x400/111827/ffffff?text=LOGO`; }}
            />
        </div>
    );
};


// --- VIEW COMPONENTS ---

const HomeContent = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className={`text-center mb-12 py-10 bg-${CARD_DARK}/70 rounded-2xl shadow-2xl backdrop-blur-sm`}>
        
        {/* Main Logo Area */}
        <div className="mb-8">
          <img 
            src={LOGO_IMAGE_URL} 
            alt="Event Logo" 
            className="w-full max-w-xs mx-auto h-auto object-contain mb-4"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x400/1f2937/ffffff?text=LOGO`; }}
          />
        </div>

        {/* Event Name as a Design Element (Image) */}
        <div className="mb-6">
          <img 
            src={EVENT_NAME_IMAGE_URL} 
            alt={EVENT_NAME} 
            className="w-full max-w-sm md:max-w-md mx-auto h-auto object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x100/1f2937/ffffff?text=EVENT+NAME`; }}
          />
        </div>
        
        {/* Event Details */}
        <div className="space-y-3 max-w-md mx-auto p-4 rounded-lg">
          <div className={`flex items-center justify-center text-gray-200`}>
            <Calendar className={`w-5 h-5 text-${ACCENT_RED} mr-3 shrink-0`} />
            <span className="font-semibold text-xl">{EVENT_DATE}</span>
          </div>
          <div className={`flex items-center justify-center text-gray-200`}>
            <MapPin className={`w-5 h-5 text-${ACCENT_RED} mr-3 shrink-0`} />
            <span className="text-lg">{EVENT_VENUE}</span>
          </div>
        </div>
      </div>

      <div className={`bg-${CARD_DARK}/90 p-6 md:p-10 rounded-2xl shadow-xl space-y-8 backdrop-blur-sm border-t-4 border-${ACCENT_RED}`}>
        <section>
          <h3 className={`text-3xl font-bold text-${ACCENT_RED} mb-4 border-b border-gray-700 pb-2`}>About the Event</h3>
          <p className="text-gray-200 leading-relaxed text-lg">
            {EVENT_TAGLINE}
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            This multi-day cultural festival is a vibrant showcase of artistic expression, literary prowess, and theatrical brilliance. It is a unifying platform for students to compete in a spirit of camaraderie and mutual respect, celebrating the rich cultural diversity of our community. Get ready for an unforgettable experience!
          </p>
        </section>
        
        <div className="text-center">
            <button className={`px-8 py-3 bg-${ACCENT_GREEN} hover:bg-green-600 text-gray-900 font-bold rounded-full shadow-lg shadow-green-500/30 transition duration-300 transform hover:scale-[1.03]`}>
                View Event Schedule
            </button>
        </div>
      </div>
    </div>
  );
};

const Scoreboard = () => {
    const { db, isReady } = useFirebase();
    const [standingsData, setStandingsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isReady || !db) return;

        const docRef = doc(db, STANDINGS_DOC_PATH, ADMIN_DOC_REF);

        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (Array.isArray(data.colleges)) {
                    const calculatedData = data.colleges.map(college => ({
                        ...college,
                        points: college.points || {}, 
                        total: Object.values(college.points || {}).reduce((sum, p) => sum + (p || 0), 0)
                    }))
                    .sort((a, b) => b.total - a.total); 
                    
                    let rank = 1;
                    const rankedData = calculatedData.map((college, index) => {
                        if (index > 0 && college.total < calculatedData[index - 1].total) {
                            rank = index + 1;
                        }
                        return { ...college, rank };
                    });

                    setStandingsData(rankedData);
                } else {
                    setStandingsData(INITIAL_COLLEGE_SETUP);
                }
            } else {
                setStandingsData(INITIAL_COLLEGE_SETUP);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching standings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, isReady]);

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return <span className={`text-xl font-black text-${ACCENT_RED}`}>1st</span>;
            case 2: return <span className={`text-lg font-black text-gray-400`}>2nd</span>;
            case 3: return <span className={`text-md font-bold text-gray-500`}>3rd</span>;
            default: return <span className="text-md font-bold text-gray-500">{rank}</span>;
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className={`w-8 h-8 animate-spin mx-auto text-${ACCENT_RED}`} /> <p className="mt-2 text-gray-400">Loading Scoreboard...</p></div>;
    if (standingsData.length === 0) return <div className="p-10 text-center text-gray-400">No college standings found. Please check back later!</div>;


    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-4xl font-extrabold text-${ACCENT_GREEN} mb-6 border-b-2 border-${ACCENT_RED} pb-2 text-center`}>LIVE SCORECARD</h2>
            <p className="text-gray-400 mb-6 text-center">Real-time overall standings across all categories.</p>

            {/* Standings Table */}
            <div className={`overflow-x-auto bg-${CARD_DARK}/90 rounded-2xl shadow-2xl backdrop-blur-sm`}>
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className={`bg-${CARD_DARK} sticky top-0`}>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 sm:px-6 w-16">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 sm:px-6">College / Unit</th>
                            <th className={`px-4 py-3 text-right text-sm font-extrabold uppercase tracking-wider text-${ACCENT_RED} sm:px-6`}>Total Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-white">
                        {standingsData.map((college) => (
                            <tr key={college.id} className="hover:bg-gray-700 transition duration-150">
                                <td className="px-4 py-4 whitespace-nowrap font-bold sm:px-6">
                                    {getRankBadge(college.rank)}
                                </td>
                                <td className="px-4 py-4 text-sm font-medium sm:px-6">{college.name}</td>
                                <td className={`px-4 py-4 whitespace-nowrap text-right text-xl font-extrabold text-${ACCENT_GREEN} sm:px-6`}>
                                    {college.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
                *Standings are updated live by the organizing committee.
            </div>
        </div>
    );
};

const AdminScoreUpdater = () => {
    const { db, userId, isReady } = useFirebase();
    const [standings, setStandings] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ message: '', type: '' });

    const handleModalClose = () => setModal({ message: '', type: '' });

    useEffect(() => {
        if (!isReady || !db) return;

        const docRef = doc(db, STANDINGS_DOC_PATH, ADMIN_DOC_REF);

        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setStandings(data.colleges || INITIAL_COLLEGE_SETUP);
            } else {
                setStandings(INITIAL_COLLEGE_SETUP);
            }
        }, (error) => {
            console.error("Admin fetch error:", error);
            setModal({ message: "Could not fetch data. Check console for details.", type: 'error' });
        });

        return () => unsubscribe();
    }, [db, isReady]);

    // Check if user is authenticated (security check)
    const isAuthenticated = !!userId && userId !== 'anonymous';
    
    // Handle input changes
    const handleInputChange = (collegeId, categoryKey, value) => {
        setStandings(prevStandings =>
            prevStandings.map(college => {
                if (college.id === collegeId) {
                    const newPoints = {
                        ...college.points,
                        [categoryKey]: parseInt(value) || 0, // Ensure it's a number
                    };
                    return { ...college, points: newPoints, total: Object.values(newPoints).reduce((sum, p) => sum + p, 0) };
                }
                return college;
            })
        );
    };

    // Handle name change
    const handleNameChange = (collegeId, newName) => {
        setStandings(prevStandings => 
            prevStandings.map(college => 
                college.id === collegeId ? { ...college, name: newName } : college
            )
        );
    };

    // Save changes to Firestore
    const handleSave = async () => {
        if (!db || !isAuthenticated) {
            setModal({ message: "You are not authorized to save scores. Authentication failed.", type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const docRef = doc(db, STANDINGS_DOC_PATH, ADMIN_DOC_REF);
            
            // Prepare data for saving (only colleges array)
            const dataToSave = standings.map(c => ({
                id: c.id,
                name: c.name,
                points: c.points,
                total: Object.values(c.points).reduce((sum, p) => sum + p, 0)
            }));
            
            await setDoc(docRef, { colleges: dataToSave });
            setModal({ message: "Scores updated successfully! The public scoreboard is now live.", type: 'success' });
            setIsEditing(false);

        } catch (error) {
            console.error("Save error:", error);
            setModal({ message: `Failed to save scores: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isReady) return <div className="p-10 text-center"><Loader2 className={`w-8 h-8 animate-spin mx-auto text-${ACCENT_RED}`} /></div>;
    
    if (!isAuthenticated) {
        return (
            <div className="p-10 max-w-md mx-auto text-center bg-gray-800 rounded-xl mt-10 shadow-xl">
                <Settings className={`w-10 h-10 mx-auto mb-3 text-${ACCENT_RED}`} />
                <h2 className={`text-2xl font-bold text-${ACCENT_RED}`}>Authentication Required</h2>
                <p className="text-gray-400 mt-2">
                    This admin panel is only accessible to authenticated organizers.
                </p>
                <p className="text-xs text-gray-500 mt-4">
                    Your current User ID is: <span className="text-gray-300 break-all">{userId}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <MessageModal {...modal} onClose={handleModalClose} />

            <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-700">
                <h2 className={`text-4xl font-extrabold text-${ACCENT_RED}`}>Admin Score Update Portal</h2>
                <div>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className={`flex items-center px-4 py-2 bg-${ACCENT_GREEN} text-gray-900 rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md`}
                        >
                            <Edit3 className="w-5 h-5 mr-2" /> Start Editing
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave} 
                            disabled={isLoading} 
                            className={`flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md disabled:opacity-50`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 
                            Save Changes
                        </button>
                    )}
                </div>
            </div>

            <p className="text-gray-400 mb-6">
                Edit the points below. Changes only take effect on the public scoreboard after clicking **Save Changes**.
            </p>

            <div className={`overflow-x-auto bg-${CARD_DARK}/90 rounded-xl shadow-2xl backdrop-blur-sm`}>
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className={`bg-${CARD_DARK} sticky top-0`}>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 w-48">College Name</th>
                            {CATEGORIES.map(cat => (
                                <th key={cat.key} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">{cat.name}</th>
                            ))}
                            <th className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-${ACCENT_GREEN}`}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-white">
                        {standings.map(college => (
                            <tr key={college.id} className="hover:bg-gray-700 transition duration-100">
                                {/* College Name Input */}
                                <td className="px-4 py-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={college.name}
                                            onChange={(e) => handleNameChange(college.id, e.target.value)}
                                            className="w-full bg-gray-600 text-white p-2 rounded-md border border-gray-500 focus:ring-red-500 focus:border-red-500"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">{college.name}</span>
                                    )}
                                </td>
                                
                                {/* Category Points Inputs */}
                                {CATEGORIES.map(cat => (
                                    <td key={cat.key} className="px-3 py-2">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={college.points[cat.key] || 0}
                                                onChange={(e) => handleInputChange(college.id, cat.key, e.target.value)}
                                                className="w-20 bg-gray-600 text-white p-2 text-center rounded-md border border-gray-500 focus:ring-red-500 focus:border-red-500"
                                            />
                                        ) : (
                                            <span className="text-sm block text-center">{college.points[cat.key] || 0}</span>
                                        )}
                                    </td>
                                ))}

                                {/* Total Points */}
                                <td className={`px-3 py-2 text-center text-lg font-bold text-${ACCENT_GREEN}`}>{college.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-gray-400">
                <p>💡 **Admin Tip:** Use **Start Editing** and **Save Changes** to update the data. Your changes instantly reflect on the public scoreboard.</p>
            </div>
        </div>
    );
};


const Placeholder = ({ title, icon: Icon }) => (
    <div className="p-10 max-w-4xl mx-auto text-center bg-gray-800/80 backdrop-blur-sm rounded-2xl mt-8 shadow-xl">
        <Icon className={`w-10 h-10 mx-auto mb-3 text-${ACCENT_RED}`} />
        <h2 className={`text-2xl font-bold text-${ACCENT_GREEN} mb-2`}>{title}</h2>
        <p className="text-gray-400">This section is currently under development. Please check back soon!</p>
    </div>
);


// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const navItems = [
    { name: 'Home', key: 'home', icon: Home },
    { name: 'Scorecard', key: 'scoreboard', icon: Trophy },
    { name: 'Results', key: 'results', icon: BarChart3 },
    { name: 'Gallery', key: 'gallery', icon: Image },
    { name: 'Announcements', key: 'announcements', icon: Speaker },
    { name: 'Contacts', key: 'contacts', icon: Phone },
    { name: 'Admin', key: 'admin', icon: Settings }, // Hidden admin tab
  ];

  const handleFadeOut = () => setShowSplash(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeContent />;
      case 'scoreboard': return <Scoreboard />;
      case 'results': return <Placeholder title="Final Results" icon={BarChart3} />;
      case 'gallery': return <Placeholder title="Photo Gallery" icon={Image} />;
      case 'announcements': return <Placeholder title="Official Announcements" icon={Speaker} />;
      case 'contacts': return <Placeholder title="Contact Details" icon={Phone} />;
      case 'admin': return <AdminScoreUpdater />;
      default: return <HomeContent />;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const backgroundStyle = {
    backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <FirebaseProvider>
        <div className={`min-h-screen font-sans text-white`} style={backgroundStyle}>
          {showSplash && <SplashScreen onFadeOut={handleFadeOut} />}
          
          <div className={`min-h-screen bg-${BG_DARK}/80`}> 

            {/* HEADER / NAVIGATION BAR */}
            <header className={`sticky top-0 z-50 bg-${BG_DARK}/95 shadow-xl border-b-2 border-${ACCENT_RED}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                  {/* Logo/Title in header */}
                  <div className={`flex-shrink-0 text-3xl font-extrabold tracking-tight text-white`}>
                    {EVENT_NAME.split(' ')[0]} <span className={`text-${ACCENT_RED} font-normal`}>{EVENT_NAME.split(' ')[1]}</span>
                  </div>

                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex space-x-4">
                    {navItems.filter(item => item.key !== 'admin').map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`
                          flex items-center p-2 rounded-lg text-sm font-medium transition duration-300
                          ${activeTab === item.key
                            ? `text-${ACCENT_GREEN} bg-${CARD_DARK} shadow-inner ring-2 ring-${ACCENT_GREEN}`
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5 mr-2" />
                        {item.name}
                      </button>
                    ))}
                    {/* Admin Button - always red, smaller */}
                     <button
                        key='admin'
                        onClick={() => setActiveTab('admin')}
                        className={`
                          flex items-center p-2 rounded-lg text-sm font-medium transition duration-300
                          ${activeTab === 'admin'
                            ? 'text-red-400 bg-gray-800 shadow-inner ring-2 ring-red-400'
                            : 'text-red-500 hover:text-red-300 hover:bg-gray-800'
                          }
                        `}
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                  </nav>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 text-gray-300 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-${ACCENT_RED}`}>
                      {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Dropdown */}
              {isMenuOpen && (
                <div className={`md:hidden bg-${BG_DARK} border-t border-gray-700`}>
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setIsMenuOpen(false);
                      }}
                      className={`
                        block w-full text-left px-4 py-3 text-lg font-medium transition duration-300
                        ${item.key === 'admin'
                          ? 'bg-red-900 text-white hover:bg-red-800'
                          : activeTab === item.key
                            ? `bg-${ACCENT_RED} text-white`
                            : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto pb-16">
              {renderContent()}
            </main>

            {/* FOOTER */}
            <footer className={`bg-${BG_DARK}/90 border-t border-gray-700 py-6`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} {EVENT_NAME}. All Rights Reserved.</p>
                <p className="mt-1 flex items-center justify-center">Powered by <Heart className={`w-3 h-3 ml-1 text-${ACCENT_RED}`} /></p>
              </div>
            </footer>
          </div>
        </div>
    </FirebaseProvider>
  );
}