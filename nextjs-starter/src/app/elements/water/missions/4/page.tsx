"use client";

import {
  Heading,
  Text,
  Button,
  Column,
  Card,
  Background,
} from "@once-ui-system/core";
import Link from "next/link";
import { Navigation } from "../../../../../components/Navigation";

export default function Mission4Page() {
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
        backHref="/elements/water/missions" 
        backText="К миссиям"
        title="Глубина"
      />
      
      <Column fillWidth center padding="l" gap="xl" style={{ position: "relative", zIndex: 1 }}>
        <Column maxWidth="m" gap="xl" align="center">
          <Text variant="display-strong-l" style={{ fontSize: "3rem" }}>
            🌊
          </Text>
          
          <Heading variant="display-strong-l" style={{ color: "#00A9FF" }}>
            Миссия 4: Глубина
          </Heading>

          <Card radius="l" padding="l" background="neutral-alpha-weak">
            <Column gap="m" align="center">
              <Text variant="body-default-l" onBackground="neutral-weak" align="center">
                Эта миссия находится в разработке и скоро будет доступна.
              </Text>
              <Text variant="body-default-m" onBackground="neutral-weak" align="center">
                Погружение в глубины подсознания. Откройте скрытые ресурсы и внутреннюю мудрость.
              </Text>
            </Column>
          </Card>

          <Link href="/elements/water/missions">
            <Button variant="secondary" arrowIcon>
              Вернуться к миссиям
            </Button>
          </Link>
        </Column>
      </Column>
    </Column>
  );
} 