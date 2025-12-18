import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Mail, Phone, Calendar, Smile } from "lucide-react";
import axios from "axios";
import MyInfoEditMoal from "./MyInfoEditMoal";

// Minty 테마 색상
const MINT_COLOR = "#78C2AD";

export default function MyInfo() {
    const { myInfo } = useOutletContext();

    // state
    const [showModal, setShowModal] = useState(false);

    // 모달 열기
    const openMoal = useCallback(() => {
        setShowModal(true);
        // 모달 열릴 때 뒤쪽 스크롤 막기
        document.body.style.overflow = "hidden";
    }, []);

    // 모달 닫기
    const closeModal = useCallback(() => {
        setShowModal(false);
        // 닫을 때 스크롤 풀기
        document.body.style.overflow = "unset";
    }, []);

    const InfoRow = ({ icon: Icon, label, value, readOnly = false, isLast = false }) => {
        return (
            <div className={`row align-items-center py-3 mx-0 ${!isLast ? "border-bottom" : ""}`} style={{ borderColor: "#f0f0f0", minHeight: "70px" }}>

                {/* 1. 좌측 라벨 (고정 너비) */}
                <div className="col-3 col-md-2 d-flex align-items-center ps-2 ps-md-4">
                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0"
                        style={{ width: "20px", height: "32px", backgroundColor: "#effbf8", color: MINT_COLOR }}>
                        <Icon size={16} />
                    </div>
                    <span className="fw-bold text-secondary small text-uppercase">{label}</span>
                </div>

                {/* 2. 데이터 값 영역 (가변 너비) */}
                <div className="col-6 col-md-8">
                    <div className="fw-bold text-dark ps-2" style={{ fontSize: "1rem" }}>
                        {value || <span className="text-muted small">-</span>}
                    </div>
                </div>

                {/* 3. 우측 버튼 영역 (단순 수정 버튼) */}
                <div className="col-3 col-md-2 text-end pe-2 pe-md-4">
                    {!readOnly && (
                        <button
                            className="btn btn-sm fw-bold px-3"
                            style={{
                                backgroundColor: "#f1f3f5", // 아주 연한 회색 (심플한 배경)
                                color: "#495057",           // 진한 회색 글씨
                                border: "none",
                                borderRadius: "8px",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = "#e9ecef"}
                            onMouseLeave={e => e.target.style.backgroundColor = "#f1f3f5"}
                        >
                            수정
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <h4 className="fw-bold mb-4" style={{ color: "#333" }}>내 정보</h4>

            {/* 리스트 박스 */}
            <div className="bg-white border rounded-4 shadow-sm">
                <InfoRow icon={User} label="아이디" value={myInfo.accountId} readOnly />
                <InfoRow icon={Smile} label="닉네임" value={myInfo.accountNickname} />
                <InfoRow icon={Mail} label="이메일" value={myInfo.accountEmail} />
                <InfoRow icon={Phone} label="연락처" value={myInfo.accountContact} />
                <InfoRow icon={Calendar} label="생년월일" value={myInfo.accountBirth} />
                <InfoRow icon={User} label="성별" value={myInfo.accountGender} isLast />
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}