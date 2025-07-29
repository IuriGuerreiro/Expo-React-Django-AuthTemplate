import { useState, useEffect, useCallback } from 'react';
import api, { API_ENDPOINTS } from '../config/api';

interface EmailRateLimitHook {
  canSend: boolean;
  timeRemaining: number;
  checkRateLimit: (email: string, requestType?: string) => Promise<void>;
  startCountdown: (seconds: number) => void;
  resetTimer: () => void;
}

interface RateLimitStatus {
  can_send: boolean;
  time_remaining: number;
}

export const useEmailRateLimit = (): EmailRateLimitHook => {
  const [canSend, setCanSend] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: number | null = null;

    if (timeRemaining > 0) {
      setCanSend(false);
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanSend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanSend(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeRemaining]);

  const checkRateLimit = useCallback(async (email: string, requestType: string = 'email_verification') => {
    try {
      const response = await api.post(API_ENDPOINTS.CHECK_EMAIL_RATE_LIMIT, {
        email,
        request_type: requestType,
      });

      const data: RateLimitStatus = response.data;
      setCanSend(data.can_send);
      setTimeRemaining(data.time_remaining);
    } catch (error) {
      // On error, allow sending
      console.log('Rate limit check failed:', error);
      setCanSend(true);
      setTimeRemaining(0);
    }
  }, []);

  const startCountdown = useCallback((seconds: number) => {
    setTimeRemaining(seconds);
    setCanSend(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(0);
    setCanSend(true);
  }, []);

  return {
    canSend,
    timeRemaining,
    checkRateLimit,
    startCountdown,
    resetTimer,
  };
};

export default useEmailRateLimit;