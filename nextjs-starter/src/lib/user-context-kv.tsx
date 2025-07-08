'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTelegramWebApp, TelegramUser } from './telegram';
import { ReferralNotification } from '../components/ReferralNotification';
import * as kvStore from './kv-store';

// Статические данные для элементов и артефактов (раньше были в БД)
const STATIC_DATA = {
  artifacts: {
    'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f': {
      id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
      name: 'Жемчужина Чуткости',
      description: 'Первый артефакт стихии Воды',
      icon_url: '/images/artifacts/pearl.jpg',
      rarity: 'common',
      light_value: 10,
    },
  } as Record<string, {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    rarity: string;
    light_value: number;
  }>,
};

// Расширяем тип UserArtifact для включения данных артефакта
interface UserArtifactWithData extends kvStore.UserArtifact {
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
  user: kvStore.UserData | null;
  telegramUser: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Progress tracking
  missionProgress: kvStore.MissionProgress[];
  userArtifacts: UserArtifactWithData[];
  
  // Actions
  updateUserProgress: (missionId: string, progress: Partial<kvStore.MissionProgress>) => Promise<void>;
  completeMission: (missionId: string) => Promise<any>;
  refreshUserData: () => Promise<void>;
  sendLight: (toUserId: number, amount: number) => Promise<{ success: boolean; error?: string; limitInfo?: DailyLimitInfo }>;
  handleReferral: (referrerId: number) => Promise<boolean>;
  
  // UI helpers
  getMissionProgress: (missionId: string) => kvStore.MissionProgress | null;
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
  const [user, setUser] = useState<kvStore.UserData | null>(null);
  const [missionProgress, setMissionProgress] = useState<kvStore.MissionProgress[]>([]);
  const [userArtifacts, setUserArtifacts] = useState<UserArtifactWithData[]>([]);
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

  // Initialize or update user
  const initializeUser = async (tgUser: TelegramUser) => {
    try {
      // Check if user exists
      let userData = await kvStore.getUser(tgUser.id);

      if (userData) {
        // Update existing user with latest Telegram data
        userData = await kvStore.updateUser(tgUser.id, {
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          language_code: tgUser.language_code || 'ru',
          last_activity: new Date().toISOString(),
        }) || userData;
      } else {
        // Create new user
        userData = await kvStore.createUser({
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          language_code: tgUser.language_code || 'ru',
          current_element_id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', // Default to Water
          light_balance: 100,
          level: 1,
          total_missions_completed: 0,
          total_meditation_minutes: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Initialize mission progress for new user
        const missions = ['d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e'];
        for (const missionId of missions) {
          await kvStore.updateMissionProgress(tgUser.id, missionId, {
            status: 'not_started',
            progress_percentage: 0,
            current_step: 0,
            total_steps: 5,
            time_spent_seconds: 0,
            attempts: 0,
          });
        }
      }

      setUser(userData);
    } catch (error) {
      console.error('Error initializing user:', error);
      alert('Ошибка инициализации пользователя: ' + error);
    }
  };

  // Load user progress data
  const loadUserData = async (userId: number) => {
    try {
      // Load mission progress
      const progress = await kvStore.getUserProgress(userId);
      setMissionProgress(progress);

      // Load user artifacts and enrich with static data
      const artifacts = await kvStore.getUserArtifacts(userId);
      const enrichedArtifacts: UserArtifactWithData[] = artifacts.map(a => ({
        ...a,
        artifact: STATIC_DATA.artifacts[a.artifact_id] || {
          id: a.artifact_id,
          name: 'Unknown Artifact',
          description: '',
          icon_url: '',
          rarity: 'common',
          light_value: 0,
        },
      }));
      setUserArtifacts(enrichedArtifacts);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Ошибка загрузки данных: ' + error);
    }
  };

  // Update mission progress
  const updateUserProgress = async (missionId: string, progress: Partial<kvStore.MissionProgress>) => {
    if (!user) return;

    try {
      // Получаем текущее значение time_spent_seconds для миссии
      const current = missionProgress.find(p => p.mission_id === missionId);
      const prevTime = current?.time_spent_seconds || 0;
      const newTime = progress.time_spent_seconds ?? prevTime;
      const deltaSeconds = newTime - prevTime;
      const deltaMinutes = Math.floor(deltaSeconds / 60);

      const updatedProgress = await kvStore.updateMissionProgress(user.id, missionId, progress);
      
      if (updatedProgress) {
        // Update local state
        setMissionProgress(prev =>
          prev.map(p => p.mission_id === missionId ? updatedProgress : p)
        );

        // Update user's total meditation time только на дельту
        if (deltaMinutes > 0) {
          const updatedUser = await kvStore.updateUser(user.id, {
            total_meditation_minutes: user.total_meditation_minutes + deltaMinutes,
            last_activity: new Date().toISOString(),
          });

          if (updatedUser) {
            setUser(updatedUser);
          }
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error);
      alert('Ошибка обновления прогресса: ' + errMsg);
    }
  };

  // Complete mission
  const completeMission = async (missionId: string) => {
    if (!user) return null;

    try {
      const result = await kvStore.completeMission(user.id, missionId);
      
      // Refresh user data to get updated stats
      await refreshUserData();
      
      return result;
    } catch (error) {
      console.error('Error completing mission:', error);
      return null;
    }
  };

  // Refresh all user data
  const refreshUserData = async () => {
    if (!telegramUser) return;

    try {
      const userData = await kvStore.getUser(telegramUser.id);
      if (userData) {
        setUser(userData);
        await loadUserData(telegramUser.id);
      }
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
    if (!user) {
      console.log(`❌ [CLIENT] No user found for referral processing`);
      return false;
    }

    if (!telegramUser) {
      console.log(`❌ [CLIENT] No telegram user found for referral processing`);
      return false;
    }

    try {
      console.log(`🎁 [CLIENT] Calling handleReferralBonus: ${referrerId} -> ${user.id}`);
      console.log(`👤 [CLIENT] Current user state:`, { id: user.id, name: user.first_name, balance: user.light_balance });
      
      const success = await kvStore.handleReferralBonus(referrerId, user.id);
      console.log(`📊 [CLIENT] handleReferralBonus result:`, success);

      if (success) {
        // Get referrer info for notification
        const referrerData = await kvStore.getUser(referrerId);

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

  // Get daily light sending info (simplified for now)
  const getDailyLightSent = async (): Promise<DailyLimitInfo> => {
    // TODO: Implement daily limit tracking in KV
    return {
      dailySent: 0,
      dailyLimit: 50,
      remainingToday: 50,
      canSend: true
    };
  };

  // Send light to friend
  const sendLight = async (toUserId: number, amount: number): Promise<{ success: boolean; error?: string; limitInfo?: DailyLimitInfo }> => {
    if (!user) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    try {
      const result = await kvStore.sendLight(user.id, toUserId, amount);

      if (result.success) {
        // Get receiver data for notification
        const receiverData = await kvStore.getUser(toUserId);

        // Update local state
        setUser(prev => prev ? { ...prev, light_balance: prev.light_balance - amount } : null);

        // Show notification
        if (receiverData) {
          const receiverName = `${receiverData.first_name} ${receiverData.last_name || ''}`.trim();
          showReferralNotification(amount, receiverName, receiverData.photo_url, 'sent');
        }

        const limitInfo = await getDailyLightSent();
        return { success: true, limitInfo };
      }

      return result;
    } catch (error) {
      console.error('Error sending light:', error);
      return { success: false, error: 'Ошибка при отправке света' };
    }
  };

  // Helper functions
  const getMissionProgress = (missionId: string): kvStore.MissionProgress | null => {
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
        return loadUserData(telegramUser.id);
      }).then(() => {
        console.log('User data loaded, setting isLoading to false');
        setIsLoading(false);
        
        // Check for referral parameters in URL AFTER user is fully initialized
        if (typeof window !== 'undefined') {
          console.log('🔍 Checking for referral parameters...');
          console.log('🌐 Current URL:', window.location.href);
          console.log('🔗 Search params:', window.location.search);
          const urlParams = new URLSearchParams(window.location.search);
          console.log('📋 All URL params:', Object.fromEntries(urlParams.entries()));
          
          const referrerId = urlParams.get('referrer');
          console.log('👥 Referrer ID from URL:', referrerId);
          console.log('🆔 Current user ID:', telegramUser.id.toString());
          
          if (referrerId && referrerId !== telegramUser.id.toString()) {
            console.log('🎁 Processing referral from:', referrerId);
            // Add a small delay to ensure user state is fully updated
            setTimeout(() => {
              handleReferral(parseInt(referrerId)).then((success) => {
                if (success) {
                  console.log('✅ Referral processed successfully');
                } else {
                  console.log('❌ Referral processing failed or already exists');
                }
              });
            }, 100);
          } else {
            console.log('❌ No valid referral found or self-referral');
          }
        }
      }).catch((error) => {
        console.error('Error during user initialization:', error);
        setIsLoading(false);
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