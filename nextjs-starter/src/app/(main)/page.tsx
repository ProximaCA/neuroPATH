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
  LetterFx,
  Media,
  Line,
  Avatar,
} from "@once-ui-system/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../lib/user-context";
import { triggerHaptic } from "../../lib/telegram";

interface Element {
  id: string;
  name: string;
  description: string;
  color_code: string;
  image_url: string;
  image: string;
}

const staticElements = [
  {
    id: "water",
    name: "Вода",
    emoji: "🌊",
    description: "Эмоциональная глубина, очищение.",
    color: "#00A9FF",
    isAvailable: true,
    missions: 3,
    progress: 0,
    image: "/images/elements/water_card.png",
  },
  {
    id: "fire", 
    name: "Огонь",
    emoji: "🔥",
    description: "Пробуждение воли, сила действия.",
    color: "#FF4500",
    isAvailable: false,
    missions: 4,
    progress: 0,
    image: "/images/elements/fire_card.png",
  },
  {
    id: "air",
    name: "Воздух", 
    emoji: "🌪️",
    description: "Ментальная лёгкость, прояснение ума.",
    color: "#87CEEB",
    isAvailable: false,
    missions: 5,
    progress: 0,
    image: "/images/elements/air_card.png",
  },
  {
    id: "earth",
    name: "Земля",
    emoji: "🌍", 
    description: "Стабилизация, укоренение, телесная ясность.",
    color: "#8B4513",
    isAvailable: false,
    missions: 4,
    progress: 0,
    image: "/images/elements/earth_card.png",
  },
];

export default function Home() {
  const { user, isLoading: userLoading, missionProgress, getMissionProgress } = useUser();
  const [waterElement, setWaterElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaterElement = async () => {
      try {
        const { data, error } = await supabase
          .from('elements')
          .select('*')
          .eq('id', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a')
          .single();

        if (error) {
          console.error('Supabase error:', error);
        } else {
          setWaterElement(data);
        }
      } catch (err) {
        console.error('Error fetching water element:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterElement();
  }, []);

  // Рассчитываем прогресс для Water элемента
  const calculateWaterProgress = () => {
    if (!missionProgress.length) return 0;
    const waterMissions = missionProgress.filter(p => 
      ['d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e'].includes(p.mission_id)
    );
    const totalProgress = waterMissions.reduce((sum, mission) => sum + mission.progress_percentage, 0);
    return Math.round(totalProgress / 3); // Average progress across 3 missions
  };

  // Объединяем реальные данные со static данными
  const elements = staticElements.map(element => {
    if (element.id === 'water' && waterElement) {
      return {
        ...element,
        name: waterElement.name,
        description: waterElement.description,
        color: waterElement.color_code,
        progress: calculateWaterProgress(),
      };
    }
    return element;
  });

  return (
    <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
      <Column maxWidth="l" horizontal="center" gap="xl" align="center">
        
        {/* Header */}
        <Column gap="m" align="center" marginBottom="l">
          <Row fillWidth horizontal="space-between" align="center" marginBottom="m">
            <div style={{ width: "40px" }} /> {/* Spacer */}
        <Badge
          textVariant="code-default-s"
          border="neutral-alpha-medium"
          onBackground="neutral-medium"
              paddingX="16"
              paddingY="8"
            >
              🎨 Алхимия Разума 🧠
            </Badge>
            <Link href="/profile">
              <Button 
                variant="tertiary" 
                size="s"
                onClick={() => triggerHaptic('selection')}
              >
                <Row gap="4" align="center">
                  <Icon name="user" size="xs" />
                  {user && (
                    <Text variant="code-default-xs" onBackground="neutral-medium">
                      {user.first_name}
                    </Text>
                  )}
                </Row>
              </Button>
            </Link>
          </Row>
          
          <Heading variant="display-strong-xl" align="center">
            Путешествие через стихии
          </Heading>
          
          <Text
            variant="heading-default-l"
            onBackground="neutral-weak"
            wrap="balance"
            align="center"
          >
            Проработай свои эмоции и страхи через архетипы четырех стихий
          </Text>
        </Column>

        {/* Elements Grid */}
        <Row gap="l"  horizontal="center" >
          {elements.map((element) => (
            <Row key={element.id} maxWidth={24}>
                              <Card 
                  radius="l-4" 
                  direction="column" 
                  style={{
                    opacity: element.isAvailable ? 1 : 0.7,
                    transition: "all 0.3s ease",
                    transform: 'translateY(0)',
                    
                  }}
                  className={element.isAvailable ? "hover:translate-y-[-2px]" : ""}
                >
                
                {/* Header с именем и статусом */}
                <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
                  <Text variant="display-strong-s" style={{ fontSize: "1.5rem" }}>
                    {element.emoji}
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-medium">
                    {element.isAvailable ? 'Доступно' : 'Скоро'}
                  </Text>
                  {!element.isAvailable && (
                    <Icon name="lock" size="xs" onBackground="neutral-weak" />
                  )}
                </Row>

                {/* Изображение элемента */}
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    backgroundImage: `url(${element.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: element.isAvailable ? 'none' : 'grayscale(100%)',
                  }}
                />

                {/* Контент карточки */}
                <Column fillWidth paddingX="20" paddingY="24" gap="12">
                
                  <Heading 
                    variant="heading-strong-l" 
                    style={{ color: element.isAvailable ? element.color : "var(--neutral-weak)" }}
                  >
                    {element.name}
        </Heading>
                  
        <Text
          onBackground="neutral-weak"
                    variant="body-default-s"
          wrap="balance"
        >
                    {element.description}
        </Text>
                </Column>

                {/* Статистика */}
                <Line background="neutral-alpha-medium" />
                <Row
                  paddingX="20" paddingY="12" gap="16" vertical="center"
                  textVariant="label-default-s" onBackground="neutral-medium"
                >
                  <Row gap="4" align="center">
                    <Icon name="target" size="xs" onBackground="neutral-strong" />
                    <Text>{element.missions} миссий</Text>
                  </Row>
                  <Row gap="4" align="center">
                    <Icon name="chart" size="xs" onBackground="neutral-strong" />
                    <Text>{element.progress}% прогресс</Text>
                  </Row>
                </Row>

                {/* Кнопка действия */}
                <Row fillWidth paddingX="20" paddingBottom="20">
                  {element.isAvailable ? (
                    <Link href={`/elements/${element.id}`} style={{ width: "100%" }}>
        <Button
                        fillWidth
                        variant="primary"
                        style={{ 
                          backgroundColor: element.color,
                          borderColor: element.color,
                        }}
          arrowIcon
                        onClick={() => triggerHaptic('impact', 'medium')}
                      >
                        Начать путь
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      fillWidth
                      variant="secondary"
                      disabled
                      onClick={() => triggerHaptic('notification', 'warning')}
                    >
                      Скоро откроется
        </Button>
                  )}
                </Row>

              </Card>
            </Row>
          ))}
        </Row>

        {/* Footer Info */}
        <Column gap="s" align="center" marginTop="xl">
          <Text variant="body-default-s" onBackground="neutral-weak" align="center">
            🌊 Начни свое путешествие со стихии Воды
          </Text>
          <Text variant="code-default-xs" onBackground="neutral-weak" align="center">
            {loading || userLoading ? 'Загрузка данных...' : 'Остальные стихии откроются по мере прохождения'}
          </Text>
          {user && (
            <Row gap="8" align="center" marginTop="s">
              <Icon name="sparkles" size="xs" onBackground="accent-medium" />
              <Text variant="code-default-xs" onBackground="accent-medium">
                СВЕТ: {user.light_balance} | Уровень: {user.level}
              </Text>
            </Row>
          )}
        </Column>

      </Column>
    </Column>
  );
}
