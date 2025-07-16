import React from 'react';
import styles from './Header.module.scss';
import cloudImg from '../assets/Gemini_Generated_Image_yaicgayaicgayaic.png';
import sunImg from '../assets/Gemini_Generated_Image_8mwdkk8mwdkk8mwd.png';

function RainDrop({ x, delay }) {
  return (
    <g>
      <ellipse
        cx={x}
        cy='38' // lowered by 8px
        rx='2'
        ry='7'
        fill='#4fc3f7'
        opacity='0.7'
        stroke='#1976d2'
        strokeWidth='1'
      >
        <animate
          attributeName='cy'
          values='38;98'
          dur='1.1s'
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.7;1;0.7'
          dur='1.1s'
          begin={delay}
          repeatCount='indefinite'
        />
      </ellipse>
      <ellipse
        cx={x}
        cy='98' // lowered by 8px
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
          dur='1.1s'
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.5;0.8;0'
          keyTimes='0;0.2;1'
          dur='1.1s'
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
      x='85'
      y='-30'
      width='170'
      height='110'
      style={{ pointerEvents: 'none' }}
    />
  );
}

function Rainy() {
  // 8 drops, spread from x=130 to x=210 (구름 이미지보다 양옆 40px씩 줄임)
  const dropCount = 8;
  const startX = 130;
  const endX = 210;
  const drops = Array.from(
    { length: dropCount },
    (_, i) => startX + (i * (endX - startX)) / (dropCount - 1),
  );
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <g className={styles['cloud-move-float']}>
        {drops.map((x, i) => (
          <RainDrop key={i} x={x} delay={`${i * 0.18}s`} />
        ))}
        <CloudImage />
      </g>
    </svg>
  );
}

function Sunny() {
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <image
        href={sunImg}
        x='140'
        y='-10'
        width='75'
        height='75'
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

function Snowflake({ x, delay }) {
  return (
    <g>
      <circle
        cx={x}
        cy='36' // 4px 더 아래로 (was 32)
        r='4'
        fill='#fff'
        opacity='0.85'
        stroke='#90a4ae'
        strokeWidth='1'
      >
        <animate
          attributeName='cy'
          values='36;116'
          dur='2.5s'
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.85;1;0.85'
          dur='2.5s'
          begin={delay}
          repeatCount='indefinite'
        />
        <animate
          attributeName='r'
          values='4;6;4'
          dur='2.5s'
          begin={delay}
          repeatCount='indefinite'
        />
      </circle>
    </g>
  );
}

function Snowy() {
  // 8 flakes, spread from x=130 to x=210 (구름 이미지보다 양옆 40px씩 줄임)
  const flakeCount = 8;
  const startX = 130;
  const endX = 210;
  const flakes = Array.from(
    { length: flakeCount },
    (_, i) => startX + (i * (endX - startX)) / (flakeCount - 1),
  );
  return (
    <svg width='340' height='110' className={styles.weatherAnimation}>
      <g className={styles['cloud-move-float']}>
        {flakes.map((x, i) => (
          <Snowflake key={i} x={x} delay={`${i * 0.4}s`} />
        ))}
        <CloudImage />
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
    if (sky === '3' || sky === 3 || sky === '4' || sky === 4) {
      return <Cloudy />;
    }
  }
  // 혹시 모르는 기타 값은 구름으로 처리
  return <Cloudy />;
}
