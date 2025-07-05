'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTelegramWebApp, TelegramUser } from './telegram';
import { supabase } from './supabase';

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
  sendLight: (toUserId: number, amount: number) => Promise<boolean>;
  
  // UI helpers
  getMissionProgress: (missionId: string) => MissionProgress | null;
  hasArtifact: (artifactId: string) => boolean;
  canAfford: (amount: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: telegramUser, isLoading: tgLoading } = useTelegramWebApp();
  const [user, setUser] = useState<UserData | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [userArtifacts, setUserArtifacts] = useState<UserArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or update user in database
  const initializeUser = async (tgUser: TelegramUser) => {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', tgUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
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
        console.log('Using fallback user data');
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

        if (updateError) throw updateError;
        setUser(updatedUser);
      } else {
        // Create new user
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

        if (createError) throw createError;
        setUser(newUser);

        // Initialize mission progress for new user
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
      }
    } catch (error) {
      console.error('Error initializing user:', error);
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

      // Update user's total meditation time if time was spent
      if (progress.time_spent_seconds) {
        const additionalMinutes = Math.floor(progress.time_spent_seconds / 60);
        if (additionalMinutes > 0) {
          await supabase
            .from('users')
            .update({
              total_meditation_minutes: user.total_meditation_minutes + additionalMinutes,
              last_activity: new Date().toISOString(),
            })
            .eq('id', user.id);

          setUser(prev => prev ? {
            ...prev,
            total_meditation_minutes: prev.total_meditation_minutes + additionalMinutes
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
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

  // Send light to another user
  const sendLight = async (toUserId: number, amount: number): Promise<boolean> => {
    if (!user || user.light_balance < amount) return false;

    try {
      // Get current receiver balance
      const { data: receiverData, error: receiverFetchError } = await supabase
        .from('users')
        .select('light_balance')
        .eq('id', toUserId)
        .single();

      if (receiverFetchError) throw receiverFetchError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('light_transactions')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          amount,
          transaction_type: 'friend_gift',
          description: `Подарок СВЕТ от ${user.first_name}`,
        });

      if (transactionError) throw transactionError;

      // Update sender balance
      const { error: senderError } = await supabase
        .from('users')
        .update({
          light_balance: user.light_balance - amount,
          last_activity: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (senderError) throw senderError;

      // Update receiver balance
      const { error: receiverError } = await supabase
        .from('users')
        .update({
          light_balance: receiverData.light_balance + amount,
          last_activity: new Date().toISOString(),
        })
        .eq('id', toUserId);

      if (receiverError) throw receiverError;

      // Update local state
      setUser(prev => prev ? { ...prev, light_balance: prev.light_balance - amount } : null);

      return true;
    } catch (error) {
      console.error('Error sending light:', error);
      return false;
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
    getMissionProgress,
    hasArtifact,
    canAfford,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
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