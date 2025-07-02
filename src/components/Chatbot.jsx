import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.scss';

const BOT_GUIDE = '사이트 안내와 인사관련 업무 지식을 물어봐주세요';
const PLACEHOLDER = '사이트안내 or 인사업무 지식을 물어보세요.';

function RobotIcon() {
  // 녹색 계열로 변경된 SVG 로봇+말풍선 (임시)
  return (
    <svg width='44' height='44' viewBox='0 0 44 44' fill='none'>
      <circle cx='22' cy='22' r='22' fill='#3CB371' />
      <ellipse cx='22' cy='25' rx='13' ry='10' fill='#fff' />
      <rect x='15' y='14' width='14' height='10' rx='5' fill='#fff' />
      <circle cx='19' cy='20' r='1.8' fill='#3CB371' />
      <circle cx='25' cy='20' r='1.8' fill='#3CB371' />
      <rect x='21' y='23.5' width='3' height='1.5' rx='0.75' fill='#3CB371' />
      <rect
        x='29'
        y='30'
        width='8'
        height='5'
        rx='2.5'
        fill='#fff'
        stroke='#3CB371'
        strokeWidth='1.5'
      />
      <text x='32.5' y='33.5' fontSize='3.5' fill='#3CB371'>
        챗
      </text>
    </svg>
  );
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ from: 'bot', text: BOT_GUIDE }]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    // 임시 답변
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          from: 'bot',
          text: '아직 실제 답변 기능은 구현되지 않았어요! (예시)',
        },
      ]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatbotWrap}>
      {open && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            사무보조 챗봇{' '}
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.from === 'bot' ? styles.botMsg : styles.userMsg}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.inputBox}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER}
              rows={1}
            />
            <button className={styles.sendBtn} onClick={handleSend}>
              전송
            </button>
          </div>
        </div>
      )}
      <button
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-label='사무보조 챗봇 열기'
      >
        <RobotIcon />
      </button>
    </div>
  );
};

export default Chatbot;
