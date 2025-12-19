import { Link, Outlet } from "react-router-dom";

export default function AccountManager() {
    return (<>
        {/* 이동 링크 */}
        <div className="row mt-4">
            <div className="col">
                <Link to="/admin/accounts/search" className="btn btn-secondary me-2">검색</Link>
                <Link to="/admin/accounts/dashboard" className="btn btn-secondary me-2">현황</Link>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div>
    </>)
}