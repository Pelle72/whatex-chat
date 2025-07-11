import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SetupPage } from './pages/setup/SetupPage';
import { ChatPage } from './pages/chat/ChatPage';
import { ContactsPage } from './pages/contacts/ContactsPage';
import { ChatsListPage } from './pages/chats/ChatsListPage';
import { TestPage } from './pages/test/TestPage';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Auto-save functionality when user navigates away or closes tab
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save any pending data here if needed
      console.log('App is closing, auto-saving...');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('App went to background, auto-saving...');
        // Auto-save when app goes to background
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      <div className="min-h-screen whatsapp-bg">
        <Routes>
          <Route path="/" element={<ContactsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/chats/:contactId" element={<ChatsListPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/test" element={<TestPage />} />
          {/* Legacy route for old localStorage-based chats */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
