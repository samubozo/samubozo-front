import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.scss';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, CHATBOT } from '../configs/host-config';

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

const Chatbot = ({ inHeader }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ from: 'bot', text: BOT_GUIDE }]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(null);

  // 챗봇 열릴 때 이력 조회
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    axiosInstance
      .get(`${API_BASE_URL}${CHATBOT}/history`)
      .then((res) => {
        console.log('챗봇 히스토리 응답:', res.data);
        const history = res.data.result || res.data;
        if (Array.isArray(history) && history.length > 0) {
          setMessages(
            history.map((msg) => ({
              from: msg.senderType === 'USER' ? 'user' : 'bot',
              text: msg.messageContent,
            })),
          );
          setConversationId(history[0].conversationId);
        } else {
          setMessages([{ from: 'bot', text: BOT_GUIDE }]);
          setConversationId(null);
        }
      })
      .catch(() => {
        setMessages([{ from: 'bot', text: BOT_GUIDE }]);
        setConversationId(null);
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  useEffect(() => {
    if (open && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (msg) => {
    // msg가 문자열이 아니면 input을 사용
    const messageToSend = typeof msg === 'string' ? msg : input;
    if (!messageToSend.trim() || isLoading) return;
    const req = {
      message: messageToSend,
    };
    const userMsg = { from: 'user', text: messageToSend };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${CHATBOT}/chat`,
        req,
      );
      console.log('챗봇 응답:', res.data);
      const reply = res.data.responseMessage || res.data.result?.reply;
      if (reply) {
        setMessages((msgs) => [...msgs, { from: 'bot', text: reply }]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { from: 'bot', text: '답변을 불러오지 못했습니다.' },
        ]);
      }
      if (res.data.result?.conversationId) {
        setConversationId(res.data.result.conversationId);
      }
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { from: 'bot', text: '오류가 발생했습니다.' },
      ]);
    }
    setIsLoading(false);
  };

  // 엔터키로 메시지 전송 (입력값이 남는 현상 방지)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 반드시 가장 먼저 호출
      if (input.trim() && !isLoading) {
        const msg = input;
        setInput(''); // 먼저 input을 비움
        handleSend(msg); // input 값을 인자로 넘김
      }
    }
  };

  return (
    <div className={inHeader ? styles.headerChatbotWrap : styles.chatbotWrap}>
      {open && (
        <div className={inHeader ? styles.headerChatWindow : styles.chatWindow}>
          <div className={styles.header}>
            사무보조 챗봇{' '}
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className={styles.messages} ref={messagesRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.from === 'bot' ? styles.botMsg : styles.userMsg}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={styles.botMsg}>
                <span className={styles.loadingBubble}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.inputBox}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={1}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              type='button'
            >
              전송
            </button>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className={inHeader ? styles.headerFab : styles.fab}
          onClick={() => {
            setOpen((o) => !o);
            setShowTooltip(false);
          }}
          aria-label='사무보조 챗봇 열기'
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <RobotIcon />
        </button>
        {showTooltip && (
          <div className={styles.chatbotTooltip}>
            사이트안내와 인사 업무 정보를 알려주는 챗봇입니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
