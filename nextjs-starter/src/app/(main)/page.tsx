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
import { Navigation } from "../../components/Navigation";
import { useUser } from "../../lib/user-context-kv";
import { triggerHaptic } from "../../lib/telegram";

// Статические данные элементов (вместо загрузки из БД)
const ELEMENTS_DATA = [
  {
    id: "f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a",
    name: "Вода",
    description: "Принятие и понимание своих эмоций",
    color_code: "#00A9FF",
    image_url: "/images/water-element.jpg",
    unlock_level: 1,
    total_missions: 3,
    created_at: new Date().toISOString(),
    emoji: "🌊",
    isAvailable: true,
    missions: 3,
    progress: 0,
    color: "#00A9FF",
    image: "/images/elements/water_card.png"
  },
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Огонь",
    description: "Трансформация и страсть",
    color_code: "#FF4500",
    image_url: "/images/fire-element.jpg",
    unlock_level: 5,
    total_missions: 3,
    created_at: new Date().toISOString(),
    emoji: "🔥",
    isAvailable: false,
    missions: 4,
    progress: 0,
    color: "#FF4500",
    image: "/images/elements/fire_card.png"
  },
  {
    id: "b2c3d4e5-f6a7-8901-2345-678901bcdef0",
    name: "Воздух", 
    description: "Ясность мысли и легкость",
    color_code: "#87CEEB",
    image_url: "/images/air-element.jpg",
    unlock_level: 10,
    total_missions: 3,
    created_at: new Date().toISOString(),
    emoji: "🌪️",
    isAvailable: false,
    missions: 5,
    progress: 0,
    color: "#87CEEB",
    image: "/images/elements/air_card.png"
  },
  {
    id: "c3d4e5f6-a7b8-9012-3456-789012cdef01",
    name: "Земля",
    description: "Стабильность и заземление",
    color_code: "#8B4513",
    image_url: "/images/earth-element.jpg",
    unlock_level: 15,
    total_missions: 3,
    created_at: new Date().toISOString(),
    emoji: "🌍", 
    isAvailable: false,
    missions: 4,
    progress: 0,
    color: "#8B4513",
    image: "/images/elements/earth_card.png"
  }
];

interface Element {
  id: string;
  name: string;
  description: string;
  color_code: string;
  image_url: string;
  unlock_level: number;
  total_missions: number;
  created_at: string;
  emoji: string;
  isAvailable: boolean;
  missions: number;
  progress: number;
  color: string;
  image: string;
}

export default function Home() {
  const { user, isLoading } = useUser();
  const [elements, setElements] = useState<Element[]>(ELEMENTS_DATA);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleElementClick = (elementId: string, isUnlocked: boolean) => {
    triggerHaptic('impact', 'light');
  };

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
              <Button variant="tertiary" size="s">
                👤Профиль
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
        <Column gap="l" fillWidth align="center">
          {elements.map((element) => (
            <Card 
              key={element.id}
              maxWidth="m"
              fillWidth
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
                <div style={{ 
                  opacity: 0.5, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "4px" 
                }}>
                  🔒
                </div>
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
                🎯
                <Text>{element.missions} миссий</Text>
              </Row>
              <Row gap="4" align="center">
                📊
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
        ))}
      </Column>

      {/* Footer Info */}
      <Column gap="s" align="center" marginTop="xl">
        <Text variant="body-default-s" onBackground="neutral-weak" align="center">
          🌊 Начни свое путешествие со стихии Воды
        </Text>
        <Text variant="code-default-xs" onBackground="neutral-weak" align="center">
          {loading ? 'Загрузка данных...' : 'Остальные стихии откроются по мере прохождения'}
        </Text>
        {user && (
          <Row gap="8" align="center" marginTop="s">
            ✨
            <Text variant="code-default-xs" onBackground="accent-medium">
              СВЕТ: {user.light_balance} | Уровень: {user.level}
            </Text>
          </Row>
        )}
        {user && (
          <Row gap="s" align="center">
            🎯
            <Text variant="code-default-xs" onBackground="neutral-medium">
              {user.total_missions_completed} миссий
            </Text>
          </Row>
        )}
        {user && (
          <Row gap="s" align="center">
            📊
            <Text variant="code-default-xs" onBackground="neutral-medium">
              {user.total_meditation_minutes} мин
            </Text>
          </Row>
        )}
      </Column>

    </Column>
  </Column>
);
}
