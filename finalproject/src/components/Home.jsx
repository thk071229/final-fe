import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Heart, Star, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// --- [Mock Data] 추천 일정 데이터 ---
const recommendedSchedules = [
    {
        id: 1,
        title: "성수동 카페거리 데이트",
        desc: "힙한 감성과 맛있는 커피가 있는 주말 오후",
        tags: ["#데이트", "#카페투어", "#감성"],
        location: "서울 성동구",
        time: "4시간",
        likes: 128,
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 2,
        title: "한강공원 피크닉 & 야경",
        desc: "돗자리 펴고 치맥, 그리고 반포대교 무지개분수",
        tags: ["#힐링", "#피크닉", "#야경"],
        location: "서울 서초구",
        time: "5시간",
        likes: 245,
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 3,
        title: "퇴근 후 강남 맛집 탐방",
        desc: "스트레스를 날려버릴 매운 음식과 하이볼 한 잔",
        tags: ["#맛집", "#직장인", "#회식"],
        location: "서울 강남구",
        time: "3시간",
        likes: 89,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 4,
        title: "북촌 한옥마을 산책",
        desc: "고즈넉한 한옥 사이를 걸으며 느끼는 여유",
        tags: ["#산책", "#사진맛집", "#전통"],
        location: "서울 종로구",
        time: "3시간",
        likes: 156,
        image: "https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 5,
        title: "롯데월드 교복 데이트",
        desc: "동심으로 돌아가 놀이기구 정복하기",
        tags: ["#놀이공원", "#액티비티", "#커플"],
        location: "서울 송파구",
        time: "6시간",
        likes: 312,
        image: "https://images.unsplash.com/photo-1605218457335-5a7a7833535d?auto=format&fit=crop&q=80&w=500"
    }
];

// --- [Mock Data] 메인 배너 데이터 ---
const banners = [
    {
        id: 1,
        title: "이번 주말, 뭐 하지?",
        subtitle: "고민하지 말고 TripPlanner 추천 일정으로 떠나보세요.",
        bgColor: "#78C2AD", // Minty Main
        btnColor: "#4a9c85"
    },
    {
        id: 2,
        title: "친구들과의 약속 잡기 힘드신가요?",
        subtitle: "일정 투표부터 장소 선정까지 한 번에 해결하세요.",
        bgColor: "#6CC3D5", // Cyan-ish
        btnColor: "#4aa3b5"
    },
    {
        id: 3,
        title: "나만의 숨은 명소 공유",
        subtitle: "당신만 알고 있는 핫플레이스를 일정에 담아 공유해보세요.",
        bgColor: "#F3969A", // Pink-ish
        btnColor: "#d67579"
    }
];

// --- [Component] 커스텀 슬라이더 (Swiper 대체) ---
const CustomSlider = ({ children, slidesPerView = 1, spaceBetween = 20, autoplay = false, delay = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSlides = React.Children.count(children);
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    const timeoutRef = useRef(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    useEffect(() => {
        if (autoplay) {
            timeoutRef.current = setTimeout(nextSlide, delay);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [currentIndex, autoplay, delay, maxIndex]);

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div
                style={{
                    display: 'flex',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
                    gap: `${spaceBetween}px` // Gap은 CSS Grid/Flex gap으로 처리 (단, transform 계산이 복잡해지므로 여기선 padding으로 간소화)
                }}
            >
                {React.Children.map(children, (child) => (
                    <div style={{ flex: `0 0 calc(${100 / slidesPerView}% - ${spaceBetween}px)`, boxSizing: 'border-box', marginRight: `${spaceBetween}px` }}>
                        {child}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {maxIndex > 0 && (
                <>
                    <button onClick={prevSlide} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>
                        <ChevronLeft size={24} color="#333" />
                    </button>
                    <button onClick={nextSlide} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>
                        <ChevronRight size={24} color="#333" />
                    </button>
                </>
            )}
        </div>
    );
};


export default function Home() {
    const MINT_COLOR = "#78C2AD";

    // Custom Styles
    const styles = {
        sectionTitle: {
            fontWeight: "800",
            color: "#333",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        sectionDesc: {
            color: "#888",
            marginBottom: "2rem",
            fontSize: "0.95rem"
        },
        card: {
            border: "none",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            backgroundColor: "white",
            height: "100%",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column"
        },
        cardImage: {
            height: "200px",
            width: "100%",
            objectFit: "cover",
        },
        cardBody: {
            padding: "1.2rem",
            flex: 1,
            display: "flex",
            flexDirection: "column"
        },
        tag: {
            fontSize: "0.75rem",
            color: MINT_COLOR,
            backgroundColor: "#effbf8",
            padding: "4px 8px",
            borderRadius: "6px",
            fontWeight: "600",
            marginRight: "6px",
            display: "inline-block",
            marginBottom: "6px"
        },
        bannerSlide: {
            height: "360px",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 4rem",
            color: "white",
            position: "relative",
            overflow: "hidden",
            width: "100%"
        }
    };

    return (
        <div className="content-wrapper">

            {/* 1. 메인 배너 슬라이더 (Hero Section) */}
            <section className="mb-5">
                {/* CustomSlider: slidesPerView=1 (한 화면에 하나씩) */}
                <CustomSlider slidesPerView={1} spaceBetween={0} autoplay={true} delay={4000}>
                    {banners.map((banner) => (
                        <div key={banner.id} style={{ padding: '0 5px' }}> {/* Padding for slight gap/shadow safety */}
                            <div style={{ ...styles.bannerSlide, backgroundColor: banner.bgColor }}>
                                {/* 배경 장식 원 */}
                                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                <div style={{ position: 'absolute', right: '100px', bottom: '-100px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

                                <h1 className="display-5 fw-bold mb-3" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                    {banner.title}
                                </h1>
                                <p className="lead mb-4" style={{ opacity: 0.9 }}>
                                    {banner.subtitle}
                                </p>
                                <button className="btn text-white px-4 py-2 rounded-pill fw-bold shadow-sm"
                                    style={{ backgroundColor: banner.btnColor, width: "fit-content", border: "none" }}>
                                    자세히 보기 <ArrowRight size={18} className="ms-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </CustomSlider>
            </section>

            {/* 2. 추천 일정 슬라이더 (Card Carousel) */}
            <section className="py-4">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h3 style={styles.sectionTitle}>
                            <Star fill="#FFD700" color="#FFD700" size={24} />
                            TripPlanner 추천 일정
                        </h3>
                        <p style={styles.sectionDesc}>고민은 덜고 즐거움은 더하는 인기 코스를 만나보세요.</p>
                    </div>
                    <a href="#" style={{ color: "#888", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500" }}>전체보기 &gt;</a>
                </div>

                {/* CustomSlider: 화면 크기에 따라 slidesPerView 조절이 필요하지만, 여기선 간단히 3개로 고정 (반응형 로직은 CSS Media Query나 JS window.resize로 구현 가능) */}
                {/* 모바일 대응을 위해 미디어쿼리 대신 간단한 JS 로직 사용 */}
                <ResponsiveCardSlider items={recommendedSchedules} styles={styles} MINT_COLOR={MINT_COLOR} />
            </section>

            {/* 3. 키워드 섹션 */}
            <section className="py-5">
                <h3 style={styles.sectionTitle}>
                    <Calendar color={MINT_COLOR} size={24} className="me-2" />
                    어떤 약속이 있으신가요?
                </h3>
                <p style={styles.sectionDesc}>상황에 딱 맞는 태그를 선택해보세요.</p>

                <div className="d-flex flex-wrap gap-3">
                    {["#소개팅", "#동창회", "#가족모임", "#비오는날", "#스터디", "#브런치", "#기념일", "#혼밥"].map((tag, idx) => (
                        <button key={idx} className="btn btn-outline-light text-dark shadow-sm rounded-pill px-4 py-2 fw-bold"
                            style={{ borderColor: "#eee", transition: "all 0.2s" }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = MINT_COLOR; e.currentTarget.style.color = MINT_COLOR; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.color = "#333"; }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </section>

        </div>
    );
}

// --- [Component] 반응형 카드 슬라이더 Wrapper ---
function ResponsiveCardSlider({ items, styles, MINT_COLOR }) {
    const [slidesPerView, setSlidesPerView] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setSlidesPerView(1);
            else if (window.innerWidth < 1024) setSlidesPerView(2);
            else setSlidesPerView(3);
        };
        handleResize(); // 초기 실행
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <CustomSlider slidesPerView={slidesPerView} spaceBetween={20} autoplay={false}>
            {items.map((item) => (
                <div key={item.id} style={{ height: '100%' }}>
                    <div
                        style={styles.card}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-5px)";
                            e.currentTarget.style.boxShadow = "0 10px 20px rgba(120, 194, 173, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
                        }}
                    >
                        {/* 카드 이미지 */}
                        <div style={{ position: "relative" }}>
                            <img src={item.image} alt={item.title} style={styles.cardImage} />
                            <div style={{
                                position: "absolute", top: "10px", right: "10px",
                                backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "20px",
                                padding: "4px 8px", fontSize: "0.8rem", fontWeight: "bold",
                                color: "#ff6b6b", display: "flex", alignItems: "center", gap: "4px"
                            }}>
                                <Heart size={12} fill="#ff6b6b" /> {item.likes}
                            </div>
                        </div>

                        {/* 카드 내용 */}
                        <div style={styles.cardBody}>
                            <div className="mb-2">
                                {item.tags.map((tag, idx) => (
                                    <span key={idx} style={styles.tag}>{tag}</span>
                                ))}
                            </div>
                            <h5 className="fw-bold mb-2 text-truncate" style={{ fontSize: '1.1rem' }}>{item.title}</h5>
                            <p className="text-muted small text-truncate mb-3">{item.desc}</p>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                <div className="d-flex align-items-center text-muted small">
                                    <MapPin size={14} className="me-1" /> {item.location}
                                </div>
                                <div className="d-flex align-items-center text-muted small">
                                    <Clock size={14} className="me-1" /> {item.time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </CustomSlider>
    );
}