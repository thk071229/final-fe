import axios from "axios";
import { useCallback, useRef, useState, useEffect } from "react";
import Stepper from "./accountJoin/Stepper";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

export default function AccountFindId() {
    //state
    const [contactType, setContactType] = useState("phone"); // 'phone' | 'email' (인증 방식 선택)
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(""); // 이메일 상태 추가

    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false); // 인증번호 발송 여부
    const [isVerified, setIsVerified] = useState(false); // 인증 완료 여부
    const [foundId, setFoundId] = useState(""); // 찾은 아이디

    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180); // 180초(3분)
    const timerRef = useRef(null);

    // 탭 변경 시 상태 초기화
    const handleTypeChange = (type) => {
        setContactType(type);
        setPhone("");
        setEmail("");
        setCertNumber("");
        setIsSent(false);
        setIsVerified(false);
        setCertFeedback("");
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // 시간 포맷 변환 (180 -> 03:00)
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

    // 1. 인증번호 발송 (아이디 찾기용 - 통합)
    const sendCert = useCallback(async () => {
        let url = "";
        let params = {};

        // (1) 휴대폰 인증일 때
        if (contactType === "phone") {
            if (!phone) return;
            const cleanPhone = phone.replace(/-/g, "");
            const regex = /^010[1-9][0-9]{7}$/;
            if (!regex.test(cleanPhone)) {
                alert("휴대폰 번호를 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendPhoneForFind"; // 절대 경로로 수정
            params = { phone: cleanPhone };
        }
        // (2) 이메일 인증일 때
        else {
            if (!email) return;
            const regex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!regex.test(email)) {
                alert("이메일 형식을 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendEmailForFind"; // 절대 경로로 수정
            params = { email: email };
        }

        try {
            // API 호출 (가입된 정보일 때만 발송)
            await axios.post(url, null, { params: params });
            setIsSent(true);
            setCertFeedback("");
            setCertNumber("");
            setIsVerified(false);
            setFoundId(""); // 재전송 시 결과 초기화
            startTimer();
            alert("인증번호가 발송되었습니다");
        }
        catch (e) {
            if (e.response && e.response.status === 404) {
                alert("일치하는 회원 정보가 없습니다. 회원가입을 진행해주세요.");
            } else {
                alert("메시지 발송 실패 (잠시 후 다시 시도해주세요)");
                // setIsSent(true); // 테스트용 (필요시 주석 해제)
                // startTimer();
            }
        }
    }, [contactType, phone, email, startTimer]);

    // 2. 인증번호 확인 및 아이디 찾기
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }

        try {
            // 인증 타겟 설정 (전화번호 or 이메일)
            const certTarget = contactType === "phone" ? phone.replace(/-/g, "") : email;

            // [1] 인증번호 확인
            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: certTarget,
                certNumber: certNumber
            });

            if (response.data === true) {
                // 인증 성공 시 타이머 정지
                if (timerRef.current) clearInterval(timerRef.current);

                // [2] 실제 아이디 요청 (백엔드 규격에 맞춰 params로 수정!)
                // 백엔드: @RequestParam String accountContact, @RequestParam String accountEmail
                const idParams = {};
                if (contactType === 'phone') {
                    idParams.accountContact = certTarget;
                } else {
                    idParams.accountEmail = certTarget;
                }

                try {
                    // post의 2번째 인자는 body(null), 3번째 인자에 { params: ... }
                    const idResponse = await axios.post("http://localhost:8080/account/findId", null, {
                        params: idParams
                    });

                    setFoundId(idResponse.data);
                    setIsVerified(true);
                    alert("본인인증이 완료되었습니다.");
                } catch (e) {
                    // 인증은 성공했으나 아이디 조회 실패 (DB오류 등)
                    console.error(e);
                    alert("아이디 정보를 불러오는데 실패했습니다.");
                }
            }
            else {
                setCertFeedback("인증번호가 일치하지 않습니다");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        }
    }, [contactType, phone, email, certNumber, timeLeft]);


    return (
        <>
            {/* Stepper: 아이디 찾기도 1단계(본인인증) -> 2단계(아이디확인) 느낌으로 표현 */}
            <Stepper currentStep={isVerified ? 2 : 1} steps={["본인 인증", "아이디 확인"]} />

            <div className="container mt-5">
                <div className="row">
                    <div className="col">
                        <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                            <div className="card-body p-5">
                                <h3 className="fw-bold mb-4 text-center">아이디 찾기</h3>
                                <p className="text-muted mb-4 text-center">회원가입 시 등록한 정보로 인증해주세요.</p>

                                {/* 탭 메뉴 (휴대폰 / 이메일 선택) */}
                                <ul className="nav nav-pills nav-fill mb-4 border rounded p-1" style={{ backgroundColor: '#f8f9fa' }}>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link fw-bold ${contactType === 'phone' ? 'active shadow-sm' : ''}`}
                                            onClick={() => handleTypeChange('phone')}
                                            style={{
                                                backgroundColor: contactType === 'phone' ? 'white' : 'transparent',
                                                color: contactType === 'phone' ? MINT_COLOR : '#6c757d',
                                                border: 'none',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            휴대폰 인증
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link fw-bold ${contactType === 'email' ? 'active shadow-sm' : ''}`}
                                            onClick={() => handleTypeChange('email')}
                                            style={{
                                                backgroundColor: contactType === 'email' ? 'white' : 'transparent',
                                                color: contactType === 'email' ? MINT_COLOR : '#6c757d',
                                                border: 'none',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            이메일 인증
                                        </button>
                                    </li>
                                </ul>

                                {/* 입력 폼 (선택된 타입에 따라 변경) */}
                                <div className="row mt-4">
                                    <label className="col-sm-3 col-form-label fw-bold">
                                        {contactType === 'phone' ? '휴대폰 번호' : '이메일'} <span className="text-danger">*</span>
                                    </label>
                                    <div className="col-sm-9">
                                        <div className="d-flex gap-2">
                                            {contactType === 'phone' ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="- 없이 숫자만 입력"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    disabled={isSent && isVerified}
                                                    style={{ borderColor: isSent ? '#e9ecef' : '#ced4da' }}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="example@email.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    disabled={isSent && isVerified}
                                                    style={{ borderColor: isSent ? '#e9ecef' : '#ced4da' }}
                                                />
                                            )}

                                            <button
                                                type="button"
                                                className="btn text-white text-nowrap"
                                                style={{
                                                    minWidth: "100px",
                                                    backgroundColor: isSent ? '#6c757d' : MINT_COLOR,
                                                    borderColor: isSent ? '#6c757d' : MINT_COLOR
                                                }}
                                                onClick={sendCert}
                                                disabled={isSent && isVerified}
                                            >
                                                {isSent ? "발송됨" : "인증요청"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 인증번호 입력 (발송 성공 시에만 보임) */}
                                {isSent && !isVerified && (
                                    <div className="row mt-4">
                                        <label className="col-sm-3 col-form-label fw-bold">
                                            인증번호 <span className="text-danger">*</span>
                                        </label>
                                        <div className="col-sm-9">
                                            <div className="d-flex gap-2 position-relative">
                                                <input
                                                    type="text"
                                                    className={`form-control ${certFeedback ? 'is-invalid' : ''}`}
                                                    placeholder="인증번호 6자리"
                                                    value={certNumber}
                                                    onChange={e => {
                                                        setCertNumber(e.target.value);
                                                        setCertFeedback("");
                                                    }}
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

                                            {/* 피드백 메시지 */}
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

                                {/* 결과 화면 (인증 완료 시) */}
                                {isVerified && (
                                    <div className="mt-5 p-4 rounded text-center" style={{ backgroundColor: 'rgba(120, 194, 173, 0.1)', border: `1px solid ${MINT_COLOR}` }}>
                                        <h5 className="fw-bold mb-3">회원님의 아이디는 다음과 같습니다.</h5>
                                        <div className="display-6 fw-bold mb-4" style={{ color: MINT_COLOR }}>
                                            {foundId}
                                        </div>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <a href="/login" className="btn btn-lg text-white px-4 fw-bold" style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}>
                                                로그인 하러가기
                                            </a>
                                            <a href="/account/findPw" className="btn btn-lg btn-outline-secondary px-4 fw-bold">
                                                비밀번호 찾기
                                            </a>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}