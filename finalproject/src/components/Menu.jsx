import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export default function Menu(){
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

    // 화면이 로딩될때마다 accessToken이 있는 경우 axios에 설정하는 코드 구현
    useEffect(() => {
        if (accessToken?.length > 0) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
        //판정이 끝난 시점
        setLoginComplete(true);
    }, [accessToken]);

    //callback
    const closeMenu = useCallback(()=>{
        setOpen(false);
    },[]);

    // 로그아웃
    const logout = useCallback(async(e)=>{});


    return (
    <>
        <h1>Menu</h1>
        {isLogin === true ? (<>
                            {/* 로그인 시 나와야 하는 화면 */}
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" onClick={logout}>
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span>로그아웃</span>
                                </Link>
                            </li>
                            <li className="nav-item" onClick={closeMenu}>
                                <Link className="nav-link" to="#">
                                    <i className="fa-solid fa-user-plus"></i>
                                    <span>{loginId} ({loginLevel})</span>
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
                                <Link className="nav-link" to="/account/join">
                                    <i className="fa-solid fa-user-plus"></i>
                                    <span>회원가입</span>
                                </Link>
                            </li>
                        </>)}
    </>
    )
}