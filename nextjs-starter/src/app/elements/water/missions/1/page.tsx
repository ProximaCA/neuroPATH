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
  Background,
  IconButton,
} from "@once-ui-system/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MeditationPlayer } from "../../../../../components/MusicPlayer";
import { MissionProgressTracker } from "../../../../../components/MissionProgressTracker";
import { useUser } from "../../../../../lib/user-context";
import { triggerHaptic } from "../../../../../lib/telegram";
import { Navigation } from "../../../../../components/Navigation";

interface MissionProgress {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isCompleted: boolean;
  timeRemaining: number;
}

export default function MissionPage() {
  const { user, getMissionProgress, updateUserProgress, completeMission: completeUserMission, hasArtifact } = useUser();
  const missionId = 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d'; // First Water mission
  
  const [progress, setProgress] = useState<MissionProgress>({
    currentStep: 0,
    totalSteps: 5,
    isPlaying: false,
    isCompleted: false,
    timeRemaining: 300, // 5 minutes in seconds
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const userProgress = getMissionProgress(missionId);
  const artifactEarned = hasArtifact('c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f');

  const missionSteps = [
    { title: "Интро", duration: "0:30", description: "Вход в стихию Воды" },
    { title: "Дыхание", duration: "0:50", description: "Техника расслабления" },
    { title: "Погружение", duration: "1:40", description: "Визуализация воды" },
    { title: "Метафора тела", duration: "1:00", description: "Работа с эмоциями" },
    { title: "Завершение", duration: "1:00", description: "Закрепление состояния" }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioTimeUpdate = (currentTime: number) => {
    setCurrentTimeSeconds(currentTime);
    const remaining = Math.max(0, 300 - currentTime);
    setProgress(prev => ({ ...prev, timeRemaining: remaining }));
  };

  const handleAudioEnded = () => {
    setProgress(prev => ({ ...prev, isPlaying: false }));
    // Auto complete mission when audio ends
    completeMission();
  };

  // Fallback timer for when audio is not available
  useEffect(() => {
    if (progress.isPlaying && !timerInterval) {
      const interval = setInterval(() => {
        setCurrentTimeSeconds(prev => {
          const newTime = prev + 1;
          const remaining = Math.max(0, 300 - newTime);
          setProgress(p => ({ ...p, timeRemaining: remaining }));
          
          // Auto complete when time is up
          if (newTime >= 300) {
            completeMission();
            return 300;
          }
          
          return newTime;
        });
      }, 1000);
      
      setTimerInterval(interval);
    } else if (!progress.isPlaying && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [progress.isPlaying, timerInterval]);

  const startMission = async () => {
    triggerHaptic('impact', 'medium');
    setShowInstructions(false);
    setProgress(prev => ({ ...prev, isPlaying: true, currentStep: 1 }));
    
    // Update user progress to 'in_progress'
    if (userProgress?.status === 'not_started') {
      await updateUserProgress(missionId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_step: 1,
        progress_percentage: 20,
      });
    }
  };

  const completeMission = async () => {
    setIsCompleting(true);
    triggerHaptic('notification', 'success');
    
    try {
      // Update local progress first for immediate feedback
      setProgress(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
      
      // Try to complete mission in database
      if (user && updateUserProgress) {
        await updateUserProgress(missionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_step: 5,
          progress_percentage: 100,
          time_spent_seconds: 300, // 5 minutes
        });
        
        // Try to call the complete mission function
        const result = await completeUserMission(missionId);
        console.log('Mission completion result:', result);
      }
      
      // Show success regardless of database result
      console.log('Mission completed successfully!');
      
    } catch (error) {
      console.error('Error completing mission:', error);
      // Don't revert the UI state - mission is still "completed" locally
      triggerHaptic('notification', 'warning');
    } finally {
      setIsCompleting(false);
    }
  };

  const togglePlayPause = () => {
    triggerHaptic('selection');
    setProgress(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Check if mission is already completed
  useEffect(() => {
    if (userProgress?.status === 'completed' && artifactEarned) {
      setProgress(prev => ({ ...prev, isCompleted: true }));
    }
  }, [userProgress, artifactEarned]);

  if (showInstructions) {
    return (
      <Column fillWidth style={{ minHeight: "100vh" }}>
        <Background
          position="absolute"
          left="0"
          top="0"
          gradient={{
            display: true,
            opacity: 30,
            x: 50,
            y: 50,
            colorStart: "#00A9FF",
            colorEnd: "static-transparent",
          }}
          dots={{
            display: true,
            opacity: 20,
            size: "4",
            color: "#00A9FF"
          }}
        />

        {/* Navigation */}
        <Navigation 
          showBackButton 
          backHref="/elements/water" 
          backText="К миссиям"
          title="Погружение"
        />
        
        <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
          <Column maxWidth="m" gap="xl">
            {/* Header */}
            <Column gap="m">
              <Row gap="m" align="center">
                <Text variant="display-strong-l" style={{ fontSize: "3rem" }}>
                  🌊
                </Text>
                <Column gap="xs">
                  <Heading variant="display-strong-l" style={{ color: "#00A9FF" }}>
                    Погружение
                  </Heading>
                  <Badge>5 мин • Первый контакт</Badge>
                </Column>
              </Row>
            </Column>

            {/* Mission Image Placeholder */}
            <div
              style={{
                width: "100%",
                height: "300px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #00A9FF, #0080CC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                filter: "brightness(0.9)"
              }}
            >
              ��
            </div>

            {/* Mission Description */}
            <Card radius="l" padding="l" background="neutral-alpha-weak">
              <Column gap="m">
                <Heading variant="heading-strong-l">О миссии</Heading>
                <Text variant="body-default-l" onBackground="neutral-weak">
                  Первый контакт со стихией Воды. Мягкое погружение в медитативное состояние 
                  через дыхание и визуализацию. Поможет почувствовать внутренний поток и 
                  научиться принимать свои эмоции без сопротивления.
                </Text>

                <Column gap="s">
                  <Text variant="heading-strong-s">Что вас ждет:</Text>
                  {missionSteps.map((step, index) => (
                    <Row key={index} gap="m" align="center">
                      <Badge>{step.duration}</Badge>
                      <Column gap="xs" fillWidth>
                        <Text variant="label-default-m">{step.title}</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.description}
                        </Text>
                      </Column>
                    </Row>
                  ))}
                </Column>

                <Column gap="s" paddingTop="m">
                  <Text variant="heading-strong-s">Подготовка:</Text>
                  <Column gap="xs">
                    <Row gap="xs" align="center">
                      ✅
                      <Text variant="body-default-s">Найдите тихое место</Text>
                    </Row>
                    <Row gap="xs" align="center">
                      ✅
                      <Text variant="body-default-s">Используйте наушники</Text>
                    </Row>
                    <Row gap="xs" align="center">
                      ✅
                      <Text variant="body-default-s">Примите удобную позу</Text>
                    </Row>
                  </Column>
                </Column>
              </Column>
            </Card>

            {/* Progress Tracker */}
            <MissionProgressTracker missionId={missionId} showControls={false} />

            {/* Artifact Preview */}
            <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
              <Row gap="m" align="center">
                <Avatar 
                  src="/images/artifacts/pearl.jpg"
                  size="l"
                />
                <Column gap="xs" fillWidth>
                  <Row gap="xs" align="center">
                    ⭐
                    <Text variant="label-default-m" style={{ color: "#00A9FF" }}>
                      {artifactEarned ? 'Получено: Жемчужина Чуткости' : 'Награда: Жемчужина Чуткости'}
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Символ глубокого понимания своих эмоций. Поможет распознавать 
                    тонкие оттенки чувств и принимать их без осуждения.
                  </Text>
                </Column>
              </Row>
            </Card>

            {/* Start Button */}
            <Button
              variant="primary"
              size="l"
              fillWidth
              style={{ 
                backgroundColor: "#00A9FF",
                borderColor: "#00A9FF",
                fontSize: "1.125rem",
                padding: "16px"
              }}
              onClick={startMission}
              arrowIcon
            >
              Начать медитацию
            </Button>
          </Column>
        </Column>
      </Column>
    );
  }

  if (progress.isCompleted) {
    return (
      <Column fillWidth style={{ minHeight: "100vh" }}>
        <Background
          position="absolute"
          left="0"
          top="0"
          gradient={{
            display: true,
            opacity: 40,
            x: 50,
            y: 50,
            colorStart: "#00A9FF",
            colorEnd: "#4CAF50",
          }}
        />

        {/* Navigation */}
        <Navigation 
          showBackButton 
          backHref="/elements/water" 
          backText="К миссиям"
          title="Завершено!"
        />
        
        <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
          <Column maxWidth="s" gap="xl" align="center">
            <Text variant="display-strong-l" style={{ fontSize: "4rem" }}>
              ✨
            </Text>
            
            <Column gap="m" align="center">
              <Heading variant="display-strong-l" style={{ color: "#00A9FF" }}>
                Миссия завершена!
              </Heading>
              <Text variant="body-default-l" onBackground="neutral-weak" align="center">
                Вы успешно прошли первую медитацию стихии Воды
              </Text>
            </Column>

            {/* Artifact Earned */}
            <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
              <Column gap="m" align="center">
                <Avatar 
                  src="/images/artifacts/pearl.jpg"
                  size="xl"
                />
                <Column gap="xs" align="center">
                  <Row gap="xs" align="center">
                    ⭐
                    <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                      Жемчужина Чуткости
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                    Получена за завершение первой медитации
                  </Text>
                </Column>
              </Column>
            </Card>

            <Column gap="m" fillWidth>
              <Link href="/elements/water">
                <Button variant="primary" fillWidth arrowIcon>
                  К следующей миссии
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="secondary" fillWidth>
                  Посмотреть прогресс
                </Button>
              </Link>
            </Column>
          </Column>
        </Column>
      </Column>
    );
  }

  // Main meditation interface
  return (
    <Column fillWidth style={{ minHeight: "100vh" }}>
      <Background
        position="absolute"
        left="0"
        top="0"
        gradient={{
          display: true,
          opacity: "25" as any,
          x: 50,
          y: 50,
          colorStart: "#00A9FF",
          colorEnd: "static-transparent",
        }}
        dots={{
          display: true,
          opacity: "15" as any,
          size: "24" as any,
          color: "#00A9FF"
        }}
      />

      {/* Navigation */}
      <Navigation 
        showBackButton 
        backHref="/elements/water" 
        backText="Выйти"
        title={`Шаг ${progress.currentStep} из ${progress.totalSteps}`}
      />
    
      <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
        <Column maxWidth="l" gap="xl">
          {/* Header with progress */}
          <Column gap="m">
            <Row gap="s" align="center" horizontal="space-between">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatTime(progress.timeRemaining)}
              </Text>
            </Row>

            {/* Progress Bar */}
            <div
              style={{ 
                width: "100%",
                height: "6px",
                backgroundColor: "var(--neutral-alpha-weak)",
                borderRadius: "3px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${(progress.currentStep / progress.totalSteps) * 100}%`,
                  height: "100%",
                  backgroundColor: "#00A9FF",
                  transition: "width 0.5s ease"
                }}
              />
            </div>
          </Column>

          {/* Current Step Info */}
          <Card radius="l" padding="l" background="neutral-alpha-weak" align="center">
            <Column gap="s" align="center">
              <Heading variant="heading-strong-l" style={{ color: "#00A9FF" }}>
                {missionSteps[progress.currentStep - 1]?.title || "Подготовка"}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" align="center">
                {missionSteps[progress.currentStep - 1]?.description || "Готовимся к началу"}
              </Text>
            </Column>
          </Card>

          {/* Meditation Player */}
          <MeditationPlayer 
            isPlaying={progress.isPlaying}
            onPlayPause={togglePlayPause}
            currentTime={formatTime(currentTimeSeconds)}
            totalTime="5:00"
            title={missionSteps[progress.currentStep - 1]?.title || "Погружение"}
            description="Медитация стихии Воды"
            audioSrc="/audio/water-meditation.mp3"
            onAudioTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
          />

          {/* Meditation Visual */}
          <Column align="center" gap="l">
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00A9FF, #0080CC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                filter: "blur(1px) brightness(0.8)",
                opacity: progress.isPlaying ? 1 : 0.6,
                transition: "all 0.5s ease",
                animation: progress.isPlaying ? "pulse 3s infinite" : "none"
              }}
            >
              🌊
            </div>
            
            <Text 
              variant="body-default-l" 
              onBackground="neutral-weak" 
              align="center"
              style={{
                fontStyle: "italic",
                opacity: 0.8
              }}
            >
              &ldquo;Ты — вода. Не борись. Стань потоком.&rdquo;
            </Text>
          </Column>

          {/* Complete Button */}
          <Column gap="m" align="center" fillWidth>
            <Button
              variant="primary"
              size="l"
              fillWidth
              style={{ 
                backgroundColor: "#00A9FF",
                borderColor: "#00A9FF",
                maxWidth: "300px"
              }}
              onClick={completeMission}
              disabled={isCompleting}
            >
              {isCompleting ? "Завершение..." : "Завершить медитацию"}
            </Button>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Нажмите когда будете готовы завершить сессию
            </Text>
          </Column>
        </Column>
      </Column>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Column>
  );
} 