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
  Media,
  Avatar,
} from "@once-ui-system/core";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface Mission {
  id: string;
  name: string;
  description: string;
  order: number;
  audio_url: string | null;
}

interface Element {
  id: string;
  name: string;
  description: string;
  color_code: string;
  image_url: string;
  missions?: Mission[];
}

export default function ElementPage() {
  const params = useParams();
  const elementId = params.element as string;
  const [element, setElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback данные для стихии Воды
  const fallbackWaterElement = {
    id: 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a',
    name: 'Вода',
    description: 'Стихия эмоциональной глубины и очищения. Помогает проработать чувства и найти внутренний поток.',
    color_code: '#00A9FF',
    image_url: '/images/elements/water.jpg',
    missions: [
      {
        id: 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d',
        name: 'Погружение',
        description: 'Первый контакт со стихией Воды через медитацию дыхания',
        order: 1,
        audio_url: null
      },
      {
        id: 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d',
        name: 'Растворение',
        description: 'Освобождение от страхов и тревог через визуализацию',
        order: 2,
        audio_url: null
      },
      {
        id: 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e',
        name: 'Поток принятия',
        description: 'Глубокая практика принятия и отпускания',
        order: 3,
        audio_url: null
      }
    ]
  };

  useEffect(() => {
    const fetchElement = async () => {
      try {
        setLoading(true);
        
        // Получаем данные стихии
        const { data: elementData, error: elementError } = await supabase
          .from('elements')
          .select('*')
          .eq('id', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a') // Water element ID
          .single();

        if (elementError) {
          console.warn('Supabase element error:', elementError);
          console.log('Using fallback data for element');
          setElement(fallbackWaterElement);
          return;
        }

        // Получаем миссии для стихии
        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select('*')
          .eq('element_id', elementData.id)
          .order('order');

        if (missionsError) {
          console.warn('Supabase missions error:', missionsError);
          console.log('Using fallback missions');
          setElement({
            ...elementData,
            missions: fallbackWaterElement.missions
          });
          return;
        }

        setElement({
          ...elementData,
          missions: missionsData || fallbackWaterElement.missions
        });

      } catch (err) {
        console.error('Error fetching element:', err);
        console.log('Using fallback data due to error');
        setElement(fallbackWaterElement);
      } finally {
        setLoading(false);
      }
    };

    if (elementId === 'water') {
      fetchElement();
    } else {
      setError('Эта стихия пока недоступна');
      setLoading(false);
    }
  }, [elementId]);

  if (loading) {
    return (
      <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
        <Column maxWidth="s" align="center" gap="l">
          <Text variant="heading-strong-l">Загрузка...</Text>
        </Column>
      </Column>
    );
  }

  if (error || !element) {
    return (
      <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
        <Column maxWidth="s" align="center" gap="l">
          <Heading variant="heading-strong-l">
            {error || 'Стихия не найдена'}
          </Heading>
          <Link href="/">
            <Button variant="secondary" arrowIcon>
              Вернуться на главную
            </Button>
          </Link>
        </Column>
      </Column>
    );
  }

  const completedMissions = 0; // TODO: Получать из mission_progress
  const progressPercent = (completedMissions / (element.missions?.length || 1)) * 100;

  // Получаем имена артефактов для каждой миссии
  const getArtifactInfo = (missionIndex: number) => {
    const artifacts = [
      { 
        name: "Жемчужина Чуткости", 
        src: "/images/artifacts/pearl.jpg",
        description: "Символ глубокого понимания своих эмоций. Помогает распознавать тонкие оттенки чувств и принимать их без осуждения."
      },
      { 
        name: "Слеза Сочувствия", 
        src: "/images/artifacts/lock.jpg",
        description: "Кристаллизованная эмпатия. Открывает способность чувствовать связь с другими через собственную уязвимость."
      },
      { 
        name: "Кристалл Принятия", 
        src: "/images/artifacts/lock.jpg",
        description: "Прозрачный камень внутренней мудрости. Дарует силу принимать жизнь такой, какая она есть, находя покой в потоке перемен."
      }
    ];
    return artifacts[missionIndex] || { 
      name: "Заблокировано", 
      src: "/images/artifacts/lock.jpg",
      description: "Этот артефакт откроется после завершения предыдущих миссий."
    };
  };

  // Получаем изображения для миссий
  const getMissionImage = (missionIndex: number) => {
    const images = [
      "/images/elements/water_mission_1.jpg", // Погружение - есть
      "/images/demo.jpg", // Растворение - fallback пока нет картинки
      "/images/demo.jpg"  // Поток принятия - fallback пока нет картинки
    ];
    return images[missionIndex] || "/images/demo.jpg";
  };

  // Получаем детальные описания миссий
  const getMissionDetails = (missionIndex: number) => {
    const details = [
      "Первый контакт со стихией Воды. Мягкое погружение в медитативное состояние через дыхание и визуализацию. Поможет почувствовать внутренний поток и научиться принимать свои эмоции без сопротивления.",
      "Освобождение от страхов и тревог через технику растворения. Работа с дыханием 4-7-8 и образными представлениями. Учимся отпускать то, что нас сковывает.",
      "Глубокая практика принятия жизни такой, какая она есть. Работа с обидами и привязанностями. Обретение внутреннего покоя через поток осознанности."
    ];
    return details[missionIndex] || "Описание миссии будет доступно после разблокировки.";
  };

  return (
    <Column fillWidth center padding="l" style={{ minHeight: "100vh" }}>
      <Column maxWidth="m" gap="xl">
        
        {/* Header */}
        <Column gap="m">
          <Row gap="s" align="center" horizontal="space-between">
            <Link href="/">
              <Button variant="tertiary" prefixIcon="arrow-left" size="s">
                Назад
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="tertiary" size="s">
                👤
              </Button>
            </Link>
          </Row>

          <Row gap="m" align="center">
            <Text variant="display-strong-l" style={{ fontSize: "3rem" }}>
              🌊
            </Text>
            <Column gap="xs">
              <Heading 
                variant="display-strong-l" 
                style={{ color: element.color_code }}
              >
                {element.name}
              </Heading>
              <Badge>
                {completedMissions} из {element.missions?.length || 0} миссий
              </Badge>
            </Column>
          </Row>

          <Text
            variant="body-default-l"
            onBackground="neutral-weak"
            wrap="balance"
          >
            {element.description}
          </Text>

          {/* Progress Bar */}
          <Column gap="s">
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

        {/* Missions List */}
        <Column gap="l">
          <Heading variant="heading-strong-l">Миссии</Heading>
          
          <Column gap="l">
            {element.missions?.map((mission, index) => {
              const isAvailable = index === 0;
              const artifact = getArtifactInfo(index);
              const missionImage = getMissionImage(index);
              const missionDetails = getMissionDetails(index);

              return (
                <Column key={mission.id} gap="m">
                  {/* Mission Image - using div with background-image */}
                  <div
                    style={{
                      width: "100%",
                      height: "900px",
                      borderRadius: "12px",
                      backgroundImage: `url(${missionImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: isAvailable ? "none" : "grayscale(100%)",
                      backgroundColor: "#f0f0f0"
                    }}
                  />

                  <Card
                    radius="l"
                    border="neutral-alpha-medium"
                    direction="column"
                    style={{
                      background: isAvailable 
                        ? "var(--neutral-alpha-weak)"
                        : "var(--neutral-alpha-weak)",
                      borderColor: isAvailable
                        ? "var(--neutral-alpha-medium)"
                        : "var(--neutral-alpha-weak)",
                      opacity: isAvailable ? 1 : 0.6,
                    }}
                  >
                    {/* Mission Content */}
                    <Column padding="l" gap="m">
                      <Row gap="l" align="start">
                        
                        {/* Mission Status Icon */}
                        <Column align="center" vertical="center" style={{ minWidth: "40px" }}>
                          {isAvailable ? (
                            <Icon 
                              name="play-circle" 
                              size="l" 
                              onBackground="neutral-medium"
                            />
                          ) : (
                            <Text style={{ fontSize: "2rem" }}>🔒</Text>
                          )}
                        </Column>

                        {/* Mission Info */}
                        <Column gap="s" fillWidth>
                          <Row gap="s" align="center">
                            <Heading variant="heading-strong-m">
                              {mission.name}
                            </Heading>
                            <Badge>
                              5 мин
                            </Badge>
                          </Row>

                          <Text
                            variant="body-default-s"
                            onBackground="neutral-weak"
                          >
                            {mission.description}
                          </Text>
                        </Column>

                        {/* Action Button */}
                        <Column align="end">
                          {isAvailable ? (
                            <Link href={`/elements/water/missions/${index + 1}`}>
                              <Button
                                variant="primary"
                                size="s"
                                style={{ 
                                  backgroundColor: element.color_code,
                                  borderColor: element.color_code,
                                }}
                                arrowIcon
                              >
                                Начать
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="secondary"
                              size="s"
                              disabled
                            >
                              Заблокировано
                            </Button>
                          )}
                        </Column>
                      </Row>

                      {/* Artifact Section */}
                      <Column gap="s" paddingTop="s">
                        <Row gap="m" align="center">
                          <Avatar 
                            src={artifact.src}
                            size="xl"
                            style={{
                              filter: isAvailable ? "none" : "grayscale(100%)"
                            }}
                          />
                          <Column gap="xs" fillWidth>
                            <Row gap="xs" align="center">
                              ⭐
                              <Text variant="code-default-xs" onBackground="neutral-weak">
                                Артефакт: {artifact.name}
                              </Text>
                            </Row>
                            <Text
                              variant="body-default-s"
                              onBackground="neutral-weak"
                              style={{
                                fontSize: "0.875rem",
                                lineHeight: "1.4",
                                opacity: isAvailable ? 1 : 0.7
                              }}
                            >
                              {artifact.description}
                            </Text>
                          </Column>
                        </Row>
                      </Column>
                    </Column>
                  </Card>

                  {/* Mission Details Below Card */}
                  <Text
                    variant="body-default-m"
                    onBackground="neutral-weak"
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--neutral-alpha-weak)",
                      borderRadius: "12px",
                      border: "1px solid var(--neutral-alpha-weak)",
                      lineHeight: "1.6",
                      opacity: isAvailable ? 1 : 0.7
                    }}
                  >
                    {missionDetails}
                  </Text>
                </Column>
              );
            })}
          </Column>
        </Column>

      </Column>
    </Column>
  );
} 