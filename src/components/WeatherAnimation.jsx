import React from 'react';
import styles from './Header.module.scss';
import cloudImg from '../assets/Gemini_Generated_Image_yaicgayaicgayaic.png';
import sunImg from '../assets/Gemini_Generated_Image_8mwdkk8mwdkk8mwd.png';
import CloudyImage from '../assets/image.webp.png';

function RainDrop({ x, delay, duration = '1.1s', size = 1 }) {
  const rx = 1.5 * size;
  const ry = 5 * size;

  return (
    <g>
      <ellipse
        cx={x}
        cy='10' // 위로 10px 올림
        rx={rx}
        ry={ry}
        fill='#4fc3f7'
        opacity='0.7'
        stroke='#1976d2'
        strokeWidth='1'
      >
        <animate
          attributeName='cy'
          values='10;50'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.7;1;0.7'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
      </ellipse>
      <ellipse
        cx={x}
        cy='30' // 애니메이션 끝점과 맞춤
        rx='0'
        ry='0'
        fill='#4fc3f7'
        opacity='0.5'
        stroke='#1976d2'
        strokeWidth='1'
      >
        <animate
          attributeName='rx'
          values='0;6;0'
          keyTimes='0;0.2;1'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.5;0.8;0'
          keyTimes='0;0.2;1'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
      </ellipse>
    </g>
  );
}

function CloudImage() {
  // User-adjusted cloud image position and size
  return (
    <image
      href={cloudImg}
      x='165'
      y='-15'
      width='100'
      height='62'
      style={{ pointerEvents: 'none' }}
    />
  );
}

function Rainy() {
  // 11 drops with enhanced random patterns for realistic rain
  const dropCount = 11;
  const startX = 140;
  const endX = 250;

  // 더 현실적인 비 패턴 생성
  const drops = Array.from({ length: dropCount }, (_, i) => {
    const baseX = startX + (i * (endX - startX)) / (dropCount - 1);
    const randomOffset = (Math.random() - 0.5) * 30; // ±15px 랜덤 오프셋
    const randomDelay = Math.random() * 0.5; // 0~0.5초 랜덤 지연 (바로 시작)
    const randomDuration = 0.7 + Math.random() * 0.8; // 0.7~1.5초 랜덤 속도
    const randomSize = 0.8 + Math.random() * 0.4; // 0.8~1.2배 랜덤 크기

    return {
      x: baseX + randomOffset,
      delay: randomDelay,
      duration: randomDuration,
      size: randomSize,
    };
  });

  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <g className={styles['cloud-move-float']}>
        {drops.map((drop, i) => (
          <RainDrop
            key={i}
            x={drop.x}
            delay={`${drop.delay}s`}
            duration={`${drop.duration}s`}
            size={drop.size}
          />
        ))}
      </g>
    </svg>
  );
}

function Sunny() {
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <image
        href={sunImg}
        x='120'
        y='5'
        width='45'
        height='45'
        style={{ pointerEvents: 'none' }}
        className={styles.sunAnimated}
      />
    </svg>
  );
}

function Cloudy() {
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <g className={styles['cloud-move-float']}>
        <CloudImage />
      </g>
    </svg>
  );
}

function CloudyButton() {
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <image
        href={CloudyImage}
        style={{ pointerEvents: 'none' }}
        className={styles.cloudButtonMove}
      />
    </svg>
  );
}

function Snowflake({ x, delay, duration = '2.5s', size = 1 }) {
  const radius = 4 * size;

  return (
    <g>
      <circle
        cx={x}
        cy='0'
        r={radius}
        fill='#fff'
        opacity='0.85'
        stroke='#90a4ae'
        strokeWidth='1'
      >
        <animate
          attributeName='cy'
          values='0;56'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.85;1;0.85'
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='r'
          values={`${radius};${radius * 1.5};${radius}`}
          dur={duration}
          begin={delay}
          repeatCount='indefinite'
        />
      </circle>
    </g>
  );
}

function Snowy() {
  // 9 flakes with random patterns for realistic snow
  const flakeCount = 9;
  const startX = 140;
  const endX = 250;

  // 랜덤한 위치와 지연시간으로 현실적인 눈 패턴 생성
  const flakes = Array.from({ length: flakeCount }, (_, i) => {
    const baseX = startX + (i * (endX - startX)) / (flakeCount - 1);
    const randomOffset = (Math.random() - 0.5) * 25; // ±12.5px 랜덤 오프셋
    const randomDelay = Math.random() * 0.8; // 0~0.8초 랜덤 지연 (바로 시작)
    const randomDuration = 2 + Math.random() * 2; // 2~4초 랜덤 속도
    const randomSize = 0.7 + Math.random() * 0.6; // 0.7~1.3배 랜덤 크기

    return {
      x: baseX + randomOffset,
      delay: randomDelay,
      duration: randomDuration,
      size: randomSize,
    };
  });

  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <g className={styles['cloud-move-float']}>
        {flakes.map((flake, i) => (
          <Snowflake
            key={i}
            x={flake.x}
            delay={`${flake.delay}s`}
            duration={`${flake.duration}s`}
            size={flake.size}
          />
        ))}
      </g>
    </svg>
  );
}

export default function WeatherAnimation({ sky, pty }) {
  // 눈 계열: 2(비/눈), 3(눈)
  if (pty === '2' || pty === 2 || pty === '3' || pty === 3) {
    return <Snowy />;
  }
  // 비 계열: 1(비), 4(소나기)
  if (pty === '1' || pty === 1 || pty === '4' || pty === 4) {
    return <Rainy />;
  }
  // 강수 없음: 0
  if (pty === '0' || pty === 0) {
    if (sky === '1' || sky === 1) {
      return <Sunny />;
    }
    // 흐림(4)만 구름 이미지 렌더링, 구름많음(3)은 아무것도 렌더링하지 않음
    if (sky === '4' || sky === 4) {
      return <Cloudy />;
    }
    if (sky === '3' || sky === 3) {
      // 구름많음 이미지 표시
      return <CloudyButton />;
    }
  }
  // 혹시 모르는 기타 값은 구름으로 처리
  return <CloudyButton />;
}
