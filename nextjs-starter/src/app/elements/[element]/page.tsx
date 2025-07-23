"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Row,
  Badge,
  Card,
  Avatar,
  Background,
} from "@once-ui-system/core";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../../../lib/user-context-kv";
import { triggerHaptic } from "../../../lib/telegram";
import { Navigation } from "../../../components/Navigation";

const WATER_MISSIONS = [
  {
    id: "d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d",
    title: "Погружение",
    description: "Первая медитация. Вход в стихию воды.",
    detailedDescription: "Первый контакт со стихией Воды. Мягкое погружение в медитативное состояние через дыхание и визуализацию. Поможет почувствовать внутренний поток и научиться принимать свои эмоции без сопротивления.",
    duration: 5,
    artifact: {
      name: "Жемчужина Чуткости",
      image: "/images/artifacts/pearl.jpg",
      description: "Символ глубокого понимания эмоций и принятия себя."
    },
    order: 1,
    cost: 0, // Бесплатная
  },
  {
    id: "b2e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0e",
    title: "Растворение",
    description: "Вторая медитация. Погружение в принятие себя.",
    detailedDescription: "Освобождение от страхов и тревог через технику растворения. Работа с дыханием 4-7-8 и образными представлениями. Учимся отпускать то, что нас сковывает.",
    duration: 7,
    artifact: {
      name: "Кристалл Принятия",
      image: "/images/artifacts/crystal.jpg",
      description: "Кристалл эмпатии. Способность чувствовать связь с другими через принятие."
    },
    order: 2,
    cost: 100, // +100
  },
  {
    id: "c3e4f9a1-db4a-5c9d-9f2a-7d6b8a9e0c1f",
    title: "Течение",
    description: "Третья медитация. Движение с потоком жизни.",
    detailedDescription: "Глубокая практика принятия жизни такой, какая она есть. Работа с обидами и привязанностями. Обретение внутреннего покоя через поток осознанности.",
    duration: 10,
    artifact: {
      name: "Лунный Камень",
      image: "/images/artifacts/moonstone.jpg",
      description: "Камень внутренней мудрости. Дарует силу принимать жизнь и находить покой."
    },
    order: 3,
    cost: 150, // +50
  },
  {
    id: "d4e5f0a2-ec5b-6d0e-0f3b-8e7c9b0f1d2g",
    title: "Глубина",
    description: "Четвертая медитация. Погружение в глубины подсознания.",
    detailedDescription: "Самая глубокая медитация стихии Воды. Работа с подсознательными блоками и травмами. Исцеление через принятие и трансформацию внутренних конфликтов.",
    duration: 12,
    artifact: {
      name: "Морская Звезда",
      image: "/images/artifacts/starfish.jpg",
      description: "Символ регенерации. Помогает исцелить душевные раны и обрести целостность."
    },
    order: 4,
    cost: 200, // +50
  }
];


interface Element {
  id: string;
  name: string;
  description: string;
  color_code: string;
  emoji: string;
}

const ELEMENTS_DATA: Record<string, Element> = {
  water: {
    id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a',
    name: 'Вода',
    description: 'Стихия эмоциональной глубины и очищения. Помогает проработать чувства и найти внутренний поток.',
    color_code: '#00A9FF',
    emoji: '🌊'
  }
};

export default function ElementPage() {
  const params = useParams();
  const elementId = params.element as string;
  const { user, getMissionProgress, refreshUserData, unlockMission, isLoading } = useUser();
  const [unlocking, setUnlocking] = useState<string | null>(null);
  
  const element = ELEMENTS_DATA[elementId];
  const missions = elementId === 'water' ? WATER_MISSIONS : [];

  // Обновляем данные при загрузке страницы
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData]);

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

  // Считаем прогресс
  const completedMissions = missions.filter(mission => {
    const progress = getMissionProgress(mission.id);
    return progress?.status === 'completed';
  }).length;
  const progressPercent = missions.length > 0 ? (completedMissions / missions.length) * 100 : 0;

  if (!element) {
    return (
      <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
        <Column maxWidth="s" align="center" gap="l">
          <Heading variant="heading-strong-l">
            Стихия пока недоступна
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Эта стихия будет доступна в будущих обновлениях
          </Text>
          <Link href="/">
            <Button variant="secondary" arrowIcon>
              Вернуться на главную
            </Button>
          </Link>
        </Column>
      </Column>
    );
  }

  if (isLoading) {
    return (
      <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
        <Column maxWidth="s" align="center" gap="l">
          <Text variant="heading-strong-l">Загрузка...</Text>
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
          y: 50,
          colorStart: element.color_code,
          colorEnd: "static-transparent",
        }}
      />
      
      <Navigation
        showBackButton
        backHref="/"
        backText="На главную"
        title={element.name}
      />

      <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
        <Column maxWidth="l" gap="xl">
          
          {/* Header */}
          <Column gap="m" align="center">
            <Text variant="display-strong-l" style={{ fontSize: "4rem" }}>
              {element.emoji}
            </Text>
            <Column gap="s" align="center">
              <Heading 
                variant="display-strong-l" 
                style={{ color: element.color_code }}
                align="center"
              >
                Стихия {element.name}
              </Heading>
              <Badge>
                {completedMissions} из {missions.length} миссий
              </Badge>
            </Column>
            
            <Text
              variant="body-default-l"
              onBackground="neutral-weak"
              align="center"
            >
              {element.description}
            </Text>

            {/* Progress Bar */}
            <Column gap="s" fillWidth maxWidth="m">
              <Row horizontal="space-between" align="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Прогресс стихии
                </Text>
                <Text variant="body-default-s" style={{ color: element.color_code }}>
                  {Math.round(progressPercent)}%
                </Text>
              </Row>
              <div
                style={{ 
                  width: "100%",
                  height: "8px",
                  backgroundColor: "var(--neutral-alpha-weak)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    backgroundColor: element.color_code,
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </Column>
          </Column>

          {/* Missions */}
          <Column gap="l">
            <Heading variant="heading-strong-l" align="center">
              Миссии и медитации
            </Heading>
            
            <Text variant="body-default-l" align="center" onBackground="neutral-weak">
              Пройди миссии по порядку. Новые миссии открываются за свет.
            </Text>

            <Column gap="l" fillWidth>
              {missions.map((mission) => {
                const hasAccess = hasMissionAccess(mission);
                const progress = getMissionProgress(mission.id);
                const needsToBuy = !hasAccess && mission.cost > 0;
                const canBuy = canBuyMission(mission);
                
                return (
                  <Card key={mission.id} radius="l" padding="l" border="neutral-alpha-medium" fillWidth>
                    <Column gap="m">
                      {/* Mission Header */}
                      <Row gap="m" align="center">
                        <Avatar 
                          src={mission.artifact.image} 
                          size="l"
                          style={{
                            filter: hasAccess ? "none" : "grayscale(100%)"
                          }}
                        />
                        <Column gap="xs" fillWidth>
                          <Row gap="s" align="center">
                            <Heading variant="heading-strong-m">{mission.title}</Heading>
                            <Badge>{mission.duration} мин</Badge>
                            {mission.cost > 0 && !hasAccess && (
                              <Badge background="warning-alpha-weak">💰 {mission.cost} СВЕТА</Badge>
                            )}
                          </Row>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {mission.description}
                          </Text>
                          
                          {/* Progress indicator */}
                          {progress && (
                            <Row gap="s" align="center">
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
                                    backgroundColor: element.color_code,
                                    borderRadius: "2px",
                                    transition: "width 0.3s ease"
                                  }} />
                                </div>
                              )}
                            </Row>
                          )}
                        </Column>
                        
                        {/* Action Button */}
                        <Column gap="s" align="end">
                          {hasAccess ? (
                            <Link href={`/elements/water/missions/${mission.order}`}>
                              <Button 
                                variant="primary" 
                                size="s" 
                                arrowIcon
                                style={{
                                  backgroundColor: element.color_code,
                                  borderColor: element.color_code
                                }}
                              >
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

                      {/* Artifact info */}
                      <Card radius="m" padding="m" background="neutral-alpha-weak" fillWidth>
                        <Column gap="s">
                          <Row gap="s" align="start">
                            <Text style={{ fontSize: "1.5rem", flexShrink: 0 }}>⭐</Text>
                            <Column gap="xs" fillWidth style={{ minWidth: 0 }}>
                              <Text variant="heading-strong-s" style={{ color: element.color_code }}>
                                {mission.artifact.name}
                              </Text>
                              <Text variant="label-default-xs" onBackground="neutral-medium">
                                Артефакт за завершение миссии
                              </Text>
                            </Column>
                          </Row>
                          <Text
                            variant="body-default-xs"
                            onBackground="neutral-weak"
                            style={{ 
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                              hyphens: "auto",
                              overflow: "hidden"
                            }}
                          >
                            {mission.artifact.description}
                          </Text>
                        </Column>
                      </Card>

                      {/* Detailed description */}
                      <Card radius="m" padding="m" background="brand-alpha-weak" border="brand-alpha-medium" fillWidth>
                        <Column gap="s">
                          <Text variant="label-default-s" style={{ color: element.color_code }}>
                            О медитации
                          </Text>
                          <Text
                            variant="body-default-xs"
                            onBackground="neutral-weak"
                            style={{
                              lineHeight: "1.5",
                              fontStyle: "italic",
                              opacity: hasAccess ? 1 : 0.7,
                              wordBreak: "break-word",
                              hyphens: "auto",
                              overflow: "hidden"
                            }}
                          >
                            {mission.detailedDescription}
                          </Text>
                        </Column>
                      </Card>
                    </Column>
                  </Card>
                );
              })}
            </Column>
          </Column>


        </Column>
      </Column>
    </Column>
  );
} 