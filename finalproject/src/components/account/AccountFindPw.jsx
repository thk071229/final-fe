import { useCallback, useEffect, useRef, useState } from "react";
import Stepper from "./accountJoin/Stepper";
import { useNavigate } from "react-router-dom";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";
export default function AccountFindPw() {
    const navigate = useNavigate();
    //state
    const [accountId, setAccountId] = useState(""); // 아이디 입력 (필수)
    const [contactType, setContactType] = useState("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // 비밀번호 변경 State
    const [newPw, setNewPw] = useState("");
    const [newPwCheck, setNewPwCheck] = useState("");
    const [pwFeedback, setPwFeedback] = useState("");
    const [showPw, setShowPw] = useState(false);

    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);
    const timerRef = useRef(null);

    // 탭 변경
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

    // 시간 포맷
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // 타이머
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

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // 1. 인증번호 발송
    const sendCert = useCallback(async () => {
        // 아이디 입력 체크
        if (!accountId) {
            alert("비밀번호를 찾을 아이디를 먼저 입력해주세요.");
            return;
        }

        let url = "";
        let params = {};

        if (contactType === "phone") {
            if (!phone) return;
            const cleanPhone = phone.replace(/-/g, "");
            const regex = /^010[1-9][0-9]{7}$/;
            if (!regex.test(cleanPhone)) {
                alert("휴대폰 번호를 정확히 입력해주세요.");
                return;
            }
            // 백엔드: 가입된 정보인지 체크하는 로직 재사용
            url = "http://localhost:8080/cert/sendPhoneForFind";
            params = { phone: cleanPhone };
        } else {
            if (!email) return;
            const regex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!regex.test(email)) {
                alert("이메일 형식을 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendEmailForFind";
            params = { email: email };
        }

        try {
            await axios.post(url, null, { params: params });
            setIsSent(true);
            setCertFeedback("");
            setCertNumber("");
            setIsVerified(false);
            startTimer();
            alert("인증번호가 발송되었습니다");
        } catch (e) {
            if (e.response && e.response.status === 404) {
                alert("일치하는 회원 정보가 없습니다.");
            } else {
                alert("메시지 발송 실패 (잠시 후 다시 시도해주세요)");
            }
        }
    }, [contactType, phone, email, accountId, startTimer]);

    // 2. 인증번호 확인
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }

        try {
            const certTarget = contactType === "phone" ? phone.replace(/-/g, "") : email;

            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: certTarget,
                certNumber: certNumber
            });

            if (response.data === true) {
                if (timerRef.current) clearInterval(timerRef.current);
                setIsVerified(true);
                alert("본인인증이 완료되었습니다. 비밀번호를 변경해주세요.");
            } else {
                setCertFeedback("인증번호가 일치하지 않습니다");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        }
    }, [contactType, phone, email, certNumber, timeLeft]);

    // 3. 비밀번호 변경 요청
    const changePw = useCallback(async () => {
        // 비밀번호 유효성 검사 (정규식은 필요에 따라 조정)
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)(?=.*?[!@#$]+)[A-Za-z0-9!@#$]{8,16}$/;
        if (!regex.test(newPw)) {
            alert("비밀번호 형식이 올바르지 않습니다. (8~16자, 대문자/소문자/숫자/특수문자 포함)");
            return;
        }
        if (newPw !== newPwCheck) {
            alert("비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/account/changePw", {
                accountId: accountId,
                accountPw: newPw
            });
            alert("비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.");
            navigate("/login");
        } catch (e) {
            console.error(e);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        }
    }, [accountId, newPw, newPwCheck, navigate]);

    //render
    return (
        <>
            <Stepper currentStep={isVerified ? 2 : 1} steps={["회원정보 확인", "비밀번호 재설정"]} />

            <div className="container mt-5">
                <div className="row">
                    <div className="col">
                        <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                            <div className="card-body p-5">
                                <h3 className="fw-bold mb-4 text-center">비밀번호 찾기</h3>
                                <p className="text-muted mb-4 text-center">
                                    {isVerified ? "새로운 비밀번호를 설정해주세요." : "회원가입 시 등록한 정보로 인증해주세요."}
                                </p>

                                {/* [인증 전 단계] 아이디 입력 및 본인인증 */}
                                {!isVerified && (
                                    <>
                                        {/* 아이디 입력 (비번 찾기에는 필수) */}
                                        <div className="row mb-4">
                                            <label className="col-sm-3 col-form-label fw-bold">
                                                아이디 <span className="text-danger">*</span>
                                            </label>
                                            <div className="col-sm-9">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="아이디를 입력하세요"
                                                    value={accountId}
                                                    onChange={e => setAccountId(e.target.value)}
                                                    disabled={isSent} // 인증 시작하면 수정 불가
                                                />
                                            </div>
                                        </div>

                                        <hr className="my-4 text-muted" />

                                        {/* 탭 메뉴 */}
                                        <ul className="nav nav-pills nav-fill mb-4 border rounded p-1" style={{ backgroundColor: '#f8f9fa' }}>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link fw-bold ${contactType === 'phone' ? 'active shadow-sm' : ''}`}
                                                    onClick={() => handleTypeChange('phone')}
                                                    style={{
                                                        backgroundColor: contactType === 'phone' ? 'white' : 'transparent',
                                                        color: contactType === 'phone' ? MINT_COLOR : '#6c757d',
                                                        border: 'none', borderRadius: '4px'
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
                                                        border: 'none', borderRadius: '4px'
                                                    }}
                                                >
                                                    이메일 인증
                                                </button>
                                            </li>
                                        </ul>

                                        {/* 연락처 입력 */}
                                        <div className="row mt-4">
                                            <label className="col-sm-3 col-form-label fw-bold">
                                                {contactType === 'phone' ? '휴대폰 번호' : '이메일'} <span className="text-danger">*</span>
                                            </label>
                                            <div className="col-sm-9">
                                                <div className="d-flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={contactType === 'phone' ? "- 없이 숫자만 입력" : "example@email.com"}
                                                        value={contactType === 'phone' ? phone : email}
                                                        onChange={e => contactType === 'phone' ? setPhone(e.target.value) : setEmail(e.target.value)}
                                                        disabled={isSent}
                                                        style={{ borderColor: isSent ? '#e9ecef' : '#ced4da' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn text-white text-nowrap"
                                                        style={{
                                                            minWidth: "100px",
                                                            backgroundColor: isSent ? '#6c757d' : MINT_COLOR,
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

                                        {/* 인증번호 입력 */}
                                        {isSent && (
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
                                                    {certFeedback ? (
                                                        <div className="invalid-feedback d-block fw-bold">{certFeedback}</div>
                                                    ) : timeLeft === 0 ? (
                                                        <div className="form-text text-danger mt-2 fw-bold">시간이 초과되었습니다. 재전송해주세요.</div>
                                                    ) : (
                                                        <div className="form-text mt-2" style={{ color: MINT_COLOR, fontWeight: 'bold' }}>
                                                            * 3분 이내에 입력해주세요 ({formatTime(timeLeft)})
                                                        </div>
                                                    )}
                                                    {timeLeft === 0 && (
                                                        <button
                                                            className="btn btn-sm mt-2 w-100 fw-bold"
                                                            onClick={() => { setIsSent(false); setCertNumber(""); setCertFeedback(""); }}
                                                            style={{ color: MINT_COLOR, borderColor: MINT_COLOR, backgroundColor: 'white' }}
                                                        >
                                                            인증번호 재전송 하기
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* [인증 완료 단계] 비밀번호 변경 폼 */}
                                {isVerified && (
                                    <div className="mt-2">
                                        <div className="alert alert-success text-center fw-bold mb-4" style={{ backgroundColor: 'rgba(120, 194, 173, 0.2)', color: '#4a8a7a', border: 'none' }}>
                                            본인 인증이 완료되었습니다.<br />새로운 비밀번호를 설정해주세요.
                                        </div>

                                        {/* 새 비밀번호 */}
                                        <div className="row mb-3">
                                            <label className="col-sm-4 col-form-label fw-bold">새 비밀번호</label>
                                            <div className="col-sm-8 position-relative">
                                                <input
                                                    type={showPw ? "text" : "password"}
                                                    className="form-control"
                                                    value={newPw}
                                                    onChange={e => setNewPw(e.target.value)}
                                                    placeholder="영문/숫자/특수문자 포함 8~16자"
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <span
                                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                                                    onClick={() => setShowPw(!showPw)}
                                                >
                                                    {showPw ? <EyeSlashIcon /> : <EyeIcon />}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 새 비밀번호 확인 */}
                                        <div className="row mb-4">
                                            <label className="col-sm-4 col-form-label fw-bold">비밀번호 확인</label>
                                            <div className="col-sm-8">
                                                <input
                                                    type="password"
                                                    className={`form-control ${newPwCheck && newPw !== newPwCheck ? 'is-invalid' : ''}`}
                                                    value={newPwCheck}
                                                    onChange={e => setNewPwCheck(e.target.value)}
                                                    placeholder="비밀번호 재입력"
                                                />
                                                {newPwCheck && newPw !== newPwCheck && (
                                                    <div className="invalid-feedback">비밀번호가 일치하지 않습니다.</div>
                                                )}
                                                {newPwCheck && newPw === newPwCheck && (
                                                    <div className="form-text text-success fw-bold">비밀번호가 일치합니다.</div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            className="btn w-100 py-3 fw-bold text-white fs-5"
                                            style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}
                                            onClick={changePw}
                                        >
                                            비밀번호 변경하기
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}