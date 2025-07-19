'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  addMeditationSeconds: (seconds: number) => Promise<void>;
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
  isMissionAvailable: (missionId: string) => Promise<boolean>;
  unlockMission: (missionId: string, cost: number) => Promise<{ success: boolean; error?: string }>;
  
  // Notification state
  showReferralNotification: (amount: number, friendName: string, friendAvatar?: string, type?: 'received' | 'sent') => void;
  updateUser: (userId: number, updates: Partial<kvStore.UserData>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: telegramUser, isLoading: tgLoading } = useTelegramWebApp();
  const [user, setUser] = useState<kvStore.UserData | null>(null);
  const [missionProgress, setMissionProgress] = useState<kvStore.MissionProgress[]>([]);
  const [userArtifacts, setUserArtifacts] = useState<UserArtifactWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationAmount, setNotificationAmount] = useState(0);
  const [friendName, setFriendName] = useState('');
  const [friendAvatar, setFriendAvatar] = useState<string | undefined>(undefined);
  const [notificationType, setNotificationType] = useState<'received' | 'sent'>('received');

  // Оборачиваем все функции в useCallback для стабильности
  const initializeUser = useCallback(async (tgUser: TelegramUser) => {
    try {
      let userData = await kvStore.getUser(tgUser.id);
      if (userData) {
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
  }, []);

  const loadUserData = useCallback(async (userId: number) => {
    try {
      const progress = await kvStore.getUserProgress(userId);
      setMissionProgress(progress);
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
  }, []);

  const refreshUserData = useCallback(async () => {
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
  }, [telegramUser, loadUserData]);

  const showReferralNotification = useCallback((amount: number, friendName: string, friendAvatar?: string, type: 'received' | 'sent' = 'received') => {
    setNotificationAmount(amount);
    setFriendName(friendName);
    setFriendAvatar(friendAvatar);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleReferral = useCallback(async (referrerId: number): Promise<boolean> => {
    if (!telegramUser) {
      console.log(`❌ [CLIENT] No telegram user found for referral processing`);
      return false;
    }

    try {
      // Get user data directly from store instead of relying on React state
      const currentUser = await kvStore.getUser(telegramUser.id);
      if (!currentUser) {
        console.log(`❌ [CLIENT] No user found in database for ID: ${telegramUser.id}`);
        return false;
      }

      console.log(`🎁 [CLIENT] Calling handleReferralBonus: ${referrerId} -> ${currentUser.id}`);
      console.log(`👤 [CLIENT] Current user from DB:`, { id: currentUser.id, name: currentUser.first_name, balance: currentUser.light_balance });
      
      const success = await kvStore.handleReferralBonus(referrerId, currentUser.id);
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
  }, [telegramUser, refreshUserData, showReferralNotification]);

  // Основной useEffect для инициализации
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
  }, [telegramUser, tgLoading, initializeUser, loadUserData, handleReferral]);

  // Update mission progress
  const updateUserProgress = async (missionId: string, progress: Partial<kvStore.MissionProgress>) => {
    if (!user) return;

    try {
      const updatedProgress = await kvStore.updateMissionProgress(user.id, missionId, progress);
      
      if (updatedProgress) {
        // Update local state
        setMissionProgress(prev => {
          const exists = prev.some(p => p.mission_id === missionId);
          if (exists) {
            return prev.map(p => p.mission_id === missionId ? updatedProgress : p);
          } else {
            return [...prev, updatedProgress];
          }
        });

        // Обновляем данные пользователя только если изменилась активность
        if (progress.last_activity) {
          const updatedUser = await kvStore.updateUser(user.id, {
            last_activity: progress.last_activity,
          });
          if (updatedUser) {
            setUser(updatedUser);
          }
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Add meditation seconds
  const addMeditationSeconds = async (seconds: number) => {
    if (!user || seconds <= 0) return;
    
    const newTotalMinutes = user.total_meditation_minutes + Math.floor(seconds / 60);
    if (newTotalMinutes > user.total_meditation_minutes) {
      console.log(`📈 [CLIENT] Adding ${seconds} seconds. New total minutes: ${newTotalMinutes}`);
      const updatedUser = await kvStore.updateUser(user.id, {
        total_meditation_minutes: newTotalMinutes,
      });
      if (updatedUser) {
        setUser(updatedUser);
      }
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

  // Get daily light sending info
  const getDailyLightSent = async (): Promise<DailyLimitInfo> => {
    if (!user) {
      return {
        dailySent: 0,
        dailyLimit: 50,
        remainingToday: 50,
        canSend: true
      };
    }
    
    try {
      return await kvStore.getDailyLightSent(user.id);
    } catch (error) {
      console.error('Error getting daily light sent:', error);
      return {
        dailySent: 0,
        dailyLimit: 50,
        remainingToday: 50,
        canSend: true
      };
    }
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

  // Обновление пользователя (например, баланс)
  const updateUser = async (userId: number, updates: Partial<kvStore.UserData>) => {
    try {
      const updatedUser = await kvStore.updateUser(userId, updates);
      if (updatedUser) {
        setUser(updatedUser);
        await loadUserData(userId);
      }
    } catch (error) {
      console.error('Error updating user:', error);
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
    // All missions after the first one cost 100 light
    return 100;
  };

  const isMissionAvailable = useCallback(async (missionId: string): Promise<boolean> => {
    if (!user) return false;
    return await kvStore.isMissionAvailable(user.id, missionId);
  }, [user]);

  const unlockMission = useCallback(async (missionId: string, cost: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Пользователь не найден' };
    
    console.log(`🔓 [CLIENT] Unlocking mission ${missionId}. Cost: ${cost}, User balance: ${user.light_balance}`);
    
    if (user.light_balance < cost) {
      return { success: false, error: `Недостаточно света. Нужно: ${cost}, есть: ${user.light_balance}` };
    }

    try {
      // Списываем свет
      const updatedUser = await kvStore.updateUser(user.id, {
        light_balance: user.light_balance - cost
      });

      if (!updatedUser) {
        return { success: false, error: 'Ошибка при списании света' };
      }

      console.log(`💰 [CLIENT] Light deducted. New balance: ${updatedUser.light_balance}`);

      // Разблокируем миссию
      await kvStore.addAvailableMission(user.id, missionId);

      // Инициализируем прогресс миссии
      await updateUserProgress(missionId, {
        status: 'not_started',
        progress_percentage: 0,
        current_step: 0,
        total_steps: 6,
        time_spent_seconds: 0,
        attempts: 0,
      });

      // Обновляем локальное состояние
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Error unlocking mission:', error);
      return { success: false, error: 'Ошибка при разблокировке миссии' };
    }
  }, [user, updateUserProgress]);

  const value: UserContextType = {
    user,
    telegramUser,
    isLoading: isLoading || tgLoading,
    isAuthenticated: !!user,
    missionProgress,
    userArtifacts,
    updateUserProgress,
    addMeditationSeconds,
    completeMission,
    refreshUserData,
    sendLight,
    handleReferral,
    getMissionProgress,
    hasArtifact,
    canAfford,
    getNextMissionCost,
    getDailyLightSent,
    isMissionAvailable,
    unlockMission,
    showReferralNotification,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      <ReferralNotification
        show={showNotification}
        amount={notificationAmount}
        friendName={friendName}
        friendAvatar={friendAvatar}
        type={notificationType}
        onClose={() => setShowNotification(false)}
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