import { atom } from "jotai";
import {atomWithStorage} from "jotai/utils";

//회원의 아이디 상태
export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);//joati + persist

//회원의 등급 상태
export const loginLevelState = atomWithStorage("loginLevelState", "", sessionStorage);

//accessToken
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);//브라우저를 닫으면 로그인이 풀림

//refreshToken
export const refreshTokenState = atomWithStorage("refreshToken", "", sessionStorage);

//회원인지 판정
export const loginState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel?.length > 0;
});

//관리자인지 판정
export const adminState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel === "관리자";
})

export const clearLoginState = atom(null, (get,set)=>{
    set(loginIdState,"");
    set(loginLevelState,"");
    set(accessTokenState,"");
    set(refreshTokenState,"");
})

// 로그인 판정이 완료되었는지 확인하기 위한 데이터
export const loginCompleteState = atom(false);

// DevTools에서 확인하기 위한 이름 설정
loginIdState.debugLabel = "loginIdState";
loginLevelState.debugLabel = "loginLevelState";
loginState.debugLabel = "loginState";
accessTokenState.debugLabel = "accessTokenState";
adminState.debugLabel = "adminState";
loginCompleteState.debugLabel = "loginCompleteState";
refreshTokenState.debugLabel = "refreshTokenState";
