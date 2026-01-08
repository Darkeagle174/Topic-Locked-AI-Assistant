import React from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';

const MainLayout: React.FC = () => {
  const { config } = useConfig();
  
  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-500"
      style={{
        backgroundColor: config.theme.backgroundColor,
        backgroundImage: config.theme.backgroundImage,
        backgroundSize: '24px 24px'
      }}
    >
      <Header />
      <main className="flex-1 w-full p-0 md:p-6">
        <ChatInterface />
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <MainLayout />
    </ConfigProvider>
  );
};

export default App;
