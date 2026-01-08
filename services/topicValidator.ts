import { ThemeConfig } from '../types';

// We define a minimal interface for the encoder to avoid hard dependency on the types
interface UniversalSentenceEncoder {
  embed(inputs: string[]): Promise<{
    array(): Promise<number[][]>;
    dispose(): void;
  }>;
}

// Singleton for the model
let model: UniversalSentenceEncoder | null = null;
let modelLoadingPromise: Promise<UniversalSentenceEncoder | null> | null = null;
let modelLoadFailed = false;

/**
 * Loads the TensorFlow model using dynamic imports.
 * This prevents the entire app from crashing if the TFJS CDN is blocked or fails.
 */
export const loadModel = async (): Promise<UniversalSentenceEncoder | null> => {
  if (model) return model;
  if (modelLoadFailed) return null;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = new Promise(async (resolve) => {
    try {
      console.log('Loading TensorFlow USE model...');
      
      // DYNAMIC IMPORTS: Critical for app stability
      // We explicitly cast to any to avoid TypeScript compilation issues with CDN imports
      const tf = await import('@tensorflow/tfjs') as any;
      const use = await import('@tensorflow-models/universal-sentence-encoder') as any;

      await tf.ready();
      const loadedModel = await use.load();
      
      model = loadedModel;
      console.log('TensorFlow USE model loaded successfully.');
      resolve(model);
    } catch (error) {
      console.warn('Failed to load TensorFlow model. Falling back to keyword validation.', error);
      modelLoadFailed = true;
      resolve(null);
    }
  });

  return modelLoadingPromise;
};

// Basic greetings and common words that should always pass validation
const ALWAYS_ALLOWED = [
  'hello', 'hi', 'hey', 'greetings', 'bye', 'goodbye', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no', 'what', 'who', 'how', 'why', 'help'
];

/**
 * Calculates cosine similarity between two vectors.
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  // USE vectors are normalized, so we don't need to divide by magnitude
  return dotProduct;
};

/**
 * Fallback validation using strict keyword matching.
 * Used when TFJS model fails to load.
 */
const fallbackValidation = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  
  // 1. If strict keyword match found
  if (keywords.some(k => lowerText.includes(k.toLowerCase()))) {
    return true;
  }

  // 2. Count overlapping words (simple bag-of-words)
  const textWords = lowerText.split(/\W+/); // Split by non-word chars
  const keywordParts = keywords.flatMap(k => k.toLowerCase().split(/\W+/));
  
  const matchCount = textWords.filter(w => w.length > 3 && keywordParts.includes(w)).length;
  
  // If we found at least one significant matching word, we allow it to pass to the LLM
  // The LLM system instruction acts as the final gatekeeper.
  return matchCount > 0;
};

/**
 * Checks if the input text is semantically relevant to the topic keywords.
 * Includes a strict timeout to prevent UI hanging.
 */
export const isTopicRelevant = async (text: string, topicKeywords: string[], threshold = 0.5): Promise<boolean> => {
  const TIMEOUT_MS = 3000; // 3 seconds max for validation

  const validationPromise = (async () => {
    const lowerText = text.toLowerCase();
  
    // 1. Quick pass: Allow very short greetings or exact matches
    if (ALWAYS_ALLOWED.some(word => lowerText === word || lowerText.startsWith(word + ' '))) {
      return true;
    }
    
    // 2. Quick pass: Check for direct keyword inclusion (fastest check)
    if (topicKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return true;
    }

    try {
      const encoder = await loadModel();
      
      // If model failed to load, use smart fallback
      if (!encoder) {
        return fallbackValidation(text, topicKeywords);
      }
      
      // Embed user text and all keywords
      // Note: If topicKeywords is very large, this can be slow. 
      // Ideally, we would cache the keyword embeddings, but for <50 keywords it should be fast enough.
      const sentences = [text, ...topicKeywords];
      const embeddings = await encoder.embed(sentences);
      const embeddingsData = await embeddings.array();
      
      const userVector = embeddingsData[0];
      const keywordVectors = embeddingsData.slice(1);
      
      // Find the maximum similarity with any of the keywords
      let maxSimilarity = -1;
      
      for (const keyVector of keywordVectors) {
        const similarity = cosineSimilarity(userVector, keyVector);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }
      
      embeddings.dispose();
      
      console.log(`Topic Relevance Score: ${maxSimilarity.toFixed(4)} (Threshold: ${threshold})`);
      
      return maxSimilarity > threshold;
      
    } catch (error) {
      console.error("Error during topic validation:", error);
      // Final failsafe: if everything crashes, let the LLM handle it
      return true; 
    }
  })();

  // Race condition: If validation takes too long, we assume true and let the LLM handle it
  // This prevents the "stuck" state the user reported.
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn("Topic validation timed out - defaulting to ALLOW");
      resolve(true);
    }, TIMEOUT_MS);
  });

  return Promise.race([validationPromise, timeoutPromise]);
};