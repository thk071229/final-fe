import { useCallback, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import axios from "axios";
import { accessTokenState, loginIdState, loginLevelState, refreshTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

export default function AccountLogin() {
    //이동 도구
    const navigate = useNavigate();

    //jotai state (전체 화면에 영향을 미치는 데이터)
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);

    //state
    const [account, setAccount] = useState({
        accountId : "",
        accountPw : ""
    });

    //callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setAccount(prev=>({...prev, [name] : value}));
    }, []);

    //로그인
    const [result, setResult] = useState(null);//null(시도한적 없음), true(성공), false(실패)
    const sendLogin = useCallback(async ()=>{
        try {
            const {data} = await axios.post("/account/login", account);
            setResult(true);

            //로그인이 성공하면 jotai state에 loginId와 loginLevel을 설정할 수 있도록 추가 코드 작성 필요  
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);

            //data에 있는 accessToken을 axios에 설정
            // - axios의 기본 설정 중에서 헤더(header)의 Authorization 이름에 토큰값을 설정
            // - Authorization은 "인증" 정보를 의미하는 상식적인 헤더 이름
            // - 인증 정보가 "Bearer" 로 시작하면 대상자에게 권한이 부여된다는 뜻
            // - 그 외에도 Basic, Admin, Digest, ApiKey 등이 존재 (생성가능... 카카오는 KakaoAK 를 씀)
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

            //새로고침 시에도 accessToken이 유지되도록 처리하는 방법
            //1. jotai state로 저장하는 방법 (비교적 간단하지만 보안상 취약점 존재)
            //2. 서버에서 서버전용쿠키를 사용하는 방법
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            //화면 이동
            navigate("/");
        }
        catch(err) {
            setResult(false);
        }
    }, [account]);

    //render
    return (<>
        <Jumbotron subject="회원 로그인" detail="원활한 기능 이용을 위해 로그인해주세요" />

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" name="accountId" value={account.accountId} onChange={changeStrValue}
                        className="form-control"/>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호 </label>
            <div className="col-sm-9">
                <input type="password" name="accountPw" value={account.accountPw} onChange={changeStrValue}
                        className="form-control"/>
            </div>
        </div>

        {result === false && (
        <div className="row mt-4">
            <div className="col-sm-9 offset-sm-3 text-danger">
                입력하신 정보가 올바르지 않습니다.
                다시 확인하고 입력해주세요.
            </div>
        </div>
        )}

        <div className="row mt-5">
            <div className="col">
                <button type="button" className="btn btn-success btn-lg w-100"
                        onClick={sendLogin}>로그인</button>
            </div>
        </div>
    </>)
}