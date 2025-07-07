import { Redis } from '@upstash/redis';

// Функция для получения Redis клиента (ленивая инициализация)
let redis: Redis | null = null;
let isRedisConfigured = false;

function getRedisClient(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  
  if (url && token) {
    try {
      redis = new Redis({ url, token });
      isRedisConfigured = true;
      return redis;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }
  
  return null;
}

// Логируем состояние конфигурации при первом использовании
function checkRedisConfig() {
  if (typeof window === 'undefined') { // Только на сервере
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    
    if (url && token) {
      console.log('✅ Redis configured successfully');
    } else {
      console.warn('⚠️ Redis not configured - using in-memory storage (data will be lost on restart)');
      console.log('To fix this, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables');
    }
  }
}

// In-memory storage для разработки/fallback
const memoryStore = new Map<string, any>();

// Обёртка для Redis с fallback
const storage = {
  async get<T>(key: string): Promise<T | null> {
    checkRedisConfig();
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis not configured, using in-memory storage');
      return memoryStore.get(key) || null;
    }
    try {
      return await redisClient.get<T>(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },
  
  async set(key: string, value: any): Promise<void> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis not configured, using in-memory storage');
      memoryStore.set(key, value);
      return;
    }
    try {
      await redisClient.set(key, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
};

// Типы данных (те же, что были для Supabase)
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
}

export interface Referral {
  referrer_user_id: number;
  referred_user_id: number;
  created_at: string;
  bonus_given: boolean;
}

// Префиксы для ключей в KV
const KEYS = {
  user: (id: number) => `user:${id}`,
  userProgress: (userId: number) => `progress:${userId}`,
  userArtifacts: (userId: number) => `artifacts:${userId}`,
  userReferrals: (userId: number) => `referrals:${userId}`,
  referralByUser: (referrerId: number, referredId: number) => `ref:${referrerId}:${referredId}`,
};

// Функции для работы с пользователями
export async function getUser(id: number): Promise<UserData | null> {
  try {
    return await storage.get<UserData>(KEYS.user(id));
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function createUser(userData: UserData): Promise<UserData> {
  try {
    await storage.set(KEYS.user(userData.id), userData);
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: number, updates: Partial<UserData>): Promise<UserData | null> {
  try {
    const user = await getUser(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await storage.set(KEYS.user(id), updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Функции для работы с прогрессом миссий
export async function getUserProgress(userId: number): Promise<MissionProgress[]> {
  try {
    const progress = await storage.get<MissionProgress[]>(KEYS.userProgress(userId));
    return progress || [];
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
}

export async function updateMissionProgress(
  userId: number, 
  missionId: string, 
  updates: Partial<MissionProgress>
): Promise<MissionProgress | null> {
  try {
    const allProgress = await getUserProgress(userId);
    const index = allProgress.findIndex(p => p.mission_id === missionId);
    
    if (index === -1) {
      // Создаём новый прогресс
      const newProgress: MissionProgress = {
        id: `${userId}-${missionId}`,
        user_id: userId,
        mission_id: missionId,
        status: 'not_started',
        progress_percentage: 0,
        current_step: 0,
        total_steps: 5,
        time_spent_seconds: 0,
        attempts: 0,
        last_activity: new Date().toISOString(),
        ...updates,
      };
      allProgress.push(newProgress);
    } else {
      // Обновляем существующий
      allProgress[index] = {
        ...allProgress[index],
        ...updates,
        last_activity: new Date().toISOString(),
      };
    }
    
    await storage.set(KEYS.userProgress(userId), allProgress);
    return allProgress.find(p => p.mission_id === missionId) || null;
  } catch (error) {
    console.error('Error updating mission progress:', error);
    return null;
  }
}

// Функции для работы с артефактами
export async function getUserArtifacts(userId: number): Promise<UserArtifact[]> {
  try {
    const artifacts = await storage.get<UserArtifact[]>(KEYS.userArtifacts(userId));
    return artifacts || [];
  } catch (error) {
    console.error('Error getting user artifacts:', error);
    return [];
  }
}

export async function addUserArtifact(userId: number, artifactId: string, source: string): Promise<UserArtifact> {
  try {
    const artifacts = await getUserArtifacts(userId);
    const newArtifact: UserArtifact = {
      id: `${userId}-${artifactId}`,
      user_id: userId,
      artifact_id: artifactId,
      acquired_at: new Date().toISOString(),
      source,
    };
    
    // Проверяем, нет ли уже такого артефакта
    if (!artifacts.some(a => a.artifact_id === artifactId)) {
      artifacts.push(newArtifact);
      await storage.set(KEYS.userArtifacts(userId), artifacts);
    }
    
    return newArtifact;
  } catch (error) {
    console.error('Error adding user artifact:', error);
    throw error;
  }
}

// Функции для работы с рефералами
export async function getUserReferrals(userId: number): Promise<Referral[]> {
  try {
    const referrals = await storage.get<Referral[]>(KEYS.userReferrals(userId));
    return referrals || [];
  } catch (error) {
    console.error('Error getting user referrals:', error);
    return [];
  }
}

export async function addReferral(referrerId: number, referredId: number): Promise<boolean> {
  try {
    // Проверяем, нет ли уже такого реферала
    const existingRef = await storage.get(KEYS.referralByUser(referrerId, referredId));
    if (existingRef) return false;
    
    const referral: Referral = {
      referrer_user_id: referrerId,
      referred_user_id: referredId,
      created_at: new Date().toISOString(),
      bonus_given: false,
    };
    
    // Сохраняем реферал для обоих пользователей
    await storage.set(KEYS.referralByUser(referrerId, referredId), referral);
    
    // Добавляем в список рефералов реферера
    const referrerRefs = await getUserReferrals(referrerId);
    referrerRefs.push(referral);
    await storage.set(KEYS.userReferrals(referrerId), referrerRefs);
    
    // Добавляем в список рефералов реферала (кто его пригласил)
    const referredRefs = await getUserReferrals(referredId);
    referredRefs.push(referral);
    await storage.set(KEYS.userReferrals(referredId), referredRefs);
    
    return true;
  } catch (error) {
    console.error('Error adding referral:', error);
    return false;
  }
}

// Функция завершения миссии
export async function completeMission(userId: number, missionId: string): Promise<{
  light_earned: number;
  meditation_minutes: number;
  artifact_earned?: { id: string; name: string };
}> {
  try {
    // Обновляем прогресс миссии
    await updateMissionProgress(userId, missionId, {
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
    });
    
    // Обновляем статистику пользователя
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');
    
    const lightEarned = 10;
    const meditationMinutes = 5;
    
    await updateUser(userId, {
      light_balance: user.light_balance + lightEarned,
      total_missions_completed: user.total_missions_completed + 1,
      total_meditation_minutes: user.total_meditation_minutes + meditationMinutes,
    });
    
    // Выдаём артефакт (если это первая миссия воды)
    let artifactEarned;
    if (missionId === 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d') {
      await addUserArtifact(userId, 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'mission_completion');
      artifactEarned = {
        id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
        name: 'Жемчужина Чуткости',
      };
    }
    
    return {
      light_earned: lightEarned,
      meditation_minutes: meditationMinutes,
      artifact_earned: artifactEarned,
    };
  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
}

// Функция обработки реферала с бонусами
export async function handleReferralBonus(referrerId: number, referredId: number): Promise<boolean> {
  try {
    console.log(`🎁 Processing referral: ${referrerId} -> ${referredId}`);
    
    const added = await addReferral(referrerId, referredId);
    if (!added) {
      console.log(`❌ Referral already exists: ${referrerId} -> ${referredId}`);
      return false;
    }
    
    // Начисляем бонусы обоим пользователям
    const referrer = await getUser(referrerId);
    const referred = await getUser(referredId);
    
    if (referrer) {
      await updateUser(referrerId, {
        light_balance: referrer.light_balance + 100,
      });
      console.log(`💰 Referrer ${referrerId} received +100 LIGHT (new balance: ${referrer.light_balance + 100})`);
    }
    
    if (referred) {
      await updateUser(referredId, {
        light_balance: referred.light_balance + 100,
      });
      console.log(`💰 Referred ${referredId} received +100 LIGHT (new balance: ${referred.light_balance + 100})`);
    }
    
    console.log(`✅ Referral bonus processed successfully: ${referrerId} -> ${referredId}`);
    return true;
  } catch (error) {
    console.error('Error handling referral bonus:', error);
    return false;
  }
}

// Функция отправки света другу
export async function sendLight(
  senderId: number, 
  receiverId: number, 
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const sender = await getUser(senderId);
    const receiver = await getUser(receiverId);
    
    if (!sender || !receiver) {
      return { success: false, error: 'Пользователь не найден' };
    }
    
    if (sender.light_balance < amount) {
      return { success: false, error: 'Недостаточно света' };
    }
    
    // TODO: Добавить проверку дневного лимита (50 света в день)
    
    await updateUser(senderId, {
      light_balance: sender.light_balance - amount,
    });
    
    await updateUser(receiverId, {
      light_balance: receiver.light_balance + amount,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending light:', error);
    return { success: false, error: 'Ошибка при отправке света' };
  }
} 