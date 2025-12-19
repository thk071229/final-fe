import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Mail, Phone, Calendar, Smile } from "lucide-react";
import axios from "axios";
import MyInfoEditMoal from "./MyInfoEditMoal";
import Swal from 'sweetalert2'

// Minty 테마 색상
const MINT_COLOR = "#78C2AD";

export default function MyInfo() {
    const { myInfo } = useOutletContext();

    // state
    const [showModal, setShowModal] = useState(false);

    // 1. 닉네임 변경
    const changeNickname = useCallback(async () => {
        const result = await Swal.fire({
            title: "새로운 닉네임 변경",
            input: "text",
            inputValue: myInfo.accountNickname, // 현재 값 보여주기
            showCancelButton: true,
            confirmButtonText: '수정',
        });
        if (result.isConfirmed && result.value) {
            // 여기에 axios.post(...) 로직 추가
            console.log("닉네임 변경:", result.value);
        }
    }, [myInfo.accountNickname]);

    // 2. 이메일 변경
    const changeEmail = useCallback(async () => {
        const result = await Swal.fire({
            title: "이메일 변경",
            input: "email",
            inputValue: myInfo.accountEmail,
            showCancelButton: true,
            confirmButtonText: '수정',
        });
        if (result.isConfirmed) {
            console.log("이메일 변경:", result.value);
        }
    }, [myInfo.accountEmail]);

    // 3. 연락처 변경
    const changeContact = useCallback(async () => {
        const result = await Swal.fire({
            title: "연락처 변경",
            input: "text",
            inputValue: myInfo.accountContact,
            showCancelButton: true,
            confirmButtonText: '수정',
        });
        if (result.isConfirmed) {
            console.log("연락처 변경:", result.value);
        }
    }, [myInfo.accountContact]);

    // 4. 생년월일 변경
    const changeBirth = useCallback(async () => {
        const { value: date } = await Swal.fire({
            title: "select departure date",
            input: "date",
            didOpen: () => {
                const today = (new Date()).toISOString();
                Swal.getInput().min = today.split("T")[0];
            }
        });
        if (date) {
            Swal.fire("Departure date", date);
        }
    }, [myInfo.accountBirth]);

    // 5. 성별 변경
    const changeGender = useCallback(async () => {
        const { value: gender } = await Swal.fire({
            title: "성별을 선택해주세요",
            input: "select",
            inputOptions: {
                '남': '남성',
                '여': '여성'
            },
            inputPlaceholder: "Select a Gender",
            showCancelButton: true,
            confirmButtonText: "수정하기",
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value === "") {
                        resolve("성별을 선택해야 합니다!");
                    } else {
                        resolve(); // 통과
                    }
                });
            }
        });
        if (gender) {
            Swal.fire(`You selected: ${gender}`);
        }
    }, [myInfo.accountGender]);

    const InfoRow = ({ icon: Icon, label, value, readOnly = false, isLast = false, onEdit }) => {
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
                            onClick={onEdit}
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
                <InfoRow icon={Smile} label="닉네임" value={myInfo.accountNickname} onEdit={changeNickname} />
                <InfoRow icon={Mail} label="이메일" value={myInfo.accountEmail} onEdit={changeEmail} />
                <InfoRow icon={Phone} label="연락처" value={myInfo.accountContact} onEdit={changeContact} />
                <InfoRow icon={Calendar} label="생년월일" value={myInfo.accountBirth} onEdit={changeBirth} />
                <InfoRow icon={User} label="성별" value={myInfo.accountGender} onEdit={changeGender} isLast />
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