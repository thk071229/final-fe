import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight, Calendar } from 'lucide-react';

export default function Footer() {
    // --- 스타일 정의 (Minty Theme) ---
    const MINT_COLOR = "#78C2AD";
    const TEXT_COLOR = "#5a5a5a";
    const LIGHT_BG = "#f9fbfc"; // 아주 연한 민트섞인 회색

    const styles = {
        footer: {
            backgroundColor: LIGHT_BG,
            borderTop: "1px solid #eef2f5",
            paddingTop: "4rem",
            paddingBottom: "2rem",
            color: TEXT_COLOR,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "0.95rem",
        },
        brand: {
            color: MINT_COLOR,
            fontWeight: "800",
            fontSize: "1.5rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
        },
        heading: {
            fontWeight: "700",
            color: "#333",
            marginBottom: "1.2rem",
            fontSize: "1.1rem",
        },
        text: {
            lineHeight: "1.6",
            color: "#6c757d",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        inputGroup: {
            display: 'flex',
            gap: '8px',
            marginTop: '1rem'
        },
        input: {
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '50px',
            outline: 'none',
            width: '100%',
            fontSize: '0.9rem'
        },
        button: {
            backgroundColor: MINT_COLOR,
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '10px 20px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        copyright: {
            borderTop: "1px solid #eef2f5",
            marginTop: "3rem",
            paddingTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#999"
        }
    };

    return (
        <footer style={styles.footer}>
            <div className="container">
                <div className="row gy-4">

                    {/* 1. 브랜드 정보 & 소개 */}
                    <div className="col-lg-4 col-md-6">
                        <Link to="/" style={styles.brand}>
                            {/* 비행기 대신 달력 아이콘이 더 어울릴 수 있어 변경하거나 유지 가능 */}
                            <Plane style={{ marginRight: "8px", transform: "rotate(-10deg)" }} strokeWidth={2.5} />
                            TripPlanner
                        </Link>
                        <p style={{ ...styles.text, marginBottom: "1.5rem" }}>
                            친구와의 가벼운 약속부터 특별한 여행까지.<br />
                            복잡한 계획은 줄이고 만남의 즐거움만 남기세요.<br />
                            TripPlanner가 완벽한 하루를 도와드립니다.
                        </p>
                        <div className="d-flex gap-2">
                            <SocialBtn icon={<Instagram size={18} />} />
                            <SocialBtn icon={<Facebook size={18} />} />
                            <SocialBtn icon={<Twitter size={18} />} />
                        </div>
                    </div>

                    {/* 2. 서비스 메뉴 (수정됨) */}
                    <div className="col-lg-2 col-md-6">
                        <h5 style={styles.heading}>서비스</h5>
                        <div className="d-flex flex-column gap-2">
                            <FooterLink to="#">새 일정 만들기</FooterLink>
                            <FooterLink to="#">추천 일정 둘러보기</FooterLink>
                            <FooterLink to="#">베스트 일정</FooterLink>
                            <FooterLink to="#">일정 공유 커뮤니티</FooterLink>
                        </div>
                    </div>

                    {/* 3. 고객지원 링크 */}
                    <div className="col-lg-2 col-md-6">
                        <h5 style={styles.heading}>고객지원</h5>
                        <div className="d-flex flex-column gap-2">
                            <FooterLink to="#">공지사항</FooterLink>
                            <FooterLink to="#">자주 묻는 질문</FooterLink>
                            <FooterLink to="#">1:1 문의하기</FooterLink>
                            <FooterLink to="#">이용약관</FooterLink>
                            <FooterLink to="#">개인정보처리방침</FooterLink>
                        </div>
                    </div>

                    {/* 4. 뉴스레터 & 연락처 */}
                    <div className="col-lg-4 col-md-6">
                        <h5 style={styles.heading}>뉴스레터 구독</h5>
                        <p style={{ fontSize: '0.9rem', color: '#888' }}>
                            인기있는 데이트 코스와 추천 일정 소식을 받아보세요.
                        </p>
                        <div style={styles.inputGroup}>
                            <input type="email" placeholder="이메일 주소를 입력하세요" style={styles.input} />
                            <button style={styles.button} className="text-nowrap">
                                구독 <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <div style={styles.text}><MapPin size={16} color={MINT_COLOR} /> 서울특별시 강남구 테헤란로 123</div>
                            <div style={styles.text}><Phone size={16} color={MINT_COLOR} /> 1588-0000 (평일 09:00 - 18:00)</div>
                            <div style={styles.text}><Mail size={16} color={MINT_COLOR} /> help@tripplanner.com</div>
                        </div>
                    </div>

                </div>

                {/* 하단 카피라이트 */}
                <div style={styles.copyright}>
                    <p className="mb-0">&copy; {new Date().getFullYear()} TripPlanner. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// --- 보조 컴포넌트: 호버 효과가 있는 링크 ---
function FooterLink({ to, children }) {
    const [isHover, setIsHover] = useState(false);

    const style = {
        color: isHover ? "#78C2AD" : "#6c757d", // Hover 시 Mint 색상
        textDecoration: "none",
        transition: "color 0.2s ease",
        width: "fit-content",
        fontSize: "0.95rem"
    };

    return (
        <Link
            to={to}
            style={style}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            {children}
        </Link>
    );
}

// --- 보조 컴포넌트: 소셜 아이콘 버튼 ---
function SocialBtn({ icon }) {
    const [isHover, setIsHover] = useState(false);

    const baseStyle = {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        backgroundColor: isHover ? "#78C2AD" : "white",
        border: isHover ? "1px solid #78C2AD" : "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isHover ? "white" : "#666",
        transition: "all 0.2s ease",
        cursor: "pointer",
        textDecoration: "none"
    };

    return (
        <a href="#" style={baseStyle}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}>
            {icon}
        </a>
    );
}