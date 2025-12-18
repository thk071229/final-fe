import { useState, useEffect, useCallback } from "react";
import { FaTrash, FaUser, FaUserTimes } from "react-icons/fa"; // 회원탈퇴 아이콘 추가
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSchedule } from "react-icons/ai";
import { MdPayment } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { accessTokenState, loginCompleteState } from "../../utils/jotai";

// 눈이 편안한 색상 팔레트 정의
const PALETTE = {
    activeText: "#4e9f86",   // 글자색: 딥 민트
    activeBg: "#effbf8",     // 배경색: 파스텔 민트
    hoverBg: "#f7fdfb",      // 호버색
    defaultText: "#555555",  // 기본 글자
    border: "#eaeaea",       // 경계선
    dangerBg: "#fff5f5",     // 위험(탈퇴) 배경 (연한 빨강)
    dangerText: "#e03131",   // 위험(탈퇴) 글자 (진한 빨강)
    dangerHover: "#ffc9c9"   // 위험(탈퇴) 호버 배경
};

export default function MyPage() {
    // 이동 도구
    const navigate = useNavigate();
    const logincomplete = useAtomValue(loginCompleteState);
    // 링크 공통 스타일
    const linkBaseStyle = {
        borderRadius: "12px",
        transition: "all 0.2s ease",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        marginBottom: "6px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        letterSpacing: "-0.3px"
    };

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);
    const [profileUrl, setProfileUrl] = useState("/images/default-profile.jpg")

    //state 
    const [myInfo, setMyinfo] = useState({//백엔드에서 넘겨준 데이터를 state에 저장
        accountId: "",
        accountNickname: "",
        accountEmail: "",
        accountBirth: "",
        accountGender: "",
        accountContact: "",
        accountLevel: "",
        attachmentNo: null // 사진 번호 (없으면 null)
    });

    useEffect(() => {
        if (logincomplete) {
            loadData();
        }
    }, [logincomplete]);

    useEffect(() => {
        // 경로가 정확히 '/mypage'일 때만 info로 보냄
        if (location.pathname === '/mypage' || location.pathname === '/mypage/') {
            navigate('info', { replace: true });
        }
        setActiveTab(location.pathname);
    }, [location.pathname]);

    // callback
    const loadData = useCallback(async () => {
        try {
            const resp = await axios.get("/account/mypage");
            setMyinfo(resp.data);
            if (resp.data.attachmentNo) {
                setProfileUrl(`http://localhost:8080/attachment/download?attachmentNo=${resp.data.attachmentNo}`);
            } else {
                setProfileUrl("/images/default-profile.jpg");
            }
        }
        catch (e) {
            console.log("정보 불러오기 실패");
        }
    }, []);

    // 회원탈퇴 
    const deleteAccount = useCallback((e)=>{},[]);

    return (
        <div className="container-fluid p-0" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <div className="row g-0 h-100">
                {/* 1. 사이드바 영역 */}
                <nav className="col-2 d-none d-md-block bg-white d-flex flex-column justify-content-between"
                    style={{ minHeight: "100vh", borderRight: `1px solid ${PALETTE.border}`, position: "relative" }}>

                    {/* 상단 프로필 및 메뉴 */}
                    <div className="pt-5 px-3">
                        {/* 프로필 영역 */}
                        <div className="text-center mb-5">
                            <img src={profileUrl} className="rounded-circle border shadow-sm"
                                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.src = "/images/default-profile.jpg"; // 깨짐 방지
                                }} />
                            <h5 className="fw-bold m-0 mt-2" style={{ color: "#333", fontSize: "1.1rem" }}>{myInfo.accountNickname}</h5>
                        </div>

                        {/* 메뉴 링크들 */}
                        <ul className="nav flex-column">
                            {[
                                { path: "/mypage/info", icon: FaUser, label: "내 정보" },
                                { path: "/mypage/schedule", icon: AiOutlineSchedule, label: "내 일정" },
                                { path: "/mypage/pay", icon: MdPayment, label: "결제 내역" },
                                { path: "/mypage/wishlist", icon: FaHeart, label: "찜 목록" }
                            ].map((item) => {
                                const isActive = activeTab === item.path;
                                return (
                                    <li className="nav-item" key={item.path}>
                                        <Link
                                            to={item.path}
                                            style={{
                                                ...linkBaseStyle,
                                                backgroundColor: isActive ? PALETTE.activeBg : "transparent",
                                                color: isActive ? PALETTE.activeText : PALETTE.defaultText,
                                                fontWeight: isActive ? "600" : "500",
                                            }}
                                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = PALETTE.hoverBg)}
                                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            <item.icon className="me-3" size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* 하단 회원탈퇴 버튼 (화면 하단에 고정되지 않고 메뉴 아래에 여백을 두고 배치하려면 div 위치를 조정하세요) */}
                    <div className="p-3 mb-4 mt-auto">
                        <hr className="mb-4" style={{ borderColor: PALETTE.border }} />
                        <button
                            className="btn w-100 d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: PALETTE.dangerBg,
                                color: PALETTE.dangerText,
                                border: "1px solid #ffec99", // 살짝 노란/붉은 기운의 테두리
                                borderColor: "rgba(224, 49, 49, 0.1)",
                                borderRadius: "12px",
                                padding: "12px",
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e03131"; // 진한 빨강
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = PALETTE.dangerBg;
                                e.currentTarget.style.color = PALETTE.dangerText;
                            }}
                            onClick={() => {
                                if (window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제됩니다.")) {
                                    alert("탈퇴 처리가 진행됩니다.");
                                }
                            }}
                        >
                            <FaTrash className="me-2" /> 회원탈퇴
                        </button>
                    </div>
                </nav>

                {/* 2. 콘텐츠 영역 (Outlet) */}
                <main className="col-md-10 ms-sm-auto col-lg-10 px-md-5 py-5">
                    <div className="container-fluid" style={{ maxWidth: "1100px" }}>
                        <div className="d-flex align-items-center pb-3 mb-4 border-bottom" style={{ borderColor: PALETTE.border }}>
                            <h2 className="h3 fw-bold m-0" style={{ color: "#2c3e50" }}>
                                {activeTab.includes('info') && "내 프로필"}
                                {activeTab.includes('schedule') && "나의 여행 일정"}
                                {activeTab.includes('pay') && "결제 내역 확인"}
                                {activeTab.includes('wishlist') && "내가 찜한 목록"}
                                {activeTab === '/mypage' && "마이 페이지"}
                            </h2>
                        </div>

                        <div className="bg-white rounded-4 p-5" style={{
                            minHeight: "500px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                            border: `1px solid ${PALETTE.border}`
                        }}>
                            <Outlet context={{ myInfo }} />

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}