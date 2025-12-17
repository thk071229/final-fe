import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

const AccountJoinStep1 = ({ onNext }) => {
    // state
    const [phone, setPhone] = useState("");
    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false);

    // 피드백 메시지 & 타이머 상태
    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180); // 3분
    const timerRef = useRef(null);

    // 시간 포맷 (180 -> 03:00)
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // 타이머 시작
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(180);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // 컴포넌트 해제 시 타이머 정리
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // 1. 인증번호 발송
    const sendCert = useCallback(async () => {
        if (!phone) return;
        const cleanPhone = phone.replace(/-/g, "");
        const regex = /^010[1-9][0-9]{7}$/;

        if (!regex.test(cleanPhone)) {
            alert("휴대폰 번호를 정확히 입력해주세요.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/cert/sendPhone", null, {
                params: { phone: cleanPhone }
            });

            setIsSent(true);
            setCertFeedback("");
            setCertNumber("");
            startTimer();
            alert("인증번호가 발송되었습니다.");

        } catch (e) {
            if (e.response && e.response.status === 409) {
                alert("이미 가입된 번호입니다.\n로그인 페이지로 이동하거나 아이디 찾기를 이용해주세요.");
            } else {
                alert("메시지 발송 실패 (테스트 모드: 성공 처리)");
                // 테스트용
                setIsSent(true);
                startTimer();
            }
        }
    }, [phone, startTimer]);

    // 2. 인증번호 확인
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }
        if (!certNumber) {
            setCertFeedback("인증번호를 입력해주세요.");
            return;
        }

        try {
            const cleanPhone = phone.replace(/-/g, "");
            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: cleanPhone,
                certNumber: certNumber
            });

            if (response.data === true) {
                setCertFeedback("");
                if (timerRef.current) clearInterval(timerRef.current);
                alert("본인인증이 완료되었습니다.");
                onNext(cleanPhone); // 다음 단계 이동
            } else {
                setCertFeedback("인증번호가 일치하지 않거나 만료되었습니다.");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        }
    }, [phone, certNumber, onNext, timeLeft]);

    const handleCertInput = (e) => {
        setCertNumber(e.target.value);
        if (certFeedback) setCertFeedback("");
    };

    return (
        // [수정] 컨테이너 및 중앙 정렬 적용 (width 640px)
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                        <div className="card-body p-5">
                            <h3 className="fw-bold mb-4 text-center">1단계. 본인인증</h3>
                            <p className="text-muted mb-4 text-center">안전한 서비스 이용을 위해 휴대폰 인증을 진행해주세요.</p>

                            {/* 휴대폰 번호 입력 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    {/* 아이콘 대신 텍스트로 변경 */}
                                    휴대폰 번호 <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="d-flex gap-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="- 없이 숫자만 입력"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            disabled={isSent}
                                            style={{ borderColor: isSent ? '#e9ecef' : '#ced4da' }} // 발송 후 비활성화 느낌
                                        />
                                        <button
                                            type="button"
                                            className="btn text-white text-nowrap"
                                            style={{
                                                minWidth: "100px",
                                                backgroundColor: isSent ? '#6c757d' : MINT_COLOR, // 발송됨이면 회색, 아니면 민트
                                                borderColor: isSent ? '#6c757d' : MINT_COLOR
                                            }}
                                            onClick={sendCert}
                                            disabled={isSent}
                                        >
                                            {isSent ? "발송됨" : "인증요청"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 인증번호 입력 (발송 성공 시에만 보임) */}
                            {isSent && (
                                <div className="row mt-4">
                                    <label className="col-sm-3 col-form-label fw-bold">
                                        {/* 아이콘 대신 텍스트로 변경 */}
                                        인증번호 <span className="text-danger">*</span>
                                    </label>
                                    <div className="col-sm-9">
                                        <div className="d-flex gap-2 position-relative">
                                            <input
                                                type="text"
                                                className={`form-control ${certFeedback ? 'is-invalid' : ''}`}
                                                placeholder="인증번호 6자리"
                                                value={certNumber}
                                                onChange={handleCertInput}
                                                disabled={timeLeft === 0}
                                            />

                                            <button
                                                type="button"
                                                className="btn text-white text-nowrap"
                                                style={{
                                                    minWidth: "100px",
                                                    backgroundColor: timeLeft === 0 ? '#6c757d' : MINT_COLOR,
                                                    borderColor: timeLeft === 0 ? '#6c757d' : MINT_COLOR
                                                }}
                                                onClick={checkCert}
                                                disabled={timeLeft === 0}
                                            >
                                                확인
                                            </button>
                                        </div>

                                        {/* 피드백 및 안내 문구 */}
                                        {certFeedback ? (
                                            <div className="invalid-feedback d-block fw-bold">{certFeedback}</div>
                                        ) : timeLeft === 0 ? (
                                            <div className="form-text text-danger mt-2 fw-bold">시간이 초과되었습니다. 재전송해주세요.</div>
                                        ) : (
                                            <div className="form-text mt-2" style={{ color: MINT_COLOR, fontWeight: 'bold' }}>
                                                * 3분 이내에 입력해주세요 ({formatTime(timeLeft)})
                                            </div>
                                        )}

                                        {/* 재전송 버튼 */}
                                        {timeLeft === 0 && (
                                            <button
                                                className="btn btn-sm mt-2 w-100 fw-bold"
                                                onClick={() => {
                                                    setIsSent(false);
                                                    setCertNumber("");
                                                    setCertFeedback("");
                                                }}
                                                style={{
                                                    color: MINT_COLOR,
                                                    borderColor: MINT_COLOR,
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                인증번호 재전송 하기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountJoinStep1;