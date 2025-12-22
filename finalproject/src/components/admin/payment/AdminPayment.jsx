import axios from "axios";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaCreditCard, FaChevronRight, FaChevronLeft } from "react-icons/fa6";

export default function AdminPayment() {
    const [paymentData, setPaymentData] = useState({
        list: [],
        page: 1,
        count: 0,
        last: false
    });
    const totalPages = Math.ceil(paymentData.count / 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // 검색 관련 상태 추가
    const [searchType, setSearchType] = useState("payment_owner"); // 기본값: 결제자
    const [searchKeyword, setSearchKeyword] = useState("");

    const handleSearch = (e) => {
        setSearchKeyword(e.target.value);
        setCurrentPage(1);
    };


    const theme = {
        primary: "#86C9BB",
        white: "#ffffff",
        border: "#eeeeee",
        text: "#333333",
        muted: "#888888",
        radius: "16px",
        shadow: "0 4px 12px rgba(0,0,0,0.05)"
    };

    // 데이터 로드 함수 (POST 방식으로 변경 및 검색어 포함)
    const loadPayment = useCallback(async () => {
        setLoading(true);
        try {
            // POST 요청 시 바디에 검색 정보와 페이지 번호 전달
            const response = await axios.post(`/admin/payment/list`, {
                page: currentPage,
                column: searchType,      // 검색 종류 (paymentTid 또는 paymentOwner)
                keyword: searchKeyword   // 검색어
            });
            setPaymentData(response.data);
        } catch (error) {
            console.error("결제 내역 로드 실패", error);
        } finally {
            setLoading(false);
        }
    }, [searchType, searchKeyword, currentPage]); // 검색 조건이 바뀔 때 함수 갱신

    useEffect(() => {
        loadPayment(); // 첫 로딩 시 1페이지
    }, [currentPage]); // 초기 로딩 시 1회 실행

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = dateString.split('T');
        return date[0] + " " + (date[1] ? date[1].substring(0, 5) : "");
    };

    return (
        <div style={{ padding: "10px", animation: "fadeIn 0.5s ease" }}>
            <div style={{ backgroundColor: theme.white, borderRadius: theme.radius, padding: "2rem", boxShadow: theme.shadow }}>
                
                {/* 헤더 및 검색 섹션 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                    <div>
                        <h3 style={{ fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            <FaCreditCard color={theme.primary} /> 결제 내역 관리
                        </h3>
                        <p style={{ color: theme.muted, fontSize: "0.9rem", margin: "5px 0 0 0" }}>
                            검색 결과: {paymentData.count}건
                        </p>
                    </div>

                    {/* 검색 UI 추가 */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        <select 
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            style={{ 
                                padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`,
                                outline: "none", cursor: "pointer", fontSize: "0.9rem"
                            }}
                        >
                            <option value="payment_owner">결제자 ID</option>
                            <option value="payment_tid">거래번호(TID)</option>
                        </select>
                        
                        <div style={{ position: "relative" }}>
                            <FaSearch style={{ position: "absolute", left: "12px", top: "11px", color: "#ccc" }} size={14} />
                            <input 
                                type="text"
                                placeholder="검색어 입력..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ 
                                    padding: "8px 12px 8px 35px", borderRadius: "8px", 
                                    border: `1px solid ${theme.border}`, outline: "none", width: "200px"
                                }}
                            />
                        </div>

                        <button 
                            onClick={handleSearch}
                            style={{ 
                                backgroundColor: theme.primary, color: "white", border: "none",
                                padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                            }}
                        >
                            검색
                        </button>
                    </div>
                </div>

                {/* 테이블 섹션 (TID 컬럼 추가 권장) */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${theme.border}`, color: theme.muted, fontSize: "0.85rem" }}>
                                <th style={{ padding: "1rem", textAlign: "center" }}>번호</th>
                                <th style={{ padding: "1rem", textAlign: "left" }}>결제 상품명 / TID</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>결제자</th>
                                <th style={{ padding: "1rem", textAlign: "right" }}>결제 금액</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>결제 일시</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData.list.length > 0 ? (
                                paymentData.list.map((payment) => (
                                    <tr key={payment.paymentNo} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center", color: theme.muted, fontSize: "0.9rem" }}>
                                            {payment.paymentNo}
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem" }}>
                                            <div style={{ fontWeight: "600" }}>{payment.paymentName}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "4px" }}>{payment.paymentTid}</div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>{payment.paymentOwner}</td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "right", fontWeight: "700", color: theme.primary }}>
                                            ₩{payment.paymentTotal?.toLocaleString()}
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center", fontSize: "0.85rem", color: theme.muted }}>
                                            {formatDate(payment.paymentTime)}
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                                            <span style={{ 
                                                backgroundColor: payment.paymentRemain > 0 ? "#e7f5f3" : "#fff0f0", 
                                                color: payment.paymentRemain > 0 ? theme.primary : "#ff4d4f",
                                                padding: "5px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "bold"
                                            }}>
                                                {payment.paymentRemain > 0 ? "결제완료" : "취소됨"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: "4rem", textAlign: "center", color: theme.muted }}>
                                        {loading ? "데이터를 불러오는 중입니다..." : "검색 결과가 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이징 버튼 영역 */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "2.5rem", gap: "8px" }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{
                                background: "none", border: "none", cursor: currentPage === 1 ? "default" : "pointer",
                                color: currentPage === 1 ? "#ccc" : theme.text, display: "flex", alignItems: "center"
                            }}
                        >
                            <FaChevronLeft size={14} />
                        </button>

                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                style={{
                                    width: "35px", height: "35px", borderRadius: "8px",
                                    border: "none", cursor: "pointer",
                                    backgroundColor: currentPage === idx + 1 ? theme.primary : "transparent",
                                    color: currentPage === idx + 1 ? "white" : theme.text,
                                    fontWeight: currentPage === idx + 1 ? "700" : "500"
                                }}
                            >
                                {idx + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                background: "none", border: "none", cursor: currentPage === totalPages ? "default" : "pointer",
                                color: currentPage === totalPages ? "#ccc" : theme.text, display: "flex", alignItems: "center"
                            }}
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}