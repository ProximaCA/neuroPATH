"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Card,
  Badge,
  Avatar,
  Icon,
} from "@once-ui-system/core";
import Link from "next/link";
import { useUser } from "../../../../lib/user-context-kv";
import { useEffect, useState } from "react";
import { triggerHaptic } from "../../../../lib/telegram";

const MISSIONS = [
  {
    id: "d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d",
    title: "Погружение",
    description: "Первая медитация. Вход в стихию воды.",
    duration: 5,
    artifact: {
      name: "Жемчужина Чуткости",
      image: "/images/artifacts/pearl.jpg"
    },
    order: 1,
    cost: 0, // Бесплатная
  },
  {
    id: "b2e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0e",
    title: "Растворение",
    description: "Вторая медитация. Погружение в принятие себя.",
    duration: 7,
    artifact: {
      name: "Кристалл Принятия",
      image: "/images/artifacts/crystal.jpg"
    },
    order: 2,
    cost: 100, // +100
  },
  {
    id: "c3e4f9a1-db4a-5c9d-9f2a-7d6b8a9e0c1f",
    title: "Течение",
    description: "Третья медитация. Движение с потоком жизни.",
    duration: 10,
    artifact: {
      name: "Лунный Камень",
      image: "/images/artifacts/moonstone.jpg"
    },
    order: 3,
    cost: 150, // +50
  },
  {
    id: "d4e5f0a2-ec5b-6d0e-0f3b-8e7c9b0f1d2g",
    title: "Глубина",
    description: "Четвертая медитация. Погружение в глубины подсознания.",
    duration: 12,
    artifact: {
      name: "Морская Звезда",
      image: "/images/artifacts/starfish.jpg"
    },
    order: 4,
    cost: 200, // +50
  }
];

export default function WaterMissionsPage() {
  const { user, getMissionProgress, updateUserProgress, isLoading, updateUser, refreshUserData, unlockMission } = useUser();
  const [unlocking, setUnlocking] = useState<string | null>(null);

  // Обновляем данные при загрузке страницы
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user]);

  const hasMissionAccess = (mission: any) => {
    // Бесплатные миссии всегда доступны
    if (mission.cost === 0) return true;
    // Если есть прогресс - миссия куплена
    const progress = getMissionProgress(mission.id);
    return progress !== null;
  };

  const canBuyMission = (mission: any) => {
    return user && user.light_balance >= mission.cost && mission.cost > 0;
  };

  const handleBuyMission = async (mission: any) => {
    if (!canBuyMission(mission)) return;
    setUnlocking(mission.id);
    triggerHaptic('impact', 'medium');
    
    const result = await unlockMission(mission.id, mission.cost);
    if (result.success) {
      triggerHaptic('notification', 'success');
      await refreshUserData();
    } else {
      triggerHaptic('notification', 'error');
      console.error('Ошибка покупки миссии:', result.error);
    }
    
    setUnlocking(null);
  };

  return (
    <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
      <Column maxWidth="l" gap="xl" align="center">
        <Heading variant="display-strong-l" align="center">
          Миссии стихии Воды
        </Heading>
        <Text variant="body-default-l" align="center" onBackground="neutral-weak">
          Пройди миссии по порядку. Новые миссии открываются за свет.
        </Text>
        <Column gap="l" fillWidth>
          {MISSIONS.map((mission) => {
            const hasAccess = hasMissionAccess(mission);
            const progress = getMissionProgress(mission.id);
            const needsToBuy = !hasAccess && mission.cost > 0;
            const canBuy = canBuyMission(mission);
            
            return (
              <Card key={mission.id} radius="l" padding="l" border="neutral-alpha-medium" fillWidth>
                <Row gap="m" align="center">
                  <Avatar src={mission.artifact.image} size="m" />
                  <Column gap="xs" fillWidth>
                    <Heading variant="heading-strong-m">{mission.title}</Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">{mission.description}</Text>
                    <Row gap="s" align="center">
                      <Badge>{mission.duration} мин</Badge>
                      {progress && (
                        <>
                          <Badge background="brand-alpha-weak">
                            {progress.status === 'completed' ? '✓ Завершено' : `${progress.progress_percentage || 0}%`}
                          </Badge>
                          {progress.status === 'in_progress' && progress.progress_percentage > 0 && (
                            <div style={{ 
                              width: "100px", 
                              height: "4px", 
                              backgroundColor: "var(--neutral-alpha-weak)",
                              borderRadius: "2px",
                              overflow: "hidden"
                            }}>
                              <div style={{
                                width: `${progress.progress_percentage}%`,
                                height: "100%",
                                backgroundColor: "#00A9FF",
                                borderRadius: "2px",
                                transition: "width 0.3s ease"
                              }} />
                            </div>
                          )}
                        </>
                      )}
                      {mission.cost > 0 && !hasAccess && (
                        <Badge background="warning-alpha-weak">💰 {mission.cost} СВЕТА</Badge>
                      )}
                    </Row>
                  </Column>
                  <Column gap="s" align="end">
                    {hasAccess ? (
                      <Link href={`/elements/water/missions/${mission.order}`}>
                        <Button variant="primary" size="s" arrowIcon>
                          {progress?.status === 'completed' ? 'Повторить' : 'Начать'}
                        </Button>
                      </Link>
                    ) : needsToBuy ? (
                      <Button
                        variant="secondary"
                        size="s"
                        disabled={!canBuy || unlocking === mission.id}
                        loading={unlocking === mission.id}
                        onClick={() => handleBuyMission(mission)}
                      >
                        ⚡ Открыть за {mission.cost} СВЕТА
                      </Button>
                    ) : null}
                  </Column>
                </Row>
              </Card>
            );
          })}
        </Column>
      </Column>
    </Column>
  );
} 