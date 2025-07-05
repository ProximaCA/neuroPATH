import { Background, Button, Card, Column, IconButton, Line, Media, Row, Scroller, Text, User } from "@once-ui-system/core";
import classNames from "classnames";
import React from "react";
import styles from "./MusicPlayer.module.scss";

interface MusicPlayer1Props extends React.ComponentProps<typeof Column> {}

interface MeditationPlayerProps extends React.ComponentProps<typeof Column> {
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentTime?: string;
  totalTime?: string;
  title?: string;
  description?: string;
  audioSrc?: string;
  onAudioTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onRestart?: () => void;
  isCompleted?: boolean;
  canComplete?: boolean;
  onAudioLoadedMetadata?: (event: Event) => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  duration: string;
}

const MusicPlayer1: React.FC<MusicPlayer1Props> = ({ ...flex }) => {
  const tracks = [
    {
      title: "Vibe Coding Theme",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "3:15"
    },
    {
      title: "Daytime Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-dark.jpg",
      duration: "2:47"
    },
    {
      title: "Midnight Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "5:51"
    },
    {
      title: "Chill Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-dark.jpg",
      duration: "2:47"
    },
    {
      title: "All Day Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "3:55"
    },
    {
      title: "The World is Burning But I'm Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "3:15"
    },
    {
      title: "WTF are you coding?",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-dark.jpg",
      duration: "2:47"
    },
    {
      title: "2AM Ice Coffee Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "1:05"
    },
    {
      title: "Existential Crisis Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-dark.jpg",
      duration: "5:23"
    },
    {
      title: "Thanks for Coding",
      artist: "Texz",
      coverImage: "/images/docs/astronaut-coding-light.jpg",
      duration: "6:12"
    }
  ];
  
  return (
  <Column
    fillWidth
    border="surface"
    radius="l-4"
    padding="8"
    gap="20"
    overflow="hidden"
    {...flex}
  >
    <Background
      position="absolute"
      left="0"
      top="0"
      mask={{
        x: 50,
        y: -50,
        radius: 100,
      }}
      gradient={{
        display: true,
        opacity: 50,
        x: 50,
        y: 0,
        colorStart: "brand-background-strong",
        colorEnd: "static-transparent",
      }}
    />
    <Row fillWidth mobileDirection="column" fill>
      <Column fill>
        <Column padding="24" gap="24" fill horizontal="center" align="center">
          <Row fillWidth horizontal="space-between" vertical="center" gap="12">
            <IconButton tooltip="Like" tooltipPosition="bottom" variant="ghost" icon="heart" />
            <Text truncate variant="label-default-s" onBackground="brand-medium">
              Design Engineers Club
            </Text>
            <Row minWidth="32" height="32" padding="8" vertical="end" horizontal="space-between">
              {[1, 2, 3].map((index) => (
                <Row
                  key={index}
                  width="2"
                  radius="xs"
                  solid="neutral-strong"
                  className={classNames(styles.audiovisualizer, styles[`bar${index}`])}
                />
              ))}
            </Row>
          </Row>
          <Column fill center gap="32">
            <Media
              priority
              sizes="320px"
              radius="l"
              maxWidth={16}
              aspectRatio="1/1"
              border="neutral-alpha-weak"
              src="/images/docs/astronaut-coding-dark.jpg"
              alt="Music player album cover"
            />
            <Column fillWidth center gap="8">
              <Text onBackground="brand-weak" variant="heading-strong-xl">
                Vibe Coding Theme
              </Text>
              <User avatarProps={{ src: "/images/creators/texz.jpg", size: "s" }} name="Texz" />
              <Row
                marginTop="24"
                fillWidth
                gap="12"
                center
              >
                <IconButton
                  tooltipPosition="bottom"
                  tooltip="Previous"
                  variant="ghost"
                  icon="backward"
                />
                <IconButton
                  tooltipPosition="bottom"
                  tooltip="Pause"
                  variant="ghost"
                  icon="pause"
                />
                <IconButton
                  tooltipPosition="bottom"
                  tooltip="Next"
                  variant="ghost"
                  icon="forward"
                />
              </Row>
            </Column>
          </Column>
        </Column>
      </Column>
      <Column fill radius="l" background="surface" border="neutral-alpha-weak" overflow="hidden">
        <Row fillWidth center padding="16">
          <Column fillWidth gap="2">
            <Text onBackground="neutral-weak" variant="body-default-xs">
              Playing from:
            </Text>
            <Text onBackground="neutral-strong" variant="heading-strong-xs">
              Design Engineers Club
            </Text>
          </Column>
          <Button
            size="s"
            prefixIcon="plus">
            Follow
          </Button>
        </Row>
        <Scroller fillHeight flex={1} radius={undefined} direction="column" borderTop="neutral-alpha-weak">
          {tracks.map((track, index) => (
            <React.Fragment key={index}>
              <Card 
                radius={undefined} 
                background="transparent" 
                border="transparent" 
                fillWidth 
                paddingY="8" 
                paddingLeft="12" 
                paddingRight="20" 
                gap="16" 
                vertical="center"
              >
                <Media
                  priority
                  sizes="56px"
                  radius="s"
                  width="48"
                  aspectRatio="1/1"
                  border="neutral-alpha-weak"
                  src={track.coverImage}
                  alt={`${track.title} album cover`}
                />
                <Column fillWidth>
                  <Text truncate onBackground="neutral-strong" variant="label-strong-m">
                    {track.title}
                  </Text>
                  <Text truncate onBackground="neutral-weak" variant="body-default-xs">
                    {track.artist}
                  </Text>
                </Column>
                <Text onBackground="neutral-weak" variant="label-default-s">
                  {track.duration}
                </Text>
              </Card>
              {index < tracks.length - 1 && <Line background="neutral-alpha-weak"/>}
            </React.Fragment>
          ))}
        </Scroller>
      </Column>
    </Row>
    <Column fillWidth gap="8" paddingX="12" paddingBottom="8">
      <Row
        background="neutral-alpha-weak"
        border="neutral-alpha-weak"
        radius="full"
        height="4"
        fillWidth
      >
        <Row
          solid="brand-strong"
          radius="full"
          className={styles.grow}
          fill
        />
      </Row>
      <Row
        fillWidth
        onBackground="neutral-weak"
        textVariant="body-default-xs"
        horizontal="space-between"
        paddingX="4"
      >
        <Text>2:37</Text>
        <Text>3:15</Text>
      </Row>
    </Column>
  </Column>
  );
};

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ 
  isPlaying = false,
  onPlayPause,
  currentTime = "0:00",
  totalTime = "5:00",
  title = "Погружение",
  description = "Медитация стихии Воды",
  audioSrc,
  onAudioTimeUpdate,
  onEnded,
  onRestart,
  isCompleted = false,
  canComplete = false,
  onAudioLoadedMetadata,
  ...flex 
}) => {
  const progressPercent = currentTime && totalTime ? 
    (parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1])) / 
    (parseInt(totalTime.split(':')[0]) * 60 + parseInt(totalTime.split(':')[1])) * 100 : 0;

  // Audio element ref
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Control audio playback
  React.useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.warn('Audio playback failed:', error);
        // Fallback: continue without audio
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle audio time updates
  const handleTimeUpdate = () => {
    if (audioRef.current && onAudioTimeUpdate) {
      onAudioTimeUpdate(audioRef.current.currentTime);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  // Handle audio load error
  const handleError = () => {
    console.warn('Audio file could not be loaded, continuing without audio');
  };

  // Handle audio metadata loaded
  const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    if (onAudioLoadedMetadata) {
      onAudioLoadedMetadata(event.nativeEvent);
    }
  };

  return (
    <Column
      fillWidth
      border="neutral-alpha-medium"
      radius="xl"
      padding="xl"
      gap="xl"
      background="neutral-alpha-weak"
      align="center"
      {...flex}
    >
      {/* Hidden Audio Element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          preload="metadata"
        />
      )}
      <Background
        position="absolute"
        left="0"
        top="0"
        gradient={{
          display: true,
          opacity: "15" as any,
          x: 50,
          y: 0,
          colorStart: "#00A9FF",
          colorEnd: "static-transparent",
        }}
      />
      
      <Column gap="xl" align="center" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Column gap="s" align="center">
          <Text variant="heading-strong-l" style={{ color: "#00A9FF" }} align="center">
            {title}
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak" align="center">
            {description}
          </Text>
        </Column>

        {/* Meditation Visual Circle */}
        <div
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00A9FF, #0080CC)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4rem",
            boxShadow: isPlaying ? "0 0 40px rgba(0, 169, 255, 0.3)" : "0 0 20px rgba(0, 169, 255, 0.1)",
            transition: "all 0.5s ease",
            animation: isPlaying ? "breathe 4s ease-in-out infinite" : "none",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `conic-gradient(from 0deg, #00A9FF ${progressPercent * 3.6}deg, transparent ${progressPercent * 3.6}deg)`,
              borderRadius: "50%",
              opacity: 0.3
            }}
          />
          🌊
        </div>

        {/* Audio Visualizer */}
        <Row gap="xs" horizontal="center" style={{ height: "40px", alignItems: "end" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((index) => (
            <div
              key={index}
              style={{
                width: "4px",
                height: isPlaying ? `${Math.random() * 30 + 10}px` : "8px",
                backgroundColor: "#00A9FF",
                borderRadius: "2px",
                opacity: isPlaying ? 0.8 : 0.3,
                transition: "all 0.3s ease",
                animation: isPlaying ? `wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : "none",
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
        </Row>

        {/* Controls */}
        <Row gap="l" horizontal="center" align="center">
          {isCompleted && onRestart && (
            <Button
              variant="secondary"
              size="m"
              onClick={onRestart}
              style={{
                borderRadius: "50%",
                width: "48px",
                height: "48px"
              }}
            >
              🔄
            </Button>
          )}
          
          <IconButton
            variant="primary"
            icon={isPlaying ? "pause" : "play"}
            size="l"
            tooltip={isPlaying ? "Пауза" : "Воспроизвести"}
            onClick={onPlayPause}
            style={{
              backgroundColor: "#00A9FF",
              borderColor: "#00A9FF",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              boxShadow: "0 4px 20px rgba(0, 169, 255, 0.3)"
            }}
          />
          
          {canComplete && (
            <div style={{ width: "48px", height: "48px" }} />
          )}
        </Row>

        {/* Progress Bar */}
        <Column gap="s" fillWidth style={{ maxWidth: "300px" }}>
          <div
            style={{ 
              width: "100%",
              height: "8px",
              backgroundColor: "var(--neutral-alpha-weak)",
              borderRadius: "4px",
              overflow: "hidden",
              position: "relative"
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "#00A9FF",
                borderRadius: "4px",
                transition: "width 0.3s ease",
                boxShadow: "0 0 10px rgba(0, 169, 255, 0.5)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${progressPercent}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                backgroundColor: "#00A9FF",
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
              }}
            />
          </div>
          <Row
            fillWidth
            horizontal="space-between"
            align="center"
          >
            <Text variant="body-default-s" onBackground="neutral-medium">
              {currentTime}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-medium">
              {totalTime}
            </Text>
          </Row>
        </Column>
      </Column>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 169, 255, 0.2);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(0, 169, 255, 0.4);
          }
        }
        @keyframes wave {
          0% { height: 8px; }
          100% { height: 32px; }
        }
      `}</style>
    </Column>
  );
};

export { MusicPlayer1, MeditationPlayer };