import { useAtomValue } from "jotai";
import { loginCompleteState, loginState } from "../../utils/jotai";
import { Navigate } from "react-router-dom";
// import { ClimbingBoxLoader } from "react-spinners";

// 로그인에 성공한 대상만 통과시키는 도구 (= interceptor와 유사)
// children : 내가 만든 태그 사이에 배치된 모든 요소들
export default function Private({children}){
    const loginComplete = useAtomValue(loginCompleteState) // 로그인 판정이 완료되었는지 나타내는 값
    const isLogin = useAtomValue(loginState) // 로그인 상태인지 판정한 결과
    // if(loginComplete === false) return <ClimbingBoxLoader/>
    if(loginComplete === false) return <></>
    // render
    return isLogin === true ? (children) : (<Navigate to={"/account/login"}/>)
}