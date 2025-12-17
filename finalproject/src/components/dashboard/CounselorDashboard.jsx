import axios from "axios";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"

const API_URL = '/chat';

const useAuth = () => {
    const rawToken = sessionStorage.getItem("accessToken");

    if (!rawToken) {
        return { isLoggedIn: false, userLevel: null, loginId: null };
    }

    try {
        const token = rawToken.replace(/"/g, '');
        const payload = jwtDecode(token);
        console.log(payload);
        return {
            isLoggedIn: true,
            userLevel: payload.loginLevel,
            loginId: payload.loginId,
        };
    } catch (e) {
        console.error("JWT 파싱 오류:", e);
        return { isLoggedIn: false, userLevel: null, loginId: null };
    }
};

export default function CounselorDashboard() {
    const navigate = useNavigate();
    const { isLoggedIn, userLevel, loginId } = useAuth();
    const REQUIRED_LEVEL = '상담사';

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/account/login", { replace: true });
            return;
        }

        if (userLevel !== REQUIRED_LEVEL) {
            alert("상담사 전용 페이지입니다.");
            navigate("/unauthorized", { replace: true });
            return;
        }
    }, [isLoggedIn, userLevel, navigate]);

    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState({});
    const messagesEndRef = useRef(null);

    const fetchChatRooms = async () => {
        try {
            const rawToken = sessionStorage.getItem("accessToken");
            if (!rawToken) return;
            const token = rawToken.replace(/"/g, '');
            console.log(token)
            const response = await axios.get(`${API_URL}/counselor/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 403 || response.status === 404) {
                console.error("백엔드 권한 오류:", response.status);
                alert("상담사 전용 페이지입니다. 권한이 없습니다. (API 응답)");
                navigate("/unauthorized", { replace: true });
                return;
            }

            if (response.status !== 200) {
                throw new Error(`API 응답 실패: ${response.statusText}`);
            }
            const { data } = response;

            const convertedRooms = data.map(dto => ({
                id: dto.chatNo,
                userName: `고객 #${dto.chatNo}`,
                status: dto.chatStatus,
                title: dto.chatStatus === "WAITING" ? "새로운 상담 요청" : `진행 중인 채팅 (${dto.chatMaxCount})`,
                userGrade: "N/A",
                chatId: dto.chatId,
                chatLevel: dto.chatLevel
            }));

        } catch (error) {
            console.error("채팅 목록 로드 오류:", error);
        }
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedRoomId]);

    const updateChatStatus = async (chatNo, newStatus) => {
        const rawToken = sessionStorage.getItem("accessToken");
        if (!rawToken) return;
        const token = rawToken.replace(/"/g, '');

        const updateData = {
            chatNo: chatNo,
            chatStatus: newStatus,
            chatId: newStatus === 'ACTIVE' ? loginId : null,
        };

        try {
            const response = await axios.post(`${API_URL}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) throw new Error("상태 업데이트 실패");

            fetchChatRooms();
        } catch (error) {
            alert(`상태 변경 실패: ${error.message}`);
        }
    };

    const handleRoomClick = (id) => {
        setSelectedRoomId(id);

        const room = rooms.find(r => r.id === id);
        if (room && room.status === 'WAITING') {
            updateChatStatus(id, 'ACTIVE');
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedRoomId) return;

        const newMessage = {
            sender: 'me',
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
            ...prev,
            [selectedRoomId]: [...(prev[selectedRoomId] || []), newMessage]
        }));

        setInputText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSendMessage();
    };

    const handleCloseChat = () => {
        if (!selectedRoomId) return;

        if (window.confirm("정말로 상담을 종료하시겠습니까?")) {
            updateChatStatus(selectedRoomId, 'CLOSED');
            setSelectedRoomId(null);
        }
    };

    const currentRoom = rooms.find(r => r.id === selectedRoomId);
    const currentMessages = messages[selectedRoomId] || [];

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'WAITING': return { color: '#ff4d4f', border: '1px solid #ff4d4f', text: '대기 중' };
            case 'ACTIVE': return { color: '#52c41a', border: '1px solid #52c41a', text: '상담 중' };
            case 'CLOSED': return { color: '#999', border: '1px solid #999', text: '상담 종료' };
            default: return { color: '#666', border: '1px solid #666', text: '알 수 없음' };
        }
    };

    if (!isLoggedIn || userLevel !== REQUIRED_LEVEL) return null;

    return (
        <div style={styles.container}>
            {/* 왼쪽 패널 */}
            <div style={styles.leftPane}>
                <div style={styles.paneHeader}>
                    상담 요청 목록
                    <span style={styles.roomCount}> (총 {rooms.length}건)</span>
                </div>

                {/* 목록 */}
                <div style={styles.listContainer}>
                    {rooms.map(room => {
                        const badge = getBadgeStyle(room.status);

                        return (
                            <div
                                key={room.id}
                                onClick={() => handleRoomClick(room.id)}
                                style={{
                                    ...styles.roomItem,
                                    backgroundColor: selectedRoomId === room.id ? '#e6f7ff' : 'white',
                                    borderLeft: `4px solid ${badge.color}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    {room.userName}
                                    <span style={{
                                        fontSize: '12px',
                                        color: badge.color,
                                        border: badge.border,
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {badge.text}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                                    {room.title}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 중앙 패널 */}
            <div style={styles.centerPane}>
                {selectedRoomId ? (
                    <>
                        <div style={styles.chatHeader}>
                            <span>{currentRoom.userName}님과의 상담</span>

                            {currentRoom.status === "ACTIVE" && (
                                <button onClick={handleCloseChat} style={styles.closeButton}>
                                    상담 종료
                                </button>
                            )}

                            {currentRoom.status === "CLOSED" && (
                                <span style={styles.closedBadge}>상담 종료됨</span>
                            )}
                        </div>

                        <div style={styles.messageArea}>
                            {currentMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.messageRow,
                                        justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        ...styles.messageBubble,
                                        backgroundColor: msg.sender === 'me' ? '#1890ff' : '#f0f0f0',
                                        color: msg.sender === 'me' ? 'white' : 'black',
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={styles.timeText}>{msg.time}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {currentRoom.status === 'ACTIVE' ? (
                            <div style={styles.inputArea}>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={styles.input}
                                    placeholder="메시지를 입력하세요..."
                                />
                                <button style={styles.sendButton} onClick={handleSendMessage}>전송</button>
                            </div>
                        ) : (
                            <div style={styles.inputDisabledArea}>
                                종료된 상담에는 메시지를 보낼 수 없습니다.
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <h3>상담할 고객을 선택해주세요</h3>
                        <p>좌측에서 상담 방을 선택하세요.</p>
                    </div>
                )}
            </div>

            {/* 오른쪽 패널 */}
            <div style={styles.rightPane}>
                <div style={styles.paneHeader}>고객 정보</div>
                {currentRoom ? (
                    <div style={{ padding: '20px' }}>
                        <div style={styles.infoCard}>
                            <strong>회원 정보</strong>
                            <p>방 번호: {currentRoom.id}</p>
                            <p>이름: {currentRoom.userName}</p>
                            <p>등급: {currentRoom.userGrade}</p>
                            <p>상태: {getBadgeStyle(currentRoom.status).text}</p>
                            <p>배정 상담사: {currentRoom.chatId || '없음'}</p>
                        </div>

                        <div style={styles.infoCard}>
                            <strong>지도 영역</strong>
                            <div style={styles.mapPlaceholder}>[ Kakao Map ]</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                        선택된 고객이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

// --- [7] 인라인 스타일 객체 (CSS 없이 사용하기 위함) ---
const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
        backgroundColor: '#f5f5f5'
    },
    // 왼쪽 영역
    leftPane: {
        width: '300px',
        backgroundColor: 'white',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column'
    },
    paneHeader: {
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: '#fafafa'
    },
    listContainer: {
        overflowY: 'auto',
        flex: 1
    },
    roomCount: {
        fontWeight: 'normal',
        fontSize: '14px',
        color: '#999',
        marginLeft: '5px'
    },
    roomItem: {
        padding: '15px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background 0.2s',
        '&:hover': {
            backgroundColor: '#f9f9f9'
        }
    },
    emptyList: {
        textAlign: 'center',
        padding: '20px',
        color: '#999',
        fontSize: '14px'
    },
    // 중앙 영역
    centerPane: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRight: '1px solid #ddd',
    },
    chatHeader: {
        height: '60px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontWeight: 'bold',
        fontSize: '18px',
        backgroundColor: 'white'
    },
    closedBadge: {
        fontSize: '12px',
        color: '#999',
        border: '1px solid #999',
        padding: '5px 10px',
        borderRadius: '5px'
    },
    messageArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9'
    },
    messageRow: {
        display: 'flex',
        marginBottom: '10px',
        alignItems: 'flex-end'
    },
    messageBubble: {
        maxWidth: '60%',
        padding: '10px 15px',
        borderRadius: '15px',
        fontSize: '14px',
        lineHeight: '1.4',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    timeText: {
        fontSize: '10px',
        color: '#999',
        marginLeft: '5px',
        marginRight: '5px',
        marginBottom: '2px'
    },
    inputArea: {
        height: '70px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        padding: '0 15px',
        backgroundColor: 'white'
    },
    inputDisabledArea: {
        height: '70px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#999',
        fontWeight: 'bold'
    },
    input: {
        flex: 1,
        height: '40px',
        border: '1px solid #ddd',
        borderRadius: '20px',
        padding: '0 15px',
        marginRight: '10px',
        outline: 'none'
    },
    sendButton: {
        padding: '10px 20px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    closeButton: {
        padding: '5px 10px',
        backgroundColor: '#ff4d4f',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999'
    },
    // 오른쪽 영역
    rightPane: {
        width: '350px',
        backgroundColor: 'white',
        overflowY: 'auto'
    },
    infoCard: {
        backgroundColor: '#fff',
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    mapPlaceholder: {
        width: '100%',
        height: '200px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '10px'
    }
};