import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Minty 테마 색상 상수 정의
const MINT_COLOR = "#78C2AD"; 

const TermsModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // 체크박스 State
    const [check, setCheck] = useState({
        all: false,
        service: false,
        privacy: false,
        marketing: false,
    });

    // 모달이 열릴 때(isOpen이 true가 될 때) 상태 초기화 및 스크롤 잠금
    useEffect(() => {
        if (isOpen) {
            setCheck({ all: false, service: false, privacy: false, marketing: false });
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        
        // 컴포넌트가 사라질 때 스크롤 잠금 해제 (안전장치)
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // 체크박스 핸들러
    const handleCheck = useCallback((e) => {
        const { name, checked } = e.target;
        if (name === "all") {
            setCheck({
                all: checked,
                service: checked,
                privacy: checked,
                marketing: checked
            });
        } else {
            setCheck((prev) => {
                const newState = { ...prev, [name]: checked };
                const allChecked = newState.service && newState.privacy && newState.marketing;
                return { ...newState, all: allChecked };
            });
        }
    }, []);

    // 필수 항목 동의 여부 확인
    const isNextEnabled = check.service && check.privacy;

    // 페이지 이동 핸들러
    const moveToAccountJoin = useCallback(() => {
        if (isNextEnabled) {
            onClose(); // 이동 전 모달 닫기
            navigate("/account/join");
        }
    }, [isNextEnabled, navigate, onClose]);

    // 열려있지 않으면 아무것도 렌더링하지 않음
    if (!isOpen) return null;

    return (
        <>
            {/* 모달 백드롭 (배경 어둡게) */}
            <div 
                className="modal-backdrop fade show" 
                onClick={onClose}
                style={{ zIndex: 1040 }}
            ></div>

            {/* 모달 실제 내용 */}
            <div 
                className="modal fade show d-block" 
                tabIndex="-1" 
                role="dialog" 
                style={{ zIndex: 1050 }}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content border-0 shadow">
                        
                        {/* Header */}
                        <div className="modal-header text-white" style={{ backgroundColor: MINT_COLOR }}>
                            <h5 className="modal-title fw-bold flex-grow-1 text-center ps-4">
                                약관 동의
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close btn-close-white" 
                                onClick={onClose} 
                                aria-label="Close"
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4">
                            <p className="text-center text-muted mb-4">
                                회원가입을 계속하려면,<br/>이용약관 및 정책에 동의해주세요.
                            </p>

                            {/* 전체 동의 박스 */}
                            <div 
                                className="p-3 rounded mb-3 d-flex align-items-center"
                                style={{ 
                                    backgroundColor: check.all ? 'rgba(120, 194, 173, 0.1)' : '#f8f9fa',
                                    border: check.all ? `1px solid ${MINT_COLOR}` : '1px solid #dee2e6',
                                    cursor: "pointer"
                                }}
                                // div 클릭 시에도 체크박스 토글
                                onClick={() => handleCheck({ target: { name: 'all', checked: !check.all } })}
                            >
                                <input
                                    className="form-check-input m-0 me-3"
                                    type="checkbox"
                                    id="checkAll"
                                    name="all"
                                    checked={check.all}
                                    onChange={handleCheck}
                                    onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                                    style={{ transform: "scale(1.3)", cursor: "pointer", borderColor: check.all ? MINT_COLOR : '' }}
                                />
                                <label 
                                    className="form-check-label fw-bold fs-5" 
                                    htmlFor="checkAll"
                                    style={{ cursor: "pointer", color: check.all ? MINT_COLOR : 'inherit' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    모두 동의합니다
                                </label>
                            </div>

                            {/* 개별 약관 리스트 */}
                            <ul className="list-group list-group-flush">
                                {/* 서비스 이용약관 */}
                                <li className="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <input 
                                            className="form-check-input m-0 me-2" 
                                            type="checkbox" 
                                            id="checkService" 
                                            name="service" 
                                            checked={check.service} 
                                            onChange={handleCheck}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label className="form-check-label" htmlFor="checkService" style={{ cursor: "pointer" }}>
                                            <span style={{ color: MINT_COLOR, fontWeight: "bold" }}>(필수)</span> 서비스 이용약관
                                        </label>
                                    </div>
                                    <span className="small text-muted" style={{ cursor: "pointer", textDecoration: "underline" }}>보기</span>
                                </li>

                                {/* 개인정보 */}
                                <li className="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <input 
                                            className="form-check-input m-0 me-2" 
                                            type="checkbox" 
                                            id="checkPrivacy" 
                                            name="privacy" 
                                            checked={check.privacy} 
                                            onChange={handleCheck}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label className="form-check-label" htmlFor="checkPrivacy" style={{ cursor: "pointer" }}>
                                            <span style={{ color: MINT_COLOR, fontWeight: "bold" }}>(필수)</span> 개인정보 수집 및 이용
                                        </label>
                                    </div>
                                    <span className="small text-muted" style={{ cursor: "pointer", textDecoration: "underline" }}>보기</span>
                                </li>

                                {/* 마케팅 */}
                                <li className="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <input 
                                            className="form-check-input m-0 me-2" 
                                            type="checkbox" 
                                            id="checkMarketing" 
                                            name="marketing" 
                                            checked={check.marketing} 
                                            onChange={handleCheck}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label className="form-check-label" htmlFor="checkMarketing" style={{ cursor: "pointer" }}>
                                            <span className="text-secondary fw-bold">(선택)</span> 마케팅 정보 수신 동의
                                        </label>
                                    </div>
                                    <span className="small text-muted" style={{ cursor: "pointer", textDecoration: "underline" }}>보기</span>
                                </li>
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 pt-0 pb-4 px-4">
                            <button 
                                type="button" 
                                className="btn w-100 py-3 text-white fw-bold fs-5"
                                onClick={moveToAccountJoin} 
                                disabled={!isNextEnabled}
                                style={{ 
                                    backgroundColor: isNextEnabled ? MINT_COLOR : '#ccc',
                                    borderColor: isNextEnabled ? MINT_COLOR : '#ccc',
                                    transition: '0.3s'
                                }}
                            >
                                동의하고 가입하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TermsModal;