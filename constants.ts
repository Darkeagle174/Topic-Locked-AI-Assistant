import { AppConfig, ThemeConfig } from './types';

// ==================================================================================
// 1. THEME DEFINITIONS
//    Preset styles with colors and background images for specific topics.
// ==================================================================================

export const THEMES: Record<string, ThemeConfig> = {
  trains: {
    primaryColor: '#0ea5e9', // Sky-500
    secondaryColor: '#0f172a', // Slate-900
    accentColor: '#e0f2fe', // Sky-100
    backgroundColor: '#f8fafc', // Slate-50
    backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.pexels.com/photos/31175301/pexels-photo-31175301.jpeg?_gl=1*1xlci0u*_ga*MTg1NTI5OTI1LjE3MTU3NDM2NDY.*_ga_8JE65Q40S6*czE3NjQwODA0NjUkbzQ0JGcxJHQxNzY0MDgwNzMwJGo1MCRsMCRoMA..',
    keywords: ['train', 'railroad', 'locomotive', 'steam engine', 'track', 'subway', 'station', 'conductor', 'cargo', 'freight', 'ticket', 'journey', 'express', 'platform', 'railways', 'railway network']
  },
  dogs: {
    primaryColor: '#ea580c', // Orange-600
    secondaryColor: '#431407', // Brown-950
    accentColor: '#ffedd5', // Orange-100
    backgroundColor: '#fff7ed', // Orange-50
    backgroundImage: 'radial-gradient(#fdba74 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1600&q=80',
    keywords: ['dog', 'puppy', 'bark', 'breed', 'canine', 'pet', 'tail', 'bone', 'walk', 'grooming', 'fur', 'paw', 'fetch', 'leash']
  },
  space: {
    primaryColor: '#9333ea', // Purple-600
    secondaryColor: '#1e1b4b', // Indigo-950
    accentColor: '#f3e8ff', // Purple-100
    backgroundColor: '#faf5ff', // Purple-50
    backgroundImage: 'radial-gradient(#d8b4fe 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    keywords: ['space', 'planet', 'star', 'galaxy', 'universe', 'rocket', 'nasa', 'moon', 'orbit', 'astronaut', 'mars', 'black hole', 'telescope', 'alien']
  },
  nature: {
    primaryColor: '#16a34a', // Green-600
    secondaryColor: '#064e3b', // Emerald-950
    accentColor: '#dcfce7', // Green-100
    backgroundColor: '#f0fdf4', // Green-50
    backgroundImage: 'radial-gradient(#86efac 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    keywords: ['nature', 'tree', 'flower', 'mountain', 'river', 'forest', 'animal', 'environment', 'sea', 'ocean', 'wildlife', 'rain', 'sun', 'earth']
  },
  tech: {
    primaryColor: '#06b6d4', // Cyan-500
    secondaryColor: '#083344', // Cyan-950
    accentColor: '#cffafe', // Cyan-100
    backgroundColor: '#ecfeff', // Cyan-50
    backgroundImage: 'radial-gradient(#67e8f9 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    keywords: ['technology', 'computer', 'software', 'hardware', 'internet', 'robot', 'ai', 'programming', 'code', 'future', 'cyber', 'digital', 'network', 'data']
  },
  history: {
    primaryColor: '#d97706', // Amber-600
    secondaryColor: '#451a03', // Amber-950
    accentColor: '#fef3c7', // Amber-100
    backgroundColor: '#fffbeb', // Amber-50
    backgroundImage: 'radial-gradient(#fcd34d 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1600&q=80',
    keywords: ['history', 'ancient', 'war', 'past', 'century', 'king', 'queen', 'empire', 'civilization', 'artifact', 'museum', 'archaeology', 'era', 'revolution']
  },
  default: {
    primaryColor: '#6366f1', // Indigo-500
    secondaryColor: '#1e293b', // Slate-800
    accentColor: '#e0e7ff', // Indigo-100
    backgroundColor: '#f8fafc', // Slate-50
    backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)',
    chatBackgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80',
    keywords: []
  }
};

// ==================================================================================
// 2. CONSTANTS & HELPERS
// ==================================================================================

export const AVAILABLE_TOPICS = [
  "Trains", "Dogs", "Space", "Nature", "Tech", "History"
];

export const getAutoTheme = (topic: string): ThemeConfig => {
  const t = topic.toLowerCase();

  if (t.includes('train') || t.includes('rail') || t.includes('subway') || t.includes('locomotive')) {
    return THEMES.trains;
  }
  if (t.includes('dog') || t.includes('puppy') || t.includes('canine') || t.includes('animal') || t.includes('pet')) {
    return THEMES.dogs;
  }
  if (t.includes('space') || t.includes('star') || t.includes('planet') || t.includes('galaxy') || t.includes('universe')) {
    return THEMES.space;
  }
  if (t.includes('nature') || t.includes('plant') || t.includes('forest') || t.includes('tree') || t.includes('flower')) {
    return THEMES.nature;
  }
  if (t.includes('tech') || t.includes('computer') || t.includes('ai') || t.includes('robot') || t.includes('code')) {
    return THEMES.tech;
  }
  if (t.includes('history') || t.includes('ancient') || t.includes('past') || t.includes('war')) {
    return THEMES.history;
  }

  return THEMES.default;
};

export const generateConfig = (topic: string): AppConfig => {
  return {
    topic: topic,
    topicDescription: `Anything related to ${topic}.`,
    assistantName: `${topic} Assistant`,
    theme: getAutoTheme(topic)
  };
};

// Default initial config
export const CONFIG = generateConfig("Trains");