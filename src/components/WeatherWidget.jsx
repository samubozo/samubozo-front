import React from 'react';
import WeatherAnimation from './WeatherAnimation';
import styles from './WeatherWidget.module.scss';
import { useWeather } from '../context/WeatherContext';

const WeatherWidget = ({
  testWeather,
  setTestWeather,
  onlyButtons,
  onlyAnimation,
}) => {
  const { todayWeatherState, isLoading } = useWeather();

  // 버튼 렌더링
  const buttons = (
    <div
      style={{ position: 'fixed', left: 0, top: 0, zIndex: 100, padding: 10 }}
    >
      <button onClick={() => setTestWeather({ sky: '1', pty: '0' })}>
        맑음
      </button>
      <button onClick={() => setTestWeather({ sky: '4', pty: '0' })}>
        흐림
      </button>
      <button onClick={() => setTestWeather({ sky: '3', pty: '0' })}>
        구름
      </button>
      <button onClick={() => setTestWeather({ sky: '1', pty: '1' })}>비</button>
      <button onClick={() => setTestWeather({ sky: '1', pty: '3' })}>눈</button>
      <button onClick={() => setTestWeather(null)}>실제날씨</button>
    </div>
  );

  // 애니메이션 렌더링
  const animation = (testWeather ||
    (todayWeatherState && todayWeatherState.TMP)) && (
    <WeatherAnimation
      sky={testWeather ? testWeather.sky : todayWeatherState.SKY}
      pty={testWeather ? testWeather.pty : todayWeatherState.PTY}
    />
  );

  // 주소 정보 표시
  if (onlyButtons) return buttons;
  if (onlyAnimation) return animation;

  // 기본: 버튼+애니메이션 모두
  return (
    <>
      {buttons}
      {animation}
    </>
  );
};

export default WeatherWidget;
