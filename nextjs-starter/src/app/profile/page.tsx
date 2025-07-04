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
} from "@once-ui-system/core";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../lib/user-context";
import { triggerHaptic } from "../../lib/telegram";

interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  username?: string;
  light_balance: number;
  level: number;
  total_missions_completed: number;
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  image_url: string;
  element_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
  username: "brok3_user",
  light_balance: 150,
  level: 3,
  total_missions_completed: 5,
};

const mockArtifacts: Artifact[] = [
  {
    id: "artifact-1",
    name: "Жемчужина Чуткости",
    description: "Первый артефакт стихии Воды. Дает способность глубже чувствовать эмоции.",
    image_url: "/images/artifacts/pearl.jpg",
    element_name: "Вода",
    rarity: "common"
  },
  {
    id: "artifact-2", 
    name: "Кристалл Принятия",
    description: "Редкий артефакт за прохождение всех миссий Воды.",
    image_url: "/images/artifacts/lock.jpg",
    element_name: "Вода",
    rarity: "rare"
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
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'friends' | 'stats'>('artifacts');
  const [sendingLight, setSendingLight] = useState<string | null>(null);

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

  const handleSendLight = async (friendId: string, amount: number = 10) => {
    if (!user || !canAfford(amount)) {
      triggerHaptic('notification', 'error');
      return;
    }

    setSendingLight(friendId);
    const success = await sendLight(parseInt(friendId), amount);
    
    if (success) {
      triggerHaptic('notification', 'success');
    } else {
      triggerHaptic('notification', 'error');
    }
    
    setSendingLight(null);
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

  if (isLoading || !user) {
    return (
      <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
        <Text>Загрузка профиля...</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
      <Column maxWidth="m" gap="xl">
        
        {/* Header */}
        <Row gap="s" align="center">
          <Link href="/">
            <Button variant="tertiary" prefixIcon="arrow-left" size="s">
              Назад
            </Button>
          </Link>
        </Row>

        {/* Profile Header */}
        <Card padding="l" border="neutral-alpha-medium" radius="l">
          <Row gap="l" align="center">
            <Avatar 
              size="l" 
              style={{ 
                background: "linear-gradient(135deg, #00A9FF, #87CEEB)",
                color: "white",
                fontSize: "2rem"
              }}
            >
              {user.first_name.charAt(0)}
            </Avatar>
            
            <Column gap="s" fillWidth>
              <Row gap="s" align="center">
                <Heading variant="heading-strong-l">
                  {user.first_name}
                </Heading>
                <Badge style={{ backgroundColor: "#FFD700", color: "#000" }}>
                  Уровень {user.level}
                </Badge>
              </Row>
              
              <Text variant="body-default-s" onBackground="neutral-weak">
                @{user.username} • {user.total_missions_completed} миссий пройдено
              </Text>

              {/* Light Balance */}
              <Row gap="s" align="center" marginTop="s">
                <Icon name="star" size="s" style={{ color: "#FFD700" }} />
                <Text variant="heading-default-m" style={{ color: "#FFD700" }}>
                  {user.light_balance} СВЕТА
                </Text>
                <Button variant="tertiary" size="s" prefixIcon="plus">
                  Получить
                </Button>
              </Row>
            </Column>
          </Row>
        </Card>

        {/* Navigation Tabs */}
        <Row gap="s" fillWidth>
          <Button
            variant={activeTab === 'artifacts' ? 'primary' : 'secondary'}
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('artifacts');
            }}
            fillWidth
          >
            Артефакты
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'primary' : 'secondary'}
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('friends');
            }}
            fillWidth
          >
            Друзья
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'primary' : 'secondary'}
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('stats');
            }}
            fillWidth
          >
            Статистика
          </Button>
        </Row>

        {/* Content based on active tab */}
        {activeTab === 'artifacts' && (
          <Column gap="l">
            <Heading variant="heading-strong-l">Коллекция артефактов</Heading>
            
            <Column gap="m">
              {userArtifacts.map((userArtifact) => {
                const artifact = userArtifact.artifact;
                return (
                  <Card key={artifact.id} padding="l" border="neutral-alpha-medium" radius="l">
                    <Row gap="l" align="start">
                      <Avatar 
                        size="m" 
                        src={artifact.icon_url}
                        style={{ 
                          borderRadius: '8px',
                          border: `2px solid ${getRarityColor(artifact.rarity)}`
                        }}
                      />
                      
                      <Column gap="s" fillWidth>
                        <Row gap="s" align="center">
                          <Heading variant="heading-strong-m">
                            {artifact.name}
                          </Heading>
                          <Badge style={{ 
                            backgroundColor: getRarityColor(artifact.rarity), 
                            color: 'white' 
                          }}>
                            {getRarityLabel(artifact.rarity)}
                          </Badge>
                        </Row>
                        
                        <Text variant="code-default-xs" onBackground="neutral-medium">
                          Получен: {new Date(userArtifact.acquired_at).toLocaleDateString()}
                        </Text>
                        
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {artifact.description}
                        </Text>
                      </Column>
                    </Row>
                  </Card>
                );
              })}
              
              <Card padding="l" border="neutral-alpha-weak" radius="l" style={{ opacity: 0.6 }}>
                <Column gap="s" align="center">
                  <Icon name="lock" size="l" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                    Пройди больше миссий, чтобы получить новые артефакты
                  </Text>
                </Column>
              </Card>
            </Column>
          </Column>
        )}

        {activeTab === 'friends' && (
          <Column gap="l">
            <Row gap="s" align="center" horizontal="space-between">
              <Heading variant="heading-strong-l">Друзья</Heading>
              <Button variant="secondary" prefixIcon="plus" size="s">
                Пригласить
              </Button>
            </Row>
            
            <Column gap="m">
              {friends.map((friend) => (
                <Card key={friend.id} padding="l" border="neutral-alpha-medium" radius="l">
                  <Row gap="l" align="center" horizontal="space-between">
                    <Row gap="m" align="center">
                      <Avatar size="s" src={friend.avatar_url}>
                        {friend.first_name.charAt(0)}
                      </Avatar>
                      
                      <Column gap="xs">
                        <Text variant="heading-default-s">
                          {friend.first_name}
                        </Text>
                        <Text variant="code-default-xs" onBackground="neutral-weak">
                          @{friend.username}
                        </Text>
                      </Column>
                    </Row>
                    
                    <Button 
                      variant="primary" 
                      size="s" 
                      prefixIcon="star"
                      style={{ backgroundColor: "#FFD700", borderColor: "#FFD700", color: "#000" }}
                      onClick={() => handleSendLight(friend.id)}
                      disabled={sendingLight === friend.id || !canAfford(10)}
                    >
                      {sendingLight === friend.id ? 'Отправка...' : 'Отправить СВЕТ'}
                    </Button>
                  </Row>
                </Card>
              ))}
            </Column>
          </Column>
        )}

        {activeTab === 'stats' && (
          <Column gap="l">
            <Heading variant="heading-strong-l">Статистика</Heading>
            
            <Column gap="m">
              <Card padding="l" border="neutral-alpha-medium" radius="l">
                <Column gap="m">
                  <Text variant="heading-default-m">Прогресс по стихиям</Text>
                  
                  {(() => {
                    const progress = calculateElementProgress();
                    const waterCompleted = missionProgress.filter(m => 
                      ['d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e'].includes(m.mission_id) && 
                      m.status === 'completed'
                    ).length;
                    
                    return (
                      <>
                        <Column gap="s">
                          <Row horizontal="space-between" align="center">
                            <Row gap="s" align="center">
                              <Text>🌊 Вода</Text>
                              <Badge>{waterCompleted}/3 миссий</Badge>
                            </Row>
                            <Text style={{ color: "#00A9FF" }}>{progress.water}%</Text>
                          </Row>
                          <div style={{ 
                            width: "100%", height: "8px", backgroundColor: "var(--neutral-alpha-weak)", 
                            borderRadius: "4px", overflow: "hidden" 
                          }}>
                            <div style={{ 
                              width: `${progress.water}%`, height: "100%", backgroundColor: "#00A9FF", 
                              transition: "width 0.3s ease" 
                            }} />
                          </div>
                        </Column>

                        <Column gap="s">
                          <Row horizontal="space-between" align="center">
                            <Row gap="s" align="center">
                              <Text>🔥 Огонь</Text>
                              <Badge>0/4 миссий</Badge>
                            </Row>
                            <Text onBackground="neutral-weak">0%</Text>
                          </Row>
                          <div style={{ 
                            width: "100%", height: "8px", backgroundColor: "var(--neutral-alpha-weak)", 
                            borderRadius: "4px", overflow: "hidden" 
                          }}>
                            <div style={{ 
                              width: "0%", height: "100%", backgroundColor: "#FF4500", 
                              transition: "width 0.3s ease" 
                            }} />
                          </div>
                        </Column>
                      </>
                    );
                  })()}
                </Column>
              </Card>

              <Card padding="l" border="neutral-alpha-medium" radius="l">
                <Column gap="m">
                  <Text variant="heading-default-m">Общая статистика</Text>
                  
                  <Row gap="l">
                    <Column align="center" gap="xs">
                      <Text variant="display-strong-s">{user.total_missions_completed}</Text>
                      <Text variant="code-default-xs" onBackground="neutral-weak">Миссий</Text>
                    </Column>
                    <Column align="center" gap="xs">
                      <Text variant="display-strong-s">{userArtifacts.length}</Text>
                      <Text variant="code-default-xs" onBackground="neutral-weak">Артефактов</Text>
                    </Column>
                    <Column align="center" gap="xs">
                      <Text variant="display-strong-s">{friends.length}</Text>
                      <Text variant="code-default-xs" onBackground="neutral-weak">Друзей</Text>
                    </Column>
                    <Column align="center" gap="xs">
                      <Text variant="display-strong-s">{user.light_balance}</Text>
                      <Text variant="code-default-xs" onBackground="neutral-weak">СВЕТА</Text>
                    </Column>
                  </Row>
                </Column>
              </Card>
            </Column>
          </Column>
        )}

      </Column>
    </Column>
  );
} 