import { useState, useEffect, useCallback } from "react";
import { FaTrash, FaUser, FaUserTimes } from "react-icons/fa"; // 회원탈퇴 아이콘 추가
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSchedule } from "react-icons/ai";
import { MdPayment } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { accessTokenState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState, refreshTokenState } from "../../utils/jotai";
import Swal from 'sweetalert2'
import { toast } from "react-toastify";

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

    //jotai state
    const [loginId, setloginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
    const isLogin = useAtomValue(loginState);
    const clearLogin = useSetAtom(clearLoginState); // setter 가져오기
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

    const deleteAccount = useCallback(async (e) => {
        // 1. 비밀번호 입력 창 띄우기 (결과를 먼저 변수에 받음)
        const result = await Swal.fire({
            title: "삭제를 위해 비밀번호를 한 번 더 입력해주세요",
            input: "password",
            inputLabel: "Password",
            inputPlaceholder: "Enter your password",
            inputAttributes: {
                maxlength: "10",
                autocapitalize: "off",
                autocorrect: "off"
            },
            showCancelButton: true, // 취소 버튼 추가 권장
            confirmButtonText: '탈퇴하기',
        });

        // 2. 사용자가 '확인'을 눌렀고, 비밀번호(value)가 있을 때만 실행
        if (result.isConfirmed && result.value) {
            const rawPassword = result.value;

            try {
                // (1) 백엔드에 삭제 요청
                await axios.post("/account/withdraw", { accountPw: rawPassword });

                // (2) 성공 시, 브라우저 저장소 비우기 (필수!)
                window.sessionStorage.removeItem("accessToken");
                window.localStorage.removeItem("refreshToken");
                delete axios.defaults.headers.common["Authorization"];

                // (3) Jotai 상태(메모리) 초기화 (작성하신 부분)
                clearLogin();

                // (4) 완료 메시지 및 이동
                toast.success("삭제가 완료되었습니다");
                navigate("/");

            } catch (e) {
                console.error(e);
                // 비밀번호가 틀렸거나 서버 오류일 때
                toast.error("삭제에 실패하였습니다. 비밀번호를 확인해주세요.");
            }   
        }
    }, [clearLogin]); // 의존성 배열 추가



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
                            onClick={deleteAccount}
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