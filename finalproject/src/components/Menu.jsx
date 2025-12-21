import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { CiCalendar } from "react-icons/ci";
import dayjs from "dayjs";
import TermsModal from "./account/accountJoin/TermsModal";


import { toast } from "react-toastify";
import ScheduleModal from "./schedule/ScheduleModal";


export default function Menu() {
  // 이동 도구
  const navigate = useNavigate();

  // jotai state
  const [loginId, setloginId] = useAtom(loginIdState);
  const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
  const [accessToken, setAccessToken] = useAtom(accessTokenState);
  const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const clearLogin = useSetAtom(clearLoginState);

  //state
  const [open, setOpen] = useState(false);

  // 일정 모달 열림/닫힘 상태 관리
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // 화면이 로딩될 때마다 실행
  useEffect(() => {
    // 1. 토큰이 유효한 경우
    if (accessToken && accessToken.length > 0) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    // 2. 토큰이 없는 경우 (로그아웃 상태)
    else {
      delete axios.defaults.headers.common["Authorization"];
    }
    // 3. 로그인 판정 완료 (로그인이든 아니든 로딩은 끝난 것임)
    setLoginComplete(true);

  }, [accessToken, setLoginComplete]); // clearLogin 의존성 제거

  //callback
  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  //callback
  // ★ [핵심 추가] 모달 열기 핸들러
  const openModal = useCallback(() => {
    if (isLogin) {
      setIsScheduleModalOpen(true);
    } else {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?")) {
        navigate("/account/login");
      }
    }
  }, [isLogin, navigate]);

  // ★ [핵심 추가] 모달 닫기 핸들러
  const closeModal = useCallback(() => {
    setIsScheduleModalOpen(false);
  }, []);

  // 로그아웃
  const logout = useCallback(async (e) => {
    e.stopPropagation();//더 이상의 이벤트 확산을 금지
    e.preventDefault();//a태그 기본 동작도 금지

    clearLogin();

    await axios.delete("/account/logout");

    // axios에 설정된 헤더 제거
    delete axios.defaults.headers.common["Authorization"];

    // 메인페이지로 이동
    navigate("/");

    closeMenu();
  });

  return (
    <>

      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">메인</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor04" aria-controls="navbarColor04" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor04">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/">Home
                  <span className="visually-hidden">(current)</span>
                </a>
              </li>
              {isLogin === true ? (<>
                {/* 로그인 시 나와야 하는 화면 */}
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" onClick={logout}>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>로그아웃</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/scheduleList">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>일정조회</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/mypage">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>마이페이지</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="#">
                    <i className="fa-solid fa-user-plus"></i>
                    <span>{loginId} ({loginLevel})</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/mypage">
                    <i className="fa-solid fa-user-plus"></i>
                    <span></span>
                  </Link>
                </li>
              </>) : (<>
                {/* 비로그인 시 나와야 하는 화면 */}
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/account/login">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>로그인</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  {/* TermsModal 안에 "회원가입" 글자와 모달 로직이 다 들어있습니다 */}
                  <TermsModal />
                </li>
              </>)}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                  <a className="dropdown-item" href="#">Something else here</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">Separated link</a>
                </div>
              </li>
            </ul>
            {/* <form className="d-flex">
        <input className="form-control me-sm-2" type="search" placeholder="Search"/>
        <button className="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
      </form> */}

            <button
              className="btn btn-primary fs-5 d-flex align-items-center justify-content-center lh-1"
              href="#" type="button" onClick={openModal} >
              <CiCalendar className="fs-2 me-1" />새일정 등록하기
            </button>
          </div>
        </div>
      </nav>

      {/* ★ 핵심 수정: 부모(Menu)에서 관리하는 state와 함수를 자식(Modal)에게 전달 */}
      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={closeModal}
      />


    </>
  )
}