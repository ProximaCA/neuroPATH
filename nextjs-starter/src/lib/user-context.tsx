'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTelegramWebApp, TelegramUser } from './telegram';
import { supabase } from './supabase';
import { ReferralNotification } from '../components/ReferralNotification';

// Enhanced user data from database
export interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code: string;
  current_element_id?: string;
  light_balance: number;
  level: number;
  total_missions_completed: number;
  total_meditation_minutes: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface MissionProgress {
  id: string;
  user_id: number;
  mission_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_step: number;
  total_steps: number;
  time_spent_seconds: number;
  attempts: number;
  started_at?: string;
  completed_at?: string;
  last_activity: string;
}

export interface UserArtifact {
  id: string;
  user_id: number;
  artifact_id: string;
  acquired_at: string;
  source: string;
  artifact: {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    rarity: string;
    light_value: number;
  };
}

interface DailyLimitInfo {
  dailySent: number;
  dailyLimit: number;
  remainingToday: number;
  canSend: boolean;
}

interface UserContextType {
  user: UserData | null;
  telegramUser: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Progress tracking
  missionProgress: MissionProgress[];
  userArtifacts: UserArtifact[];
  
  // Actions
  updateUserProgress: (missionId: string, progress: Partial<MissionProgress>) => Promise<void>;
  completeMission: (missionId: string) => Promise<any>;
  refreshUserData: () => Promise<void>;
  sendLight: (toUserId: number, amount: number) => Promise<{ success: boolean; error?: string; limitInfo?: DailyLimitInfo }>;
  handleReferral: (referrerId: number) => Promise<boolean>;
  
  // UI helpers
  getMissionProgress: (missionId: string) => MissionProgress | null;
  hasArtifact: (artifactId: string) => boolean;
  canAfford: (amount: number) => boolean;
  getNextMissionCost: (currentMissionId: string) => number;
  getDailyLightSent: () => Promise<DailyLimitInfo>;
  
  // Notification state
  showReferralNotification: (amount: number, friendName: string, friendAvatar?: string, type?: 'received' | 'sent') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: telegramUser, isLoading: tgLoading } = useTelegramWebApp();
  const [user, setUser] = useState<UserData | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [userArtifacts, setUserArtifacts] = useState<UserArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notification state
  const [notificationData, setNotificationData] = useState<{
    show: boolean;
    amount: number;
    friendName: string;
    friendAvatar?: string;
    type: 'received' | 'sent';
  }>({
    show: false,
    amount: 0,
    friendName: '',
    type: 'received'
  });

  // Initialize or update user in database
  const initializeUser = async (tgUser: TelegramUser) => {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', tgUser.id)
        .single();

      if (fetchError) {
        console.warn('Supabase connection error:', fetchError);
        // Create fallback user data when Supabase is unavailable
        const fallbackUser: UserData = {
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          language_code: tgUser.language_code || 'ru',
          current_element_id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a',
          light_balance: 100,
          level: 1,
          total_missions_completed: 0,
          total_meditation_minutes: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallbackUser);
        console.log('Using fallback user data due to Supabase error');
        return;
      }

      if (existingUser) {
        // Update existing user with latest Telegram data
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            username: tgUser.username,
            photo_url: tgUser.photo_url,
            language_code: tgUser.language_code || 'ru',
            last_activity: new Date().toISOString(),
          })
          .eq('id', tgUser.id)
          .select()
          .single();

        if (updateError) {
          console.warn('Failed to update user, using existing data:', updateError);
          setUser(existingUser);
        } else {
          setUser(updatedUser);
        }
      } else {
        // Try to create new user, but fallback if fails
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            username: tgUser.username,
            photo_url: tgUser.photo_url,
            language_code: tgUser.language_code || 'ru',
            current_element_id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', // Default to Water
          })
          .select()
          .single();

        if (createError) {
          console.warn('Failed to create user in database, using fallback:', createError);
          // Create fallback user
          const fallbackUser: UserData = {
            id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            username: tgUser.username,
            photo_url: tgUser.photo_url,
            language_code: tgUser.language_code || 'ru',
            current_element_id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a',
            light_balance: 100,
            level: 1,
            total_missions_completed: 0,
            total_meditation_minutes: 0,
            streak_days: 0,
            last_activity: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
          return;
        }

        setUser(newUser);

        // Try to initialize mission progress for new user
        try {
          const { data: missions } = await supabase
            .from('missions')
            .select('id')
            .eq('element_id', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a');

          if (missions) {
            const progressData = missions.map(mission => ({
              user_id: tgUser.id,
              mission_id: mission.id,
              status: 'not_started' as const,
              progress_percentage: 0,
              current_step: 0,
              total_steps: 3,
              time_spent_seconds: 0,
              attempts: 0,
            }));

            await supabase
              .from('mission_progress')
              .insert(progressData);
          }
        } catch (progressError) {
          console.warn('Failed to initialize mission progress:', progressError);
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      // Always create fallback user if everything fails
      const fallbackUser: UserData = {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        language_code: tgUser.language_code || 'ru',
        current_element_id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a',
        light_balance: 100,
        level: 1,
        total_missions_completed: 0,
        total_meditation_minutes: 0,
        streak_days: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
      console.log('Using fallback user data due to critical error');
    }
  };

  // Load user progress data
  const loadUserData = async (userId: number) => {
    try {
      // Load mission progress
      const { data: progress, error: progressError } = await supabase
        .from('mission_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.warn('Supabase progress error:', progressError);
        // Create fallback mission progress
        const fallbackProgress: MissionProgress[] = [
          {
            id: '1',
            user_id: userId,
            mission_id: 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d',
            status: 'not_started',
            progress_percentage: 0,
            current_step: 0,
            total_steps: 5,
            time_spent_seconds: 0,
            attempts: 0,
            last_activity: new Date().toISOString(),
          }
        ];
        setMissionProgress(fallbackProgress);
        setUserArtifacts([]);
        console.log('Using fallback progress data');
        return;
      }
      setMissionProgress(progress || []);

      // Load user artifacts
      const { data: artifacts, error: artifactsError } = await supabase
        .from('user_artifacts')
        .select(`
          *,
          artifact:artifacts(*)
        `)
        .eq('user_id', userId);

      if (artifactsError) {
        console.warn('Supabase artifacts error:', artifactsError);
        setUserArtifacts([]);
        return;
      }
      setUserArtifacts(artifacts || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      console.log('Using fallback data due to error');
      // Set fallback data
      setMissionProgress([{
        id: '1',
        user_id: userId,
        mission_id: 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d',
        status: 'not_started',
        progress_percentage: 0,
        current_step: 0,
        total_steps: 5,
        time_spent_seconds: 0,
        attempts: 0,
        last_activity: new Date().toISOString(),
      }]);
      setUserArtifacts([]);
    }
  };

  // Update mission progress
  const updateUserProgress = async (missionId: string, progress: Partial<MissionProgress>) => {
    if (!user) return;

    try {
      // Получаем текущее значение time_spent_seconds для миссии
      const current = missionProgress.find(p => p.mission_id === missionId);
      const prevTime = current?.time_spent_seconds || 0;
      const newTime = progress.time_spent_seconds ?? prevTime;
      const deltaSeconds = newTime - prevTime;
      const deltaMinutes = Math.floor(deltaSeconds / 60);

      const { data, error } = await supabase
        .from('mission_progress')
        .update({
          ...progress,
          last_activity: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('mission_id', missionId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMissionProgress(prev =>
        prev.map(p => p.mission_id === missionId ? data : p)
      );

      // Update user's total meditation time только на дельту
      if (deltaMinutes > 0) {
        await supabase
          .from('users')
          .update({
            total_meditation_minutes: user.total_meditation_minutes + deltaMinutes,
            last_activity: new Date().toISOString(),
          })
          .eq('id', user.id);

        setUser(prev => prev ? {
          ...prev,
          total_meditation_minutes: prev.total_meditation_minutes + deltaMinutes
        } : null);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Показываем ошибку пользователю (можно через alert или state)
      if (typeof window !== 'undefined') {
        const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error);
        alert('Ошибка обновления прогресса: ' + errMsg);
      }
    }
  };

  // Complete mission using database function
  const completeMission = async (missionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .rpc('complete_mission', {
          p_user_id: user.id,
          p_mission_id: missionId
        });

      if (error) throw error;

      // Refresh user data to get updated stats
      await refreshUserData();
      
      return data;
    } catch (error) {
      console.error('Error completing mission:', error);
      return null;
    }
  };

  // Refresh all user data
  const refreshUserData = async () => {
    if (!telegramUser) return;

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', telegramUser.id)
        .single();

      if (error) throw error;
      setUser(userData);

      await loadUserData(telegramUser.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Show referral notification
  const showReferralNotification = (amount: number, friendName: string, friendAvatar?: string, type: 'received' | 'sent' = 'received') => {
    setNotificationData({
      show: true,
      amount,
      friendName,
      friendAvatar,
      type
    });
  };

  // Handle referral system with notification
  const handleReferral = async (referrerId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('handle_referral', {
          p_referrer_id: referrerId,
          p_referred_id: user.id
        });

      if (error) throw error;

      if (data) {
        // Get referrer info for notification
        const { data: referrerData } = await supabase
          .from('users')
          .select('first_name, last_name, photo_url')
          .eq('id', referrerId)
          .single();

        // Show notification
        if (referrerData) {
          const referrerName = `${referrerData.first_name} ${referrerData.last_name || ''}`.trim();
          showReferralNotification(100, referrerName, referrerData.photo_url, 'received');
        }

        // Refresh user data to get updated balance
        await refreshUserData();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling referral:', error);
      return false;
    }
  };

  // Get daily light sending info
  const getDailyLightSent = async (): Promise<DailyLimitInfo> => {
    if (!user) {
      return { dailySent: 0, dailyLimit: 50, remainingToday: 50, canSend: false };
    }

    try {
      const { data, error } = await supabase
        .rpc('get_daily_light_sent', {
          p_user_id: user.id
        });

      if (error) throw error;

      const dailySent = data || 0;
      const dailyLimit = 50;
      const remainingToday = Math.max(0, dailyLimit - dailySent);

      return {
        dailySent,
        dailyLimit,
        remainingToday,
        canSend: remainingToday > 0
      };
    } catch (error) {
      console.error('Error getting daily light sent:', error);
      return { dailySent: 0, dailyLimit: 50, remainingToday: 50, canSend: true };
    }
  };

  // Enhanced sendLight with daily limit check
  const sendLight = async (toUserId: number, amount: number): Promise<{ success: boolean; error?: string; limitInfo?: DailyLimitInfo }> => {
    if (!user) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    try {
      // Use database function with daily limit check
      const { data, error } = await supabase
        .rpc('send_light_to_friend', {
          p_sender_id: user.id,
          p_receiver_id: toUserId,
          p_amount: amount
        });

      if (error) throw error;

      if (!data.success) {
        const limitInfo = data.daily_sent !== undefined ? {
          dailySent: data.daily_sent,
          dailyLimit: data.daily_limit,
          remainingToday: data.daily_limit - data.daily_sent,
          canSend: (data.daily_limit - data.daily_sent) > 0
        } : undefined;

        return { 
          success: false, 
          error: data.error,
          limitInfo
        };
      }

      // Get receiver data for notification
      const { data: receiverData } = await supabase
        .from('users')
        .select('first_name, last_name, photo_url')
        .eq('id', toUserId)
        .single();

      // Update local state
      setUser(prev => prev ? { ...prev, light_balance: prev.light_balance - amount } : null);

      // Show notification
      if (receiverData) {
        const receiverName = `${receiverData.first_name} ${receiverData.last_name || ''}`.trim();
        showReferralNotification(amount, receiverName, receiverData.photo_url, 'sent');
      }

      const limitInfo: DailyLimitInfo = {
        dailySent: data.daily_sent,
        dailyLimit: data.daily_limit,
        remainingToday: data.remaining_today,
        canSend: data.remaining_today > 0
      };

      return { success: true, limitInfo };
    } catch (error) {
      console.error('Error sending light:', error);
      return { success: false, error: 'Ошибка при отправке света' };
    }
  };

  // Helper functions
  const getMissionProgress = (missionId: string): MissionProgress | null => {
    return missionProgress.find(p => p.mission_id === missionId) || null;
  };

  const hasArtifact = (artifactId: string): boolean => {
    return userArtifacts.some(ua => ua.artifact_id === artifactId);
  };

  const canAfford = (amount: number): boolean => {
    return user ? user.light_balance >= amount : false;
  };

  const getNextMissionCost = (currentMissionId: string): number => {
    // All missions after the first one cost 10 light
    return 10;
  };

  // Initialize user when Telegram user is available
  useEffect(() => {
    console.log('UserProvider useEffect triggered', { telegramUser, tgLoading });
    
    if (telegramUser && !tgLoading) {
      console.log('Initializing user with Telegram data:', telegramUser);
      initializeUser(telegramUser).then(() => {
        console.log('User initialized, loading user data...');
        loadUserData(telegramUser.id).finally(() => {
          console.log('User data loaded, setting isLoading to false');
          setIsLoading(false);
          
          // Check for referral parameters in URL
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const referrerId = urlParams.get('referrer');
            if (referrerId && referrerId !== telegramUser.id.toString()) {
              console.log('Processing referral from:', referrerId);
              handleReferral(parseInt(referrerId)).then((success) => {
                if (success) {
                  console.log('Referral processed successfully');
                } else {
                  console.log('Referral processing failed or already exists');
                }
              });
            }
          }
        });
      });
    } else if (!tgLoading) {
      console.log('No Telegram user found, setting isLoading to false');
      setIsLoading(false);
    }
  }, [telegramUser, tgLoading]);

  const value: UserContextType = {
    user,
    telegramUser,
    isLoading: isLoading || tgLoading,
    isAuthenticated: !!user,
    missionProgress,
    userArtifacts,
    updateUserProgress,
    completeMission,
    refreshUserData,
    sendLight,
    handleReferral,
    getMissionProgress,
    hasArtifact,
    canAfford,
    getNextMissionCost,
    getDailyLightSent,
    showReferralNotification,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      <ReferralNotification
        show={notificationData.show}
        amount={notificationData.amount}
        friendName={notificationData.friendName}
        friendAvatar={notificationData.friendAvatar}
        type={notificationData.type}
        onClose={() => setNotificationData(prev => ({ ...prev, show: false }))}
      />
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 