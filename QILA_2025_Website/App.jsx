import React, { useState, useEffect } from 'react';
import { Home, Trophy, BarChart3, Image, Phone, Speaker, Menu, X, Calendar, MapPin, Heart } from 'lucide-react';

// --- CONFIGURATION ---

// VERIFIED CONTENT FETCH IDS for the images
const LOGO_IMAGE_URL = 'uploaded:LOGO.jpeg-306f70c0-0ef6-46f4-ae99-dc4b4fb57607'; 
const EVENT_NAME_IMAGE_URL = 'uploaded:EVENT NAME.jpeg-e353dcc5-fbf3-491a-86d0-04a844a09585';
const BACKGROUND_IMAGE_URL = 'uploaded:BAGROUND.jpg-36499cef-5a62-4e2c-8951-2081562e7c41'; // Using the latest ID from history

// Color scheme (Red and Green accents on Dark background, implied from the logo colors)
const ACCENT_RED = 'red-500';
const ACCENT_GREEN = 'green-500';
const BG_DARK = 'gray-900';
const CARD_DARK = 'gray-800';

const EVENT_NAME = "QILA 2025";
const EVENT_DATE = "2025 ഒക്ടോബർ 19-22";
const EVENT_VENUE = "മെഡിക്കൽ കോളേജ്, കോട്ടയം";

// --- UTILITY COMPONENTS ---

/**
 * Implements the required splash screen (LOGO appears first, then fades out).
 */
const SplashScreen = ({ onFadeOut }) => {
    const [isFaded, setIsFaded] = useState(false);

    useEffect(() => {
        // Wait 1.5 seconds, then start the fade transition
        const timer = setTimeout(() => {
            setIsFaded(true);
            // Wait for the transition (1 second), then call the parent callback
            const fadeTimer = setTimeout(onFadeOut, 1000); 
            return () => clearTimeout(fadeTimer);
        }, 1500); 
        
        return () => clearTimeout(timer);
    }, [onFadeOut]);

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center transition-opacity duration-1000 z-[100]`}
            style={{ 
                backgroundColor: `#111827`, // Dark background for contrast
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

/**
 * Content placeholder for the required navigation pages.
 */
const ContentPlaceholder = ({ title, icon: Icon, description }) => (
    <div className="p-10 max-w-4xl mx-auto text-center bg-gray-800/80 backdrop-blur-sm rounded-2xl mt-8 shadow-xl border-t-4 border-gray-700">
        <Icon className={`w-10 h-10 mx-auto mb-3 text-${ACCENT_RED}`} />
        <h2 className={`text-3xl font-bold text-${ACCENT_GREEN} mb-2`}>{title}</h2>
        <p className="text-gray-400 mt-4">{description}</p>
        <p className="text-sm text-gray-500 mt-2">*(Proof of Concept Content)*</p>
    </div>
);


// --- VIEW COMPONENTS ---

/**
 * The main landing page, featuring the EVENT NAME image.
 */
const HomeContent = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className={`text-center mb-12 py-10 bg-${CARD_DARK}/70 rounded-2xl shadow-2xl backdrop-blur-sm border-b-4 border-${ACCENT_RED}`}>
        
        <h1 className="text-3xl font-extrabold text-white mb-2">{EVENT_NAME}</h1>
        <p className="text-lg text-gray-400 mb-8">Cultural Festival 2025</p>

        {/* Event Name as the Design Element */}
        <div className="mb-8 p-4">
          <img 
            src={EVENT_NAME_IMAGE_URL} 
            alt="Event Name Design" 
            className="w-full max-w-sm md:max-w-md mx-auto h-auto object-contain rounded-lg shadow-lg"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x100/1f2937/ffffff?text=EVENT+NAME`; }}
          />
        </div>
        
        {/* Event Details */}
        <div className="space-y-3 max-w-md mx-auto p-4 rounded-lg bg-gray-700/50">
          <div className={`flex items-center justify-center text-gray-200`}>
            <Calendar className={`w-5 h-5 text-${ACCENT_GREEN} mr-3 shrink-0`} />
            <span className="font-semibold text-xl">{EVENT_DATE}</span>
          </div>
          <div className={`flex items-center justify-center text-gray-200`}>
            <MapPin className={`w-5 h-5 text-${ACCENT_GREEN} mr-3 shrink-0`} />
            <span className="text-lg">{EVENT_VENUE}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const navItems = [
    { name: 'Home', key: 'home', icon: Home, title: 'Welcome' },
    { name: 'Scorecard', key: 'scoreboard', icon: Trophy, title: 'Live Scorecard', description: 'Real-time standings for the current competitions.' },
    { name: 'Results', key: 'results', icon: BarChart3, title: 'Final Results', description: 'Official final results and category winners will be posted here.' },
    { name: 'Gallery', key: 'gallery', icon: Image, title: 'Photo Gallery', description: 'Browse photos and videos from all event days.' },
    { name: 'Announcements', key: 'announcements', icon: Speaker, title: 'Announcements', description: 'Check here for important updates, schedule changes, and live messages.' },
    { name: 'Contact Details', key: 'contacts', icon: Phone, title: 'Contact Details', description: 'Find organizing committee contacts and support information.' },
  ];

  const handleFadeOut = () => setShowSplash(false);

  const renderContent = () => {
    const item = navItems.find(i => i.key === activeTab);

    if (activeTab === 'home') return <HomeContent />;
    
    return (
        <ContentPlaceholder 
            title={item.title} 
            icon={item.icon} 
            description={item.description}
        />
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Apply BAGROUND.jpg with a dark overlay (transparency/subtlety achieved via bg-dark/80 on the main container)
  const backgroundStyle = {
    backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className={`min-h-screen font-sans text-white`} style={backgroundStyle}>
      {/* 1. SPLASH SCREEN */}
      {showSplash && <SplashScreen onFadeOut={handleFadeOut} />}
      
      {/* 2. SEMI-TRANSPARENT OVERLAY (makes background image subtle) */}
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
              <nav className="hidden md:flex space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`
                      flex items-center p-2 rounded-xl text-sm font-medium transition duration-300
                      ${activeTab === item.key
                        ? `text-${ACCENT_GREEN} bg-gray-800 shadow-inner ring-2 ring-${ACCENT_GREEN}`
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </button>
                ))}
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
                    ${activeTab === item.key
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
            <p>&copy; {new Date().getFullYear()} {EVENT_NAME}.</p>
            <p className="mt-1 flex items-center justify-center">Designed with <Heart className={`w-3 h-3 ml-1 text-${ACCENT_RED}`} /></p>
          </div>
        </footer>
      </div>
    </div>
  );
}
