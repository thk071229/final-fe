import { Link, Outlet } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";

export default function AdminHome() {

    //render
    return (<>
        <Jumbotron subject="관리자 메뉴" detail="홈페이지 관리 기능 모음"/>

        {/* 이동 링크 */}
        <div className="row mt-4">
            <div className="col">
                <Link to="/admin/accounts" className="btn btn-secondary me-2">계정관리</Link>
                <Link to="/admin/dashboard" className="btn btn-secondary me-2">대시보드</Link>
            </div>
        </div>

        {/* 중첩 라우팅이 되어 있기 때문에 해당 영역을 표시할 수 있도록 <Outlet/>을 생성해야함 */}
        <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div>
    </>)
}