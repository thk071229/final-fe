import './App.css'
import { BrowserRouter, Link, useLocation } from "react-router-dom"
import Menu from "./components/Menu"
import Footer from "./components/Footer"
import Content from "./components/Content"


// Jotai 개발자 도구 설정
import "jotai-devtools/styles.css"; // 디자인
import { DevTools } from "jotai-devtools"; // 도구
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { Bounce, ToastContainer } from "react-toastify";
import ServiceCenterButton from "./components/servicecenter/ServiceCenterButton"
import ServiceCenterPopup from "./components/servicecenter/ServiceCenterPopup"
import ChatSocket from "./components/servicecenter/ChatSocket"
import useChat from "./utils/hooks/useChat"
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState, refreshTokenState } from "./utils/jotai"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import CounselorBlocker from "./components/dashboard/CounselorBlocker"
import { useEffect } from "react"
import axios from "axios" 

function App() {
  const { isPopupOpen, openPopup, closePopup, isChatOpen,
    openChat, closeChat, chatNo, } = useChat();

  // jotai state
  const [loginId, setloginId] = useAtom(loginIdState);
  const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
  const [accessToken, setAccessToken] = useAtom(accessTokenState);
  const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const clearLogin = useSetAtom(clearLoginState);

  // 앱이 처음 겨질 때(새로고침 포함) 실행
  useEffect(() => {
    if (accessToken && accessToken.length > 0) {
      // Axios 헤더에 토큰 설정 (새로고침 시 메모리에서 날아간 헤더 복구)
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      console.log("App.js: Axios 헤더 동기화 완료");
    } else {
      // 토큰이 없으면 헤더 제거 (로그아웃 등 상황 대비)
      delete axios.defaults.headers.common["Authorization"];
    }

    // 로그인 여부 판정 완료 (화면 깜빡임 방지용)
    setLoginComplete(true);
  }, [accessToken, setLoginComplete]);

  //고객센터 버튼 메인에만 보이도록 수정
  const LocationWrapper = () => {
    const location = useLocation();
    if (location.pathname !== "/") return null;

    return (
      <>
        <ServiceCenterButton onButtonClick={openPopup} />

        {isPopupOpen && (
          <ServiceCenterPopup
            isOpen={isPopupOpen}
            onClose={closePopup}
            onChatConnect={openChat}
          />
        )}

        {isChatOpen && chatNo && (
          <ChatSocket
            isChatOpen={isChatOpen}
            onChatClose={closeChat}
            currentChatNo={chatNo}
          />
        )}
      </>
    );
  };

  return (
    <>
      <BrowserRouter>
        <CounselorBlocker />
        {/* Jotai 개발자 도구 */}
        {process.env.NODE_ENV === "development" && <DevTools />}

        <Menu />
        <div className="container-fluid my-5 pt-5">
          <Content />

          <hr />
          <Footer />
        </div>

        <LocationWrapper />
      </BrowserRouter>

      {/* 토스트 메세지 컨테이너 */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  )
}

export default App
