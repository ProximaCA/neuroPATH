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
import { useEffect, useState, useCallback } from "react";
import { MeditationPlayer } from "../../../../../components/MusicPlayer";
import { MissionProgressTracker } from "../../../../../components/MissionProgressTracker";
import { useUser } from "../../../../../lib/user-context-kv";
import { triggerHaptic } from "../../../../../lib/telegram";
import { Navigation } from "../../../../../components/Navigation";
import React from "react";

interface MissionProgress {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isCompleted: boolean;
  timeRemaining: number;
}

export default function MissionPage() {
  const {
    user,
    getMissionProgress,
    updateUserProgress,
    completeMission: completeUserMission,
    hasArtifact,
    addMeditationSeconds,
    unlockMission,
    refreshUserData
  } = useUser();
  const missionId = 'b2e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0e'; // Second Water mission

  const [progress, setProgress] = useState<MissionProgress>({
    currentStep: 0,
    totalSteps: 6,
    isPlaying: false,
    isCompleted: false,
    timeRemaining: 420, // 7 minutes in seconds
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(420); // Default 7 minutes
  const [hasFinishedMeditation, setHasFinishedMeditation] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const userProgress = getMissionProgress(missionId);
  const artifactEarned = hasArtifact('crystal-acceptance-001');

  const missionSteps = [
    { title: "Вход в поток", duration: "0:40", description: "Настройка на глубокое принятие" },
    { title: "Дыхание принятия", duration: "1:00", description: "Осознанное дыхание для принятия себя" },
    { title: "Погружение в чувства", duration: "1:30", description: "Работа с внутренними ощущениями" },
    { title: "Визуализация воды", duration: "1:00", description: "Образ воды, растворяющей напряжение" },
    { title: "Аффирмации принятия", duration: "1:20", description: "Повторение фраз принятия" },
    { title: "Завершение", duration: "1:30", description: "Закрепление состояния спокойствия" }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioTimeUpdate = (currentTime: number) => {
    const roundedTime = Math.floor(currentTime);
    setCurrentTimeSeconds(roundedTime);
    const remaining = Math.max(0, totalDurationSeconds - roundedTime);
    setProgress(prev => ({ ...prev, timeRemaining: remaining }));
  };

  const handleAudioEnded = () => {
    setProgress(prev => ({ ...prev, isPlaying: false }));
    setHasFinishedMeditation(true);
    triggerHaptic('notification', 'success');
  };

  const handleAudioLoadedMetadata = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    if (audio.duration && !isNaN(audio.duration)) {
      setTotalDurationSeconds(Math.floor(audio.duration));
      setProgress(prev => ({ ...prev, timeRemaining: Math.floor(audio.duration) }));
    }
  };

  const restartMeditation = () => {
    setCurrentTimeSeconds(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    setProgress(prev => ({
      ...prev,
      isPlaying: true,
      timeRemaining: totalDurationSeconds,
      isCompleted: false
    }));
    setHasFinishedMeditation(false);
    triggerHaptic('selection');
  };

  const completeMission = useCallback(async () => {
    setIsCompleting(true);
    triggerHaptic('notification', 'success');
    
    try {
      // Сохраняем реальное время прослушанной сессии при завершении
      console.log(`💾 [CLIENT] Mission 2 finished. Saving ${currentTimeSeconds} seconds (real time listened).`);
      await addMeditationSeconds(currentTimeSeconds);

      setProgress(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
      
      if (user && updateUserProgress) {
        await updateUserProgress(missionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_step: 6,
          progress_percentage: 100,
          time_spent_seconds: currentTimeSeconds, // Реальное время прослушивания
        });
        
        // Try to call the complete mission function
        const result = await completeUserMission(missionId);
        console.log('Mission 2 completion result:', result);
      }
      
      // Show success regardless of database result
      console.log('Mission 2 completed successfully!');
      
    } catch (error) {
      console.error('Error completing mission 2:', error);
      // Don't revert the UI state - mission is still "completed" locally
      triggerHaptic('notification', 'warning');
    } finally {
      setIsCompleting(false);
    }
  }, [user, updateUserProgress, completeUserMission, missionId, currentTimeSeconds, addMeditationSeconds]);

  useEffect(() => {
    if (progress.isPlaying && !timerInterval) {
      const interval = setInterval(() => {
        setCurrentTimeSeconds(prev => {
          const newTime = prev + 1;
          const remaining = Math.max(0, totalDurationSeconds - newTime);
          setProgress(p => ({ ...p, timeRemaining: remaining }));
          if (newTime >= totalDurationSeconds) {
            handleAudioEnded();
            return totalDurationSeconds;
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
  }, [progress.isPlaying, timerInterval, totalDurationSeconds]);

  const startMission = async () => {
    triggerHaptic('impact', 'medium');
    setShowInstructions(false);
    setProgress(prev => ({ ...prev, isPlaying: true, currentStep: 1 }));
    if (userProgress?.status === 'not_started') {
      await updateUserProgress(missionId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_step: 1,
        progress_percentage: 16,
      });
    }
  };

  const togglePlayPause = async () => {
    triggerHaptic('selection');
    if (progress.isPlaying) {
      await saveCurrentProgress();
    }
    setProgress(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const saveCurrentProgress = async () => {
    if (user && currentTimeSeconds > 0) {
      await updateUserProgress(missionId, {
        status: 'in_progress',
        time_spent_seconds: currentTimeSeconds,
        progress_percentage: Math.min(100, Math.floor((currentTimeSeconds / totalDurationSeconds) * 100)),
        current_step: Math.min(6, Math.floor((currentTimeSeconds / totalDurationSeconds) * 6) + 1),
        last_activity: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (userProgress?.status === 'completed' && artifactEarned) {
      setProgress(prev => ({ ...prev, isCompleted: true }));
    }
  }, [userProgress, artifactEarned]);

  // Restore progress on page load
  useEffect(() => {
    if (userProgress && userProgress.status === 'in_progress') {
      const savedTime = userProgress.time_spent_seconds || 0;
      const savedStep = userProgress.current_step || 1;
      const savedProgress = userProgress.progress_percentage || 0;
      
      console.log(`📥 [CLIENT] Restoring mission 2 progress: ${savedTime} seconds, step ${savedStep}, ${savedProgress}%`);
      
      setCurrentTimeSeconds(savedTime);
      setProgress(prev => ({
        ...prev,
        currentStep: savedStep,
        timeRemaining: Math.max(0, totalDurationSeconds - savedTime),
        isPlaying: false, // Always start paused
        isCompleted: false
      }));
      
      // Set audio current time to match saved progress
      if (audioRef.current && savedTime > 0) {
        audioRef.current.currentTime = savedTime;
      }
      
      // Don't show instructions if we have progress
      if (savedTime > 0) {
        setShowInstructions(false);
      }
    }
  }, [userProgress, totalDurationSeconds]);

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
        <Navigation
          showBackButton
          backHref="/elements/water"
          backText="К миссиям"
          title="Глубина принятия"
        />
        <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
          <Column maxWidth="m" gap="xl">
            <Column gap="m">
              <Row gap="m" align="center">
                <Text variant="display-strong-l" style={{ fontSize: "3rem" }}>
                  💧
                </Text>
                <Column gap="xs">
                  <Heading variant="display-strong-l" style={{ color: "#00A9FF" }}>
                    Глубина принятия
                  </Heading>
                  <Badge>7 мин • Вторая миссия</Badge>
                </Column>
              </Row>
            </Column>
          
            <Card radius="l" padding="l" background="neutral-alpha-weak">
              <Column gap="m">
                <Heading variant="heading-strong-l">О миссии</Heading>
                <Text variant="body-default-l" onBackground="neutral-weak">
                  Вторая медитация стихии Воды. Погружение в глубокое принятие себя и своих эмоций. Через дыхание, визуализацию и аффирмации ты научишься принимать себя полностью.
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
            <MissionProgressTracker missionId={missionId} showControls={false} />
            <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
              <Row gap="m" align="center">
                <Avatar
                  src="/images/artifacts/crystal.jpg"
                  size="l"
                />
                <Column gap="xs" fillWidth>
                  <Row gap="xs" align="center">
                    ⭐
                    <Text variant="label-default-m" style={{ color: "#00A9FF" }}>
                      {artifactEarned ? 'Получено: Кристалл Принятия' : 'Награда: Кристалл Принятия'}
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Символ принятия себя и своих эмоций. Помогает обрести внутреннюю гармонию.
                  </Text>
                </Column>
              </Row>
            </Card>
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
        <Navigation
          showBackButton
          backHref="/elements/water"
          backText="К миссиям"
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
                Ты успешно прошел вторую медитацию стихии Воды и получил награды!
              </Text>
            </Column>
            <Column gap="m" fillWidth>
              <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
                <Row gap="m" align="center">
                  <Text style={{ fontSize: "2.5rem" }}>✨</Text>
                  <Column gap="xs" fillWidth>
                    <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                      +10 СВЕТА получено!
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Награда за завершение медитации
                    </Text>
                  </Column>
                </Row>
              </Card>
              <Card radius="l" padding="l" background="brand-alpha-weak" border="brand-alpha-medium">
                <Row gap="m" align="center">
                  <Avatar
                    src="/images/artifacts/crystal.jpg"
                    size="l"
                  />
                  <Column gap="xs" fillWidth>
                    <Row gap="xs" align="center">
                      ⭐
                      <Text variant="heading-strong-m" style={{ color: "#00A9FF" }}>
                        Кристалл Принятия
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Артефакт за завершение второй медитации стихии Воды
                    </Text>
                  </Column>
                </Row>
              </Card>
              <Card radius="l" padding="l" background="neutral-alpha-weak">
                <Column gap="s">
                  <Text variant="heading-strong-s" style={{ color: "#00A9FF" }}>
                    Следующая миссия
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    • Убедитесь, что у вас достаточно света для продолжения
                  </Text>
                </Column>
              </Card>
            </Column>
            <Column gap="m" fillWidth>
              <Link href="/elements/water">
                <Button variant="primary" fillWidth arrowIcon>
                  К списку миссий
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
      <Navigation
        showBackButton
        backHref="/elements/water"
        backText="Выйти"
        title={`Шаг ${progress.currentStep} из ${progress.totalSteps}`}
      />
      <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
        <Column maxWidth="l" gap="xl">
          <Column gap="m">
            <Row horizontal="space-between" vertical="center">
              <Heading variant="display-strong-l" style={{ color: "#00A9FF" }}>
                {formatTime(progress.timeRemaining)}
              </Heading>
              <Button
                variant="secondary"
                onClick={restartMeditation}
              >
                🔄 Начать заново
              </Button>
            </Row>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Осталось до конца медитации
            </Text>
          </Column>
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
                width: `${Math.max(0, Math.min(100, ((currentTimeSeconds / totalDurationSeconds) * 100)))}%`,
                height: "100%",
                backgroundColor: "#00A9FF",
                borderRadius: "3px",
                transition: "width 0.5s ease-in-out"
              }}
            />
          </div>
        </Column>
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
        <MeditationPlayer
          ref={audioRef}
          isPlaying={progress.isPlaying}
          onPlayPause={togglePlayPause}
          currentTime={formatTime(currentTimeSeconds)}
          totalTime={formatTime(totalDurationSeconds)}
          description="Медитация стихии Воды — Глубина принятия"
          audioSrc="/audio/water-acceptance.mp3"
          onAudioTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          onRestart={restartMeditation}
          isCompleted={progress.isCompleted}
          canComplete={hasFinishedMeditation}
          onAudioLoadedMetadata={handleAudioLoadedMetadata}
        />
        <Column align="center" gap="l">
          <Text
            variant="body-default-l"
            onBackground="neutral-weak"
            align="center"
            style={{
              fontStyle: "italic",
              opacity: 0.8
            }}
          >
            &ldquo;Принятие — это ключ к внутренней гармонии.&rdquo;
          </Text>
        </Column>
        {hasFinishedMeditation && (
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
              Медитация завершена! Можешь получить награду
            </Text>
          </Column>
        )}
        {!hasFinishedMeditation && (
          <Column gap="s" align="center" fillWidth>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Прослушай медитацию до конца, чтобы завершить миссию
            </Text>
          </Column>
        )}
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