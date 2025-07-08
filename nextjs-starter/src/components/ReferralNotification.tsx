"use client";

import {
  Text,
  Button,
  Column,
  Row,
  Card,
  Avatar,
  Background,
} from "@once-ui-system/core";
import { useEffect, useState, useCallback } from "react";
import { triggerHaptic } from "../lib/telegram";

interface ReferralNotificationProps {
  show: boolean;
  onClose: () => void;
  amount: number;
  friendName: string;
  friendAvatar?: string;
  type: 'received' | 'sent';
}

export function ReferralNotification({ 
  show, 
  onClose, 
  amount, 
  friendName, 
  friendAvatar,
  type 
}: ReferralNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  }, [onClose]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      triggerHaptic('notification', 'success');
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, handleClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          maxWidth: '400px',
          width: '100%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
          style={{
            borderRadius: '16px',
            width: '100%',
            height: '100%'
          }}
        />

        <Card 
          radius="l" 
          padding="l" 
          background="neutral-alpha-medium"
          style={{
            position: 'relative',
            zIndex: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 169, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 169, 255, 0.4)'
          }}
        >
          <Column gap="l" align="center">
            {/* Animation Icon */}
            <div
              style={{
                fontSize: '4rem',
                animation: 'bounce 1s infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0, 169, 255, 0.3))'
              }}
            >
              ✨
            </div>

            {/* Message */}
            <Column gap="s" align="center">
              <Text variant="heading-strong-l" style={{ color: "#00A9FF" }}>
                {type === 'received' ? `+${amount} СВЕТА получено!` : `${amount} СВЕТА отправлено!`}
              </Text>
              <Row gap="s" align="center">
                <Avatar 
                  src={friendAvatar || "/images/default-avatar.jpg"} 
                  size="s"
                  style={{
                    border: '2px solid #00A9FF',
                    boxShadow: '0 2px 8px rgba(0, 169, 255, 0.3)'
                  }}
                />
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {type === 'received' ? `от ${friendName}` : `для ${friendName}`}
                </Text>
              </Row>
            </Column>

            {/* Sparkle Animation */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '1.5rem',
                animation: 'sparkle 2s infinite',
                opacity: 0.7
              }}
            >
              💫
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                fontSize: '1rem',
                animation: 'sparkle 2s infinite 0.5s',
                opacity: 0.5
              }}
            >
              ⭐
            </div>
          </Column>
        </Card>

        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            60% {
              transform: translateY(-10px);
            }
          }

          @keyframes sparkle {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.2) rotate(180deg);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 