import { useNavigate } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { useCallback } from "react";

export default function Unauthorized(){
    const navigate = useNavigate();

    const goHome = useCallback(e=>{
        navigate("/");
    }, []);

    return (<>
        <Jumbotron subject="인증 오류" detail="뭐하세요?"/>

        <button className="btn btn-outline-secondary btn-lg mt-4" onClick={goHome}>
            홈으로
        </button>

    </>)
}