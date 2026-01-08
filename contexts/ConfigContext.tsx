import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig } from '../types';
import { generateConfig, AVAILABLE_TOPICS } from '../constants';

interface ConfigContextType {
  config: AppConfig;
  setTopic: (topic: string) => void;
  availableTopics: string[];
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTopic, setCurrentTopic] = useState<string>("Trains");
  const config = generateConfig(currentTopic);

  const setTopic = (topic: string) => {
    setCurrentTopic(topic);
  };

  return (
    <ConfigContext.Provider value={{ config, setTopic, availableTopics: AVAILABLE_TOPICS }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
