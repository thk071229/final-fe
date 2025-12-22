import { useState, useEffect } from "react";
import { X } from "lucide-react";

const MINT_COLOR = "#78C2AD";

const MyInfoEditModal = ({ isOpen, onClose, modalData, onSave }) => {

    // 내부에서 입력값을 관리하기 위한 state
    const [value, setValue] = useState("");

    // 모달이 열릴 때마다 초기값 세팅
    useEffect(() => {
        if (isOpen) {
            setValue(modalData.value || "");
        }
    }, [isOpen, modalData.value]);

    if (!isOpen) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>

            <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-fade-in-up" style={{ width: "400px", maxWidth: "90%" }}>

                {/* 헤더 */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
                    <h5 className="m-0 fw-bold">{modalData.label} 변경</h5>
                    <button onClick={onClose} className="btn p-0 text-secondary border-0 bg-transparent">
                        <X size={24} />
                    </button>
                </div>

                {/* 바디 (필드에 따른 조건부 렌더링) */}
                <div className="p-4">
                    <label className="form-label small fw-bold text-muted">새로운 {modalData.label}</label>

                    {/* 1. 성별: 버튼 선택 */}
                    {modalData.field === 'accountGender' ? (
                        <div className="btn-group w-100" role="group">
                            {['남', '여'].map(gender => (
                                <button
                                    key={gender}
                                    type="button"
                                    className="btn py-2 fw-bold"
                                    style={{
                                        backgroundColor: value === gender ? MINT_COLOR : 'white',
                                        color: value === gender ? 'white' : '#6c757d',
                                        borderColor: value === gender ? MINT_COLOR : '#dee2e6'
                                    }}
                                    onClick={() => setValue(gender)}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    )
                        /* 2. 생년월일: 달력 */
                        : modalData.field === 'accountBirth' ? (
                            <input
                                type="date"
                                className="form-control form-control-lg bg-light border-0 fw-bold text-dark"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                            />
                        )
                            /* 3. 일반 텍스트 */
                            : (
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-light border-0 fw-bold text-dark"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={`${modalData.label} 입력`}
                                    autoFocus
                                />
                            )}
                </div>

                {/* 푸터 */}
                <div className="p-3 border-top bg-light d-flex justify-content-end gap-2">
                    <button className="btn btn-light fw-bold text-secondary border" onClick={onClose}>
                        취소
                    </button>
                    <button
                        className="btn fw-bold text-white"
                        style={{ backgroundColor: MINT_COLOR, border: "none" }}
                        onClick={() => onSave(modalData.field, value)}
                    >
                        저장하기
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
export default MyInfoEditModal;
