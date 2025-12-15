import React from "react";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

const Stepper = ({ currentStep, steps = ["본인 인증", "정보 입력"] }) => {
    return (
        <div className="d-flex justify-content-center align-items-center mb-5 position-relative" style={{ minHeight: "80px" }}>

            {/* 진행 바 (배경 라인) */}
            <div className="position-absolute d-flex align-items-center" style={{ width: '200px', top: '22px', zIndex: 0 }}>
                <div className="w-100 bg-light" style={{ height: '4px' }}></div>

                {/* 진행 바 (채워지는 라인 - Minty 색상) */}
                <div
                    className="position-absolute"
                    style={{
                        height: '4px',
                        backgroundColor: MINT_COLOR, // Minty 색상 적용
                        width: currentStep >= 2 ? '100%' : '0%',
                        transition: 'width 0.5s ease-in-out'
                    }}
                ></div>
            </div>

            {/* 1단계 */}
            <div className="text-center position-relative" style={{ width: '120px', zIndex: 1 }}>
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm fw-bold fs-5 border"
                    style={{
                        width: '45px',
                        height: '45px',
                        transition: 'all 0.3s',
                        // 활성화 여부에 따른 Minty 색상 적용
                        backgroundColor: currentStep >= 1 ? MINT_COLOR : 'white',
                        borderColor: currentStep >= 1 ? MINT_COLOR : '#dee2e6',
                        color: currentStep >= 1 ? 'white' : '#6c757d'
                    }}
                >
                    1
                </div>
                <div
                    className="mt-2 small fw-bold"
                    style={{
                        color: currentStep >= 1 ? MINT_COLOR : '#6c757d'
                    }}
                >
                    {steps[0]}
                </div>
            </div>

            {/* 여백 */}
            <div style={{ width: '100px' }}></div>

            {/* 2단계 */}
            <div className="text-center position-relative" style={{ width: '120px', zIndex: 1 }}>
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm fw-bold fs-5 border"
                    style={{
                        width: '45px',
                        height: '45px',
                        transition: 'all 0.3s',
                        // 활성화 여부에 따른 Minty 색상 적용
                        backgroundColor: currentStep >= 2 ? MINT_COLOR : 'white',
                        borderColor: currentStep >= 2 ? MINT_COLOR : '#dee2e6',
                        color: currentStep >= 2 ? 'white' : '#6c757d'
                    }}
                >
                    2
                </div>
                <div
                    className="mt-2 small fw-bold"
                    style={{
                        color: currentStep >= 2 ? MINT_COLOR : '#6c757d'
                    }}
                >
                    {steps[1]}
                </div>
            </div>

        </div>
    );
};

export default Stepper;