import { Row, Button, Text, Badge } from "@once-ui-system/core";
import Link from "next/link";
import { useUser } from "../lib/user-context";

interface NavigationProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  title?: string;
}

export function Navigation({ 
  showBackButton = false, 
  backHref = "/", 
  backText = "Назад",
  title 
}: NavigationProps) {
  const { user } = useUser();

  return (
    <Row fillWidth horizontal="space-between" align="center" paddingY="m" paddingX="l">
      {/* Left side - Back button or spacer */}
      {showBackButton ? (
        <Link href={backHref}>
          <Button variant="tertiary" prefixIcon="chevronLeft" size="s">
            {backText}
          </Button>
        </Link>
      ) : (
        <div style={{ width: "80px" }} />
      )}

      {/* Center - Title */}
      {title && (
        <Text variant="heading-strong-m" align="center" style={{ color: "#00A9FF" }}>
          {title}
        </Text>
      )}

      {/* Right side - Profile button */}
      <Link href="/profile">
        <Button variant="tertiary" size="s" style={{ position: "relative" }}>
          <Row gap="xs" align="center">
            👤Профиль
            {user && (
              <Badge 
                style={{ 
                  backgroundColor: "#00A9FF", 
                  color: "white",
                  fontSize: "0.75rem",
                  minWidth: "20px",
                  height: "20px"
                }}
              >
                {user.light_balance}
              </Badge>
            )}
          </Row>
        </Button>
      </Link>
    </Row>
  );
} 