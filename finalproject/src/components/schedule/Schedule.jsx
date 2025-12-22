import "./Schedule.css";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { Link, Outlet, useLocation } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { loginIdState } from "../../utils/jotai";
import "./Schedule-v1.css";



export default function Schedule({ outletContext }) {
    const loginId = useAtomValue(loginIdState);

    const location = useLocation();
    // const isSearch = location.pathname.endsWith("/search");

 return (
    <>
      <div className="schedule-shell">
        <div className="row mt-1 px-2">
          {/* 탭 */}
          {outletContext.isOwner && (
            <div className="col-12 d-flex justify-content-center mb-4 tab-group triple-tabs">
              <Link
                to="data"
                className={`btn w-100 ${
                  location.pathname.endsWith("/data") ? "tab-active" : "tab-inactive"
                }`}
              >
                리스트 보기
              </Link>
              <Link
                to="search"
                className={`btn w-100 ms-2 ${
                  location.pathname.endsWith("/search") ? "tab-active" : "tab-inactive"
                }`}
              >
                장소 검색
              </Link>
            </div>
          )}

{/* 헤더 */}
<div className="col-12">
  <div className="schedule-header triple-header d-flex align-items-center justify-content-between shadow-sm">

    <h5 className="schedule-title triple-title mb-0">
      {outletContext.scheduleDto.scheduleName}
    </h5>

    <span className="schedule-state-line">
      {outletContext.scheduleDto.scheduleState}
    </span>

  </div>
</div>


          {/* 이동수단 */}
          <div className="col-12 text-center mt-3">
            <p className="option-group-label triple-label mb-2">이동 수단</p>
            <div className="d-flex justify-content-center triple-chip-group">
              <button
                type="button"
                className={`btn btn-option triple-chip ${
                  outletContext.selectedSearch === "CAR" ? "active" : ""
                }`}
                name="CAR"
                onClick={outletContext.selectSearch}
              >
                자동차
              </button>
              <button
                type="button"
                className={`btn btn-option triple-chip ${
                  outletContext.selectedSearch === "WALK" ? "active" : ""
                }`}
                name="WALK"
                onClick={outletContext.selectSearch}
              >
                도보
              </button>
            </div>
          </div>

          {/* 경로옵션 */}
          <div className="col-12 text-center mt-3 mb-3">
            <p className=" option-group-label triple-label mb-2">경로 최적화</p>
            <hr className="triple-divider" />
            <hr className="text-dark"/>
            <div className="d-flex justify-content-center flex-wrap text-nowrap gap-1 triple-chip-group">
              <button
                type="button"
                className={`btn btn-option triple-chip ${
                    outletContext.selectedType?.RECOMMEND ? "active" : ""
                }`}
                name="RECOMMEND"
                onClick={outletContext.selectType}
                >

                추천경로
              </button>
              <button
                type="button"
                className={`btn btn-option triple-chip ${
                  outletContext.selectedType?.TIME ? "active" : ""
                }`}
                name="TIME"
                onClick={outletContext.selectType}
              >
                최단시간
              </button>
              <button
                type="button"
                className={`btn btn-option triple-chip ${
                  outletContext.selectedType?.DISTANCE ? "active" : ""
                }`}
                name="DISTANCE"
                onClick={outletContext.selectType}
              >
                최단길이
              </button>
            </div>
          </div>
        </div>

        {/* 실제 내용 */}
        <DndProvider backend={HTML5Backend}>
          <Outlet context={outletContext} />
        </DndProvider>
      </div>
    </>
  );
}