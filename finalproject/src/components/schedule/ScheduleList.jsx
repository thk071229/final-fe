import { Calendar, User, MapPin, Star, Heart } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ScheduleList() {
  dayjs.locale('ko');

  const [schedule, setSchedule] = useState([]);
  const MINT_COLOR = "#78C2AD";

  // --- [스타일 정의] Home.jsx 감성 그대로 가져오기 ---
  const styles = {
    card: {
      border: "none",
      borderRadius: "20px", // 더 둥글게
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)", // 부드러운 그림자
      transition: "all 0.3s ease",
      backgroundColor: "white",
      height: "100%",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    cardImageWrapper: {
        height: "220px", // 이미지 높이를 조금 더 시원하게
        width: "100%",
        position: "relative",
        overflow: "hidden"
    },
    cardImage: {
      height: "100%",
      width: "100%",
      objectFit: "cover",
      transition: "transform 0.5s ease", // 이미지 확대 효과용
    },
    cardBody: {
      padding: "1.5rem",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    tag: {
      fontSize: "0.75rem",
      color: MINT_COLOR,
      backgroundColor: "#effbf8",
      padding: "6px 12px", // 태그 여백 확보
      borderRadius: "20px", // 알약 모양
      fontWeight: "700",
      marginRight: "8px",
      display: "inline-flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    userImage: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: "#eee",
        marginRight: "6px"
    }
  };

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      const resp = await axios.get("/schedule/");
      setSchedule(resp.data);
    } catch (e) {
      console.error("일정 로드 실패", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="container py-5">
      {/* 헤더 섹션 */}
      <div className="d-flex flex-column align-items-center mb-5 text-center">
        <h2 style={{ fontWeight: "800", color: "#333", marginBottom: "10px" }}>
            TripPlanner 여행 일정
        </h2>
        <p className="text-muted" style={{ maxWidth: "600px", wordBreak: "keep-all" }}>
            다른 여행자들은 어디로 떠났을까요? <br/>
            매력적인 여행 코스를 발견하고 나만의 일정을 계획해보세요.
        </p>
      </div>

      {/* [레이아웃 수정] 
         row-cols-1: 모바일 1개
         row-cols-md-2: 태블릿 2개
         row-cols-lg-3: 데스크탑 3개
         g-4: 카드 사이 간격(Gap)을 1.5rem(24px)으로 넓힘 (g-3보다 넓음)
      */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {schedule.map((item) => (
          <div key={item.scheduleNo} className="col">
            <Link to={`/schedulePage/${item.scheduleNo}`} className="text-decoration-none text-dark">
              <div
                style={styles.card}
                className="hover-card-effect" // CSS로 hover 시 translateY 등을 주기 위해 클래스 추가 (필요시 인라인 스타일로 대체 가능)
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)"; // 위로 살짝 떠오름
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(120, 194, 173, 0.25)"; // 그림자 진해짐
                  // 이미지 확대 효과 (querySelector 사용)
                  const img = e.currentTarget.querySelector('.card-img-top');
                  if(img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
                  const img = e.currentTarget.querySelector('.card-img-top');
                  if(img) img.style.transform = "scale(1)";
                }}
              >
                {/* 이미지 영역 */}
                <div style={styles.cardImageWrapper}>
                  <img
                    className="card-img-top"
                    style={styles.cardImage}
                    src={item.scheduleImage
                      ? `http://localhost:8080/attach/download?attachmentNo=${item.scheduleImage}`
                      : "/images/default-schedule.jpg"}
                    onError={(e) => e.target.src = "/images/default-profile.jpg"}
                    alt={item.scheduleName}
                  />
                  
                  {/* 상태 뱃지 (왼쪽 상단) */}
                  <div style={{
                    position: "absolute", top: "15px", left: "15px",
                    backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "8px",
                    padding: "6px 12px", fontSize: "0.75rem", fontWeight: "800",
                    color: item.scheduleState === '공개' ? MINT_COLOR : "#ff6b6b",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    letterSpacing: "-0.5px"
                  }}>
                    {item.schedulePublic === 'Y' ? 'OPEN' : 'PRIVATE'}
                  </div>

                  {/* 좋아요/북마크 버튼 (오른쪽 상단 - 데코레이션) */}
                  <div style={{
                      position: "absolute", top: "15px", right: "15px",
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white"
                  }}>
                      <Heart size={18} />
                  </div>
                </div>

                {/* 내용 영역 */}
                <div style={styles.cardBody}>
                  {/* 태그 (장소, 일정수) */}
                  <div className="mb-3">
                    {item.unitFirst?.scheduleUnitContent && (
                      <span style={styles.tag}>
                        <MapPin size={12} className="me-1" strokeWidth={3} />
                        {item.unitFirst.scheduleUnitContent}
                      </span>
                    )}
                    {item.unitCount > 1 && (
                      <span style={{...styles.tag, backgroundColor: "#f8f9fa", color: "#666"}}>
                        +{item.unitCount - 1} 코스
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h5 className="fw-bold mb-2 text-truncate" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                    {item.scheduleName}
                  </h5>

                  {/* 작성자 정보 */}
                  <div className="d-flex align-items-center mb-4">
                     <div style={styles.userImage} className="d-flex align-items-center justifyContent-center text-muted">
                        <User size={14} className="m-auto"/>
                     </div>
                     <span className="text-muted small fw-bold">{item.scheduleOwner}</span>
                  </div>

                  {/* 하단 구분선 및 정보 */}
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <div className="d-flex align-items-center text-secondary small fw-semibold">
                      <Calendar size={14} className="me-1" />
                      {dayjs(item.scheduleStartDate).format("YYYY.MM.DD")}
                    </div>
                    <div className="d-flex align-items-center text-secondary small fw-semibold">
                      <User size={14} className="me-1" />
                      {item.memberCount}명과 함께
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}