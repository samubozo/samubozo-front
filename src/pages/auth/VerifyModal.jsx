import React, { useState } from "react";
import "./VerifyModal.scss";

const VerifyModal = ({ email, onClose, onResend, onComplete, timer }) => {
  const [code, setCode] = useState("");

  return (
    <div className="modal-dim">
      <div className="verify-modal">
        <h2 className="modal-title">인증번호 입력</h2>
        <div className="modal-email">{email}</div>
        <div className="modal-row">
          <span className="modal-timer">{timer}</span>
          <input
            className="modal-input"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button className="modal-resend" onClick={onResend}>재발송</button>
        </div>
        <div className="modal-btns">
          <button
            className="modal-complete"
            onClick={() => onComplete(code)}
          >
            완료
          </button>
          <button className="modal-cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyModal;