"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Badge,
  Card,
  Icon,
  Avatar,
  Line,
  NavIcon,
  Flex,
  ToggleButton,
  Background,
} from "@once-ui-system/core";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../lib/user-context";
import { triggerHaptic } from "../../lib/telegram";
import { Navigation } from "../../components/Navigation";

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  light_balance: number;
  level: number;
  total_missions_completed: number;
  total_meditation_minutes: number;
  photo_url?: string;
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  image_url: string;
  element_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  light_value: number;
}

interface Friend {
  id: string;
  first_name: string;
  username?: string;
  avatar_url?: string;
  last_active: string;
}

const mockUser: User = {
  id: "user-1",
  telegram_id: 123456789,
  first_name: "BROK3",
  last_name: "Lastname",
  username: "brok3_user",
  light_balance: 150,
  level: 3,
  total_missions_completed: 5,
  total_meditation_minutes: 120,
  photo_url: "/images/default-avatar.jpg",
};

const mockArtifacts: Artifact[] = [
  {
    id: "artifact-1",
    name: "Жемчужина Чуткости",
    description: "Первый артефакт стихии Воды. Дает способность глубже чувствовать эмоции.",
    image_url: "/images/artifacts/pearl.jpg",
    element_name: "Вода",
    rarity: "common",
    light_value: 10,
  },
  {
    id: "artifact-2", 
    name: "Кристалл Принятия",
    description: "Редкий артефакт за прохождение всех миссий Воды.",
    image_url: "/images/artifacts/lock.jpg",
    element_name: "Вода",
    rarity: "rare",
    light_value: 20,
  }
];

const mockFriends: Friend[] = [
  {
    id: "friend-1",
    first_name: "Анна",
    username: "anna_zen",
    avatar_url: "/images/demo.jpg",
    last_active: "2024-01-20"
  },
  {
    id: "friend-2",
    first_name: "Максим",
    username: "max_flow",
    avatar_url: "/images/demo.jpg", 
    last_active: "2024-01-19"
  }
];

export default function ProfilePage() {
  const { 
    user, 
    userArtifacts, 
    missionProgress, 
    isLoading, 
    sendLight, 
    canAfford,
    refreshUserData 
  } = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'friends' | 'stats'>('artifacts');
  const [sendingLight, setSendingLight] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<any[]>([]);

  // Load invited friends from Supabase or use fallback
  useEffect(() => {
    const loadInvitedFriends = async () => {
      if (!user) return;

      try {
        // В реальном приложении здесь будет запрос к базе данных
        // для получения списка приглашенных друзей
        const { data: referrals, error } = await supabase
          .from('user_referrals')
          .select(`
            referred_user_id,
            created_at,
            users!referred_user_id(
              id,
              first_name,
              last_name,
              username,
              photo_url
            )
          `)
          .eq('referrer_user_id', user.id);

        if (error) {
          console.warn('Failed to load referrals:', error);
          setInvitedFriends([]);
        } else {
          setInvitedFriends(referrals || []);
        }
      } catch (error) {
        console.error('Error loading invited friends:', error);
        setInvitedFriends([]);
      }
    };

    loadInvitedFriends();
  }, [user]);

  const handleSendLight = async (friendId: number, amount: number = 10) => {
    if (!user || !canAfford(amount)) {
      triggerHaptic('notification', 'error');
      return;
    }

    setSendingLight(friendId.toString());
    const success = await sendLight(friendId, amount);
    
    if (success) {
      triggerHaptic('notification', 'success');
      // Refresh user data to update balance
      await refreshUserData();
    } else {
      triggerHaptic('notification', 'error');
    }
    
    setSendingLight(null);
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return '#87CEEB';
      case 'rare': return '#9370DB'; 
      case 'epic': return '#FF6347';
      case 'legendary': return '#FFD700';
      default: return '#87CEEB';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'Обычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический'; 
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

  const calculateElementProgress = () => {
    if (!missionProgress.length) return { water: 0, fire: 0, air: 0, earth: 0 };
    
    const waterMissions = missionProgress.filter(p => 
      ['d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e'].includes(p.mission_id)
    );
    
    const waterCompleted = waterMissions.filter(m => m.status === 'completed').length;
    const waterProgress = Math.round((waterCompleted / 3) * 100);
    
    return {
      water: waterProgress,
      fire: 0,
      air: 0,
      earth: 0
    };
  };

  // Generate referral link
  const referralLink = user ? `https://t.me/brain_alchemy_bot?start=ref_${user.id}` : '';

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      triggerHaptic('notification', 'success');
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      triggerHaptic('notification', 'error');
    }
  };

  if (isLoading) {
    return (
      <Column fillWidth style={{ minHeight: "100vh" }}>
        <Background
          position="absolute"
          left="0"
          top="0"
          gradient={{
            display: true,
            opacity: "20" as any,
            x: 50,
            y: 0,
            colorStart: "#00A9FF",
            colorEnd: "static-transparent",
          }}
        />

        {/* Navigation */}
        <Navigation showBackButton backHref="/" backText="На главную" />

        <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1, minHeight: "60vh" }}>
          <Column gap="m" align="center">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00A9FF, #0080CC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                animation: "pulse 2s infinite"
              }}
            >
              👤Профиль
            </div>
            <Text variant="heading-strong-l" style={{ color: "#00A9FF" }}>
              Загрузка профиля...
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Синхронизация данных с Telegram
            </Text>
          </Column>
        </Column>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </Column>
    );
  }

  if (!user) {
    return (
      <Column fillWidth style={{ minHeight: "100vh" }}>
        <Background
          position="absolute"
          left="0"
          top="0"
          gradient={{
            display: true,
            opacity: "20" as any,
            x: 50,
            y: 0,
            colorStart: "#FF6B6B",
            colorEnd: "static-transparent",
          }}
        />

        {/* Navigation */}
        <Navigation showBackButton backHref="/" backText="На главную" />

        <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1, minHeight: "60vh" }}>
          <Column gap="m" align="center">
            <Text style={{ fontSize: "4rem" }}>❌</Text>
            <Text variant="heading-strong-l" style={{ color: "#FF6B6B" }}>
              Ошибка загрузки
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Не удалось загрузить данные профиля
            </Text>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              style={{ 
                backgroundColor: "#00A9FF",
                borderColor: "#00A9FF"
              }}
            >
              Попробовать снова
            </Button>
          </Column>
        </Column>
      </Column>
    );
  }

  return (
    <Column fillWidth style={{ minHeight: "100vh" }}>
      <Background
        position="absolute"
        left="0"
        top="0"
        gradient={{
          display: true,
          opacity: "20" as any,
          x: 50,
          y: 0,
          colorStart: "#00A9FF",
          colorEnd: "static-transparent",
        }}
      />

      {/* Navigation */}
      <Navigation showBackButton backHref="/" backText="На главную" />

      <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
        <Column maxWidth="m" gap="xl" fillWidth>
          
          {/* Profile Header */}
          <Card radius="l" padding="l" background="neutral-alpha-weak" align="center">
            <Column gap="m" align="center">
              <Avatar 
                src={user.photo_url || "/images/default-avatar.jpg"}
                size="xl"
                style={{
                  border: "3px solid #00A9FF",
                  boxShadow: "0 4px 20px rgba(0, 169, 255, 0.3)"
                }}
              />
              <Column gap="xs" align="center">
                <Heading variant="heading-strong-l" style={{ color: "#00A9FF" }}>
                  {user.first_name} {user.last_name || ''}
                </Heading>
                {user.username && (
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    @{user.username}
                  </Text>
                )}
                <Badge 
                  style={{ 
                    backgroundColor: "#00A9FF", 
                    color: "white",
                    fontSize: "0.875rem",
                    padding: "8px 16px"
                  }}
                >
                  Уровень {user.level}
                </Badge>
              </Column>
            </Column>
          </Card>

          {/* Stats Cards */}
          <Row gap="m" fillWidth>
            <Card radius="l" padding="m" background="neutral-alpha-weak" fillWidth align="center">
              <Column gap="xs" align="center">
                <Text variant="display-strong-l" style={{ color: "#00A9FF" }}>
                  ✨
                </Text>
                <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                  {user.light_balance}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  СВЕТ
                </Text>
              </Column>
            </Card>
            
            <Card radius="l" padding="m" background="neutral-alpha-weak" fillWidth align="center">
              <Column gap="xs" align="center">
                <Text variant="display-strong-l">
                  🎯
                </Text>
                <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                  {user.total_missions_completed}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Миссий
                </Text>
              </Column>
            </Card>

            <Card radius="l" padding="m" background="neutral-alpha-weak" fillWidth align="center">
              <Column gap="xs" align="center">
                <Text variant="display-strong-l">
                  ⏱️
                </Text>
                <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                  {user.total_meditation_minutes}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Минут
                </Text>
              </Column>
            </Card>
          </Row>

          {/* Tab Navigation */}
          <Row gap="s" fillWidth>
            <Button
              variant={activeTab === 'artifacts' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('artifacts')}
              fillWidth
              style={{
                backgroundColor: activeTab === 'artifacts' ? '#00A9FF' : undefined,
                borderColor: activeTab === 'artifacts' ? '#00A9FF' : undefined
              }}
            >
              ⭐ Артефакты
            </Button>
            <Button
              variant={activeTab === 'friends' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('friends')}
              fillWidth
              style={{
                backgroundColor: activeTab === 'friends' ? '#00A9FF' : undefined,
                borderColor: activeTab === 'friends' ? '#00A9FF' : undefined
              }}
            >
              👥 Друзья
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('stats')}
              fillWidth
              style={{
                backgroundColor: activeTab === 'stats' ? '#00A9FF' : undefined,
                borderColor: activeTab === 'stats' ? '#00A9FF' : undefined
              }}
            >
              📊 Статистика
            </Button>
          </Row>

          {/* Tab Content */}
          {activeTab === 'friends' && (
            <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
              <Column gap="m">
                <Row gap="s" align="center">
                  <Text variant="display-strong-l">🎁</Text>
                  <Column gap="xs" fillWidth>
                    <Heading variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                      Пригласи друзей
                    </Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      За каждого приглашенного друга +100 СВЕТА
                    </Text>
                  </Column>
                </Row>

              <Card radius="m" padding="m" background="neutral-alpha-weak">
                <Column gap="s">
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    Твоя реферальная ссылка:
                  </Text>
                  <Row gap="s" align="center">
                    <Text 
                      variant="code-default-s" 
                      style={{ 
                        flex: 1, 
                        backgroundColor: "var(--neutral-alpha-weak)",
                        padding: "8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem"
                      }}
                    >
                      {referralLink}
                    </Text>
                    <Button
                      variant="secondary"
                      size="s"
                      onClick={copyReferralLink}
                      style={{
                        backgroundColor: copiedReferral ? "#4CAF50" : undefined
                      }}
                    >
                      {copiedReferral ? "✅" : "📋"}
                    </Button>
                  </Row>
                </Column>
              </Card>

              {/* Invited Friends */}
              {invitedFriends.length > 0 ? (
                <Column gap="s">
                  <Text variant="heading-strong-s">
                    Приглашенные друзья ({invitedFriends.length})
                  </Text>
                  <Column gap="xs">
                    {invitedFriends.map((referral) => {
                      const friend = referral.users;
                      const isSending = sendingLight === friend.id.toString();
                      
                      return (
                        <Row key={referral.referred_user_id} gap="m" align="center" padding="s">
                          <Avatar 
                            src={friend.photo_url || "/images/default-avatar.jpg"} 
                            size="s" 
                          />
                          <Column gap="xs" fillWidth>
                            <Text variant="label-default-m">
                              {friend.first_name} {friend.last_name || ''}
                            </Text>
                            {friend.username && (
                              <Text variant="body-default-xs" onBackground="neutral-weak">
                                @{friend.username}
                              </Text>
                            )}
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              Присоединился {new Date(referral.created_at).toLocaleDateString('ru-RU')}
                            </Text>
                          </Column>
                          
                          <Column gap="xs" align="end">
                            <Button
                              variant="secondary"
                              size="s"
                              onClick={() => handleSendLight(friend.id, 10)}
                              disabled={isSending || !canAfford(10)}
                              style={{
                                backgroundColor: isSending ? "#4CAF50" : undefined,
                                minWidth: "80px"
                              }}
                            >
                              {isSending ? "..." : canAfford(10) ? "💫 10" : "🔒"}
                            </Button>
                            <Badge style={{ backgroundColor: "#4CAF50", color: "white" }}>
                              +100 за приглашение
                            </Badge>
                          </Column>
                        </Row>
                      );
                    })}
                  </Column>
                </Column>
              ) : (
                <Column gap="s" align="center" padding="m">
                  <Text style={{ fontSize: "2rem" }}>👥</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                    Пока никого не пригласили
                  </Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
                    Поделитесь ссылкой с друзьями, чтобы получить +100 СВЕТА за каждого
                  </Text>
                </Column>
              )}
            </Column>
          </Card>
          )}

          {/* Artifacts Tab */}
          {activeTab === 'artifacts' && (
            <Card radius="l" padding="l" background="neutral-alpha-weak">
              <Column gap="m">
                <Row gap="xs" align="center">
                  <Text style={{ fontSize: "1.5rem" }}>⭐</Text>
                  <Text variant="heading-strong-s" style={{ color: "#FFD700" }}>
                    Артефакты ({userArtifacts.length})
                  </Text>
                </Row>
                
                {userArtifacts.length > 0 ? (
                  <Row gap="m" wrap>
                    {userArtifacts.map((userArtifact) => (
                      <Card 
                        key={userArtifact.id}
                        padding="m" 
                        border="neutral-alpha-weak" 
                        radius="m"
                        style={{ minWidth: "120px" }}
                        align="center"
                      >
                        <Column gap="s" align="center">
                          <Avatar 
                            src={userArtifact.artifact.icon_url}
                            size="l"
                          />
                          <Text variant="label-default-s" align="center">
                            {userArtifact.artifact.name}
                          </Text>
                          <Badge style={{ 
                            backgroundColor: userArtifact.artifact.rarity === 'legendary' ? '#FFD700' : 
                                           userArtifact.artifact.rarity === 'epic' ? '#9C27B0' : '#00A9FF',
                            color: 'white',
                            fontSize: '0.75rem'
                          }}>
                            {userArtifact.artifact.light_value} СВЕТА
                          </Badge>
                        </Column>
                      </Card>
                    ))}
                  </Row>
                ) : (
                  <Card padding="l" border="neutral-alpha-weak" radius="l" style={{ opacity: 0.6 }}>
                    <Column gap="s" align="center">
                      <Text style={{ fontSize: "3rem" }}>🔒</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                        Пройди больше миссий, чтобы получить новые артефакты
                      </Text>
                    </Column>
                  </Card>
                )}
              </Column>
            </Card>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <Card radius="l" padding="l" background="neutral-alpha-weak">
              <Column gap="m">
                <Row gap="xs" align="center">
                  <Text style={{ fontSize: "1.5rem" }}>📊</Text>
                  <Text variant="heading-strong-s" style={{ color: "#00A9FF" }}>
                    Прогресс по стихиям
                  </Text>
                </Row>
                
                <Column gap="m">
                  {Object.entries(calculateElementProgress()).map(([element, progress]) => {
                    const elementMap: Record<string, { name: string; color: string }> = {
                      water: { name: '🌊 Вода', color: '#00A9FF' },
                      fire: { name: '🔥 Огонь', color: '#FF6B47' },
                      air: { name: '💨 Воздух', color: '#87CEEB' },
                      earth: { name: '🌍 Земля', color: '#8B4513' }
                    };
                    
                    const elementData = elementMap[element] || { name: element, color: '#00A9FF' };

                    return (
                      <Card key={element} padding="m" background="neutral-alpha-weak" radius="m">
                        <Column gap="s">
                          <Row gap="s" align="center" style={{ justifyContent: 'space-between' }}>
                            <Text variant="label-default-m">{elementData.name}</Text>
                            <Text variant="label-default-s" style={{ color: elementData.color }}>
                              {progress}%
                            </Text>
                          </Row>
                          <div 
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: 'var(--neutral-alpha-weak)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div 
                              style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: elementData.color,
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                        </Column>
                      </Card>
                    );
                  })}
                </Column>

                {/* Mission Progress Details */}
                <Column gap="s">
                  <Text variant="heading-strong-s">Детали прогресса</Text>
                  <Row gap="m">
                    <Card padding="s" background="brand-alpha-weak" radius="m" fillWidth align="center">
                      <Column gap="xs" align="center">
                        <Text style={{ fontSize: "1.5rem" }}>🎯</Text>
                        <Text variant="label-default-s">Завершено миссий</Text>
                        <Text variant="heading-strong-s" style={{ color: "#00A9FF" }}>
                          {missionProgress.filter(m => m.status === 'completed').length}/{missionProgress.length}
                        </Text>
                      </Column>
                    </Card>
                    <Card padding="s" background="brand-alpha-weak" radius="m" fillWidth align="center">
                      <Column gap="xs" align="center">
                        <Text style={{ fontSize: "1.5rem" }}>⚡</Text>
                        <Text variant="label-default-s">Текущий стрик</Text>
                        <Text variant="heading-strong-s" style={{ color: "#00A9FF" }}>
                          {user.streak_days} дней
                        </Text>
                      </Column>
                    </Card>
                  </Row>
                </Column>
              </Column>
            </Card>
          )}

          {/* Quick Actions */}
          <Column gap="m">
            <Link href="/elements/water">
              <Button
                variant="primary"
                fillWidth
                style={{ 
                  backgroundColor: "#00A9FF",
                  borderColor: "#00A9FF"
                }}
                arrowIcon
              >
                Продолжить медитации
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" fillWidth>
                На главную
              </Button>
            </Link>
          </Column>

        </Column>
      </Column>
    </Column>
  );
} 