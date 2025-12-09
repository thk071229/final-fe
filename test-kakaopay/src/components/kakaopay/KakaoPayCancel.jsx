import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import "./KakaoPay.css";


export default function KakaoPayCancel() {

    return (<>

        <Jumbotron subject="Final-Project-2조" detail="카카오결제 취소" />

        <div className="row mt-4">
            <div className="col">
                <Link to="/" className="none-decortion">홈</Link>
            </div>
        </div>
    </>)
}