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
    cost: 0,
    unlockedByDefault: true,
  },
  {
    id: "b2e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0e",
    title: "Глубина принятия",
    description: "Вторая медитация. Погружение в принятие себя.",
    duration: 7,
    artifact: {
      name: "Кристалл Принятия",
      image: "/images/artifacts/crystal.jpg"
    },
    order: 2,
    cost: 100,
    unlockedByDefault: false,
  }
];

export default function WaterMissionsPage() {
  const { user, getMissionProgress, updateUserProgress, isLoading } = useUser();
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const isMissionUnlocked = (mission: any) => {
    if (mission.unlockedByDefault) return true;
    if (!user) return false;
    const progress = getMissionProgress(mission.id);
    return progress && progress.status !== 'not_started';
  };

  const canUnlock = (mission: any) => {
    return user && user.light_balance >= mission.cost;
  };

  const handleUnlock = async (mission: any) => {
    if (!canUnlock(mission)) return;
    setUnlocking(mission.id);
    triggerHaptic('impact', 'medium');
    // Списываем свет через user context
    await updateUserProgress(mission.id, { status: 'not_started', progress_percentage: 0, current_step: 0, total_steps: 6, time_spent_seconds: 0, attempts: 0 });
    if (user) {
      // Обновляем баланс напрямую через kvStore (user context)
      await import('../../../../lib/kv-store').then(kvStore => kvStore.updateUser(user.id, { light_balance: user.light_balance - mission.cost }));
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
            const unlocked = isMissionUnlocked(mission);
            const progress = getMissionProgress(mission.id);
            const canBuy = canUnlock(mission) && (!progress || progress.status === 'not_started');
            return (
              <Card key={mission.id} radius="l" padding="l" border="neutral-alpha-medium" fillWidth>
                <Row gap="m" align="center">
                  <Avatar src={mission.artifact.image} size="m" />
                  <Column gap="xs" fillWidth>
                    <Heading variant="heading-strong-m">{mission.title}</Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">{mission.description}</Text>
                    <Row gap="s" align="center">
                      <Badge>{mission.duration} мин</Badge>
                      {unlocked && progress && (
                        <Badge background="brand-alpha-weak">
                          {progress.status === 'completed' ? 'Завершено' : `${progress.progress_percentage || 0}%`}
                        </Badge>
                      )}
                    </Row>
                  </Column>
                  <Column gap="s" align="end">
                    {unlocked ? (
                      <Link href={`/elements/water/missions/${mission.order}`}>
                        <Button variant="primary" size="s" arrowIcon>
                          {progress && progress.status === 'completed' ? 'Повторить' : 'Перейти'}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="secondary"
                        size="s"
                        prefixIcon="star"
                        disabled={!canBuy || unlocking === mission.id}
                        loading={unlocking === mission.id}
                        onClick={() => handleUnlock(mission)}
                      >
                        Открыть за {mission.cost} СВЕТА
                      </Button>
                    )}
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