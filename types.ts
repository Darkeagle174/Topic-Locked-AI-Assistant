export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ThemeConfig {
  primaryColor: string;      // Main brand color (buttons, bot avatar, highlights)
  secondaryColor: string;    // Secondary color (user bubbles, dark accents)
  accentColor: string;       // Light accent (backgrounds for icons)
  backgroundColor: string;   // Main app background color
  backgroundImage?: string;  // CSS value for background (url or gradient)
  chatBackgroundImage?: string; // URL for the specific topic image inside the chat box
  keywords: string[];        // List of keywords for TFJS topic validation
}

export interface AppConfig {
  topic: string;
  topicDescription: string;
  assistantName: string;
  theme: ThemeConfig;
}