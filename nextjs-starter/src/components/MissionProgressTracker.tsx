'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Column, 
  Row, 
  Text, 
  Button, 
  Icon, 
  Badge,
  Heading
} from '@once-ui-system/core';
import { useUser } from '../lib/user-context-kv';
import { triggerHaptic } from '../lib/telegram';

interface MissionProgressTrackerProps {
  missionId: string;
  onProgressUpdate?: (progress: number) => void;
  showControls?: boolean;
}

export function MissionProgressTracker({ 
  missionId, 
  onProgressUpdate, 
  showControls = true 
}: MissionProgressTrackerProps) {
  const { getMissionProgress, updateUserProgress, completeMission, user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const progress = getMissionProgress(missionId);
  
  useEffect(() => {
    if (progress && onProgressUpdate) {
      onProgressUpdate(progress.progress_percentage);
    }
  }, [progress, onProgressUpdate]);

  const handleStepForward = async () => {
    if (!progress || !user || isUpdating) return;
    
    setIsUpdating(true);
    triggerHaptic('impact', 'light');
    
    const newStep = Math.min(progress.current_step + 1, progress.total_steps);
    const newProgress = Math.round((newStep / progress.total_steps) * 100);
    
    await updateUserProgress(missionId, {
      current_step: newStep,
      progress_percentage: newProgress,
      status: newStep === progress.total_steps ? 'completed' : 'in_progress',
      time_spent_seconds: progress.time_spent_seconds + 60, // Add 1 minute
    });
    
    if (newStep === progress.total_steps) {
      // Mission completed
      const result = await completeMission(missionId);
      if (result) {
        triggerHaptic('notification', 'success');
      }
    }
    
    setIsUpdating(false);
  };

  const handleStepBack = async () => {
    if (!progress || !user || isUpdating || progress.current_step <= 0) return;
    
    setIsUpdating(true);
    triggerHaptic('impact', 'light');
    
    const newStep = Math.max(progress.current_step - 1, 0);
    const newProgress = Math.round((newStep / progress.total_steps) * 100);
    
    await updateUserProgress(missionId, {
      current_step: newStep,
      progress_percentage: newProgress,
      status: newStep === 0 ? 'not_started' : 'in_progress',
    });
    
    setIsUpdating(false);
  };

  const handleReset = async () => {
    if (!progress || !user || isUpdating) return;
    
    setIsUpdating(true);
    triggerHaptic('impact', 'medium');
    
    await updateUserProgress(missionId, {
      current_step: 0,
      progress_percentage: 0,
      status: 'not_started',
      attempts: progress.attempts + 1,
    });
    
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'not_started': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В процессе';
      case 'not_started': return 'Не начато';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check';
      case 'in_progress': return 'clock';
      case 'not_started': return 'play';
      default: return 'help';
    }
  };

  if (!progress) {
    return (
      <Card padding="m" border="neutral-alpha-weak" radius="l">
        <Text variant="body-default-s" onBackground="neutral-weak">
          Прогресс не найден
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="l" border="neutral-alpha-medium" radius="l">
      <Column gap="m">
        {/* Status Header */}
        <Row horizontal="space-between" align="center">
          <Row gap="s" align="center">
            <Icon 
              name={getStatusIcon(progress.status)} 
              size="s" 
              style={{ color: getStatusColor(progress.status) }}
            />
            <Text variant="heading-default-s">
              {getStatusText(progress.status)}
            </Text>
          </Row>
          <Badge style={{ 
            backgroundColor: getStatusColor(progress.status), 
            color: 'white' 
          }}>
            {progress.progress_percentage}%
          </Badge>
        </Row>

        {/* Progress Bar */}
        <Column gap="xs">
          <Row horizontal="space-between" align="center">
            <Text variant="code-default-xs" onBackground="neutral-medium">
              Шаг {progress.current_step} из {progress.total_steps}
            </Text>
            <Text variant="code-default-xs" onBackground="neutral-medium">
              {Math.floor(progress.time_spent_seconds / 60)} мин
            </Text>
          </Row>
          
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--neutral-alpha-weak)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress.progress_percentage}%`,
              height: '100%',
              backgroundColor: getStatusColor(progress.status),
              transition: 'width 0.3s ease'
            }} />
          </div>
        </Column>

        {/* Step Indicators */}
        <Row gap="xs" align="center" horizontal="center">
          {Array.from({ length: progress.total_steps }, (_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index < progress.current_step 
                  ? getStatusColor(progress.status)
                  : 'var(--neutral-alpha-weak)',
                border: index === progress.current_step 
                  ? `2px solid ${getStatusColor(progress.status)}`
                  : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Row>

        {/* Statistics */}
        <Row gap="l" horizontal="center">
          <Column align="center" gap="xs">
            <Text variant="code-default-xs" onBackground="neutral-weak">
              Попыток
            </Text>
            <Text variant="heading-default-s">
              {progress.attempts}
            </Text>
          </Column>
          <Column align="center" gap="xs">
            <Text variant="code-default-xs" onBackground="neutral-weak">
              Время
            </Text>
            <Text variant="heading-default-s">
              {Math.floor(progress.time_spent_seconds / 60)}м
            </Text>
          </Column>
        </Row>

        {/* Controls */}
        {showControls && (
          <Row gap="s" fillWidth>
            <Button
              variant="secondary"
              size="s"
              prefixIcon="arrow-left"
              onClick={handleStepBack}
              disabled={isUpdating || progress.current_step <= 0}
              fillWidth
            >
              Назад
            </Button>
            
            {progress.status !== 'completed' ? (
              <Button
                variant="primary"
                size="s"
                suffixIcon="arrow-right"
                onClick={handleStepForward}
                disabled={isUpdating}
                fillWidth
                style={{
                  backgroundColor: getStatusColor('in_progress'),
                  borderColor: getStatusColor('in_progress')
                }}
              >
                {isUpdating ? 'Обновление...' : 
                 progress.current_step === progress.total_steps - 1 ? 'Завершить' : 'Далее'}
              </Button>
            ) : (
              <Button
                variant="tertiary"
                size="s"
                prefixIcon="refresh"
                onClick={handleReset}
                disabled={isUpdating}
                fillWidth
              >
                Повторить
              </Button>
            )}
          </Row>
        )}

        {/* Last Activity */}
        {progress.last_activity && (
          <Text variant="code-default-xs" onBackground="neutral-weak" align="center">
            Последняя активность: {new Date(progress.last_activity).toLocaleString('ru-RU')}
          </Text>
        )}
      </Column>
    </Card>
  );
} 