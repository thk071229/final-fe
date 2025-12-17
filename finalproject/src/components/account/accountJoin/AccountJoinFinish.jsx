import React from "react";
import { useNavigate } from "react-router-dom";

// 성공 체크 아이콘 (SVG)
const IconSuccess = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#198754" className="bi bi-check-circle-fill mb-4" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </svg>
);

export default function AccountJoinFinish() {
    const navigate = useNavigate();

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                        <div className="card-body p-5 text-center">
                            
                            {/* 성공 아이콘 */}
                            <IconSuccess />

                            {/* 환영 문구 */}
                            <h2 className="fw-bold mb-3">회원가입 완료!</h2>
                            <p className="text-muted fs-5 mb-5">
                                회원가입이 성공적으로 완료되었습니다.<br />
                                이제 로그인을 통해 다양한 서비스를 이용해보세요.
                            </p>

                            {/* 버튼 영역 */}
                            <div className="d-grid gap-3 col-8 mx-auto">
                                <button 
                                    className="btn btn-success btn-lg fw-bold py-3" 
                                    onClick={() => navigate("/account/login")}
                                >
                                    로그인 하러가기
                                </button>
                                
                                <button 
                                    className="btn btn-outline-secondary btn-lg fw-bold py-3" 
                                    onClick={() => navigate("/")}
                                >
                                    메인으로 이동
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}