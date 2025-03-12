import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

interface Quote {
  a: string;
  c: string;
  h: string;
  q: string;
}

interface CachedQuotesData {
  quotes: Quote[];
  timestamp: number;
}

const QUOTES_CACHE_KEY = 'cached_quotes';
const CACHE_DURATION = 60 * 60 * 1000 * 24 * 7; // 7 days

export function useRandomQuote() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);

      try {
        const cachedData = await AsyncStorage.getItem(QUOTES_CACHE_KEY);

        if (cachedData) {
          const { quotes, timestamp }: CachedQuotesData = JSON.parse(cachedData);
          const now = Date.now();

          // If cache is still valid (less than 1 hour old)
          if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached quotes');
            setQuotes(quotes);
            setIsLoading(false);
            return;
          }
        }

        console.log('Fetching fresh quotes from API');
        const api_url = 'https://zenquotes.io/api/quotes/';
        const response = await fetch(api_url);

        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const data: Quote[] = await response.json();
        setQuotes(data);

        // Cache the new quotes with current timestamp
        const cacheData: CachedQuotesData = {
          quotes: data,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify(cacheData));

        setError(null);
      } catch (err) {
        setError('Could not load quotes. Please try again later.');
        console.error('Error fetching quotes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const getRandomQuote = useCallback(() => {
    if (quotes && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      return quotes[randomIndex];
    }
    return null;
  }, [quotes]);

  useEffect(() => {
    if (quotes.length > 0 && !currentQuote) {
      getRandomQuote();
    }
  }, [quotes, currentQuote, getRandomQuote]);

  return {
    currentQuote,
    getRandomQuote,
    isLoading,
    error,
    quotes,
  };
}
