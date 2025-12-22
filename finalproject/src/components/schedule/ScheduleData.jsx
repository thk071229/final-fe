import { useOutletContext } from "react-router-dom";
import MarkerListSection from "../dnd/MarkerListSection";
import { FaFloppyDisk, FaFlutter, FaPlus } from "react-icons/fa6";
import { FaRoute } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { guestState, loginIdState } from "../../utils/jotai";

export default function ScheduleData() {

    const guest = useAtomValue(guestState);
    const loginId = useAtomValue(loginIdState);

    const {
        days, // 전체 days 객체
        markerData,
        setDays,
        setMarkerData,
        removeMarker,
        routes,
        addDays,
        setSelectedDay,
        searchAllRoot,
        sendData,
        selectedType,
        selectedSearch,
        scheduleDto,
        isOwner
    } = useOutletContext();

    return (<>
        <div className="all-schedule-container">
            {Object.keys(days).map((dayKey) => (
                <div key={dayKey} className="day-group mb-5">
                    {/* 날짜별 구분선 */}
                    <div className="col-12 day-divider my-3">
                        <div className="p-2 border-start border-primary border-4 bg-light d-flex justify-content-between align-items-center"
                            onClick={() => setSelectedDay(dayKey)}>
                            <span className="fw-bold fs-5 text-primary">{dayKey} DAY</span>
                            {/* 날짜별 경로 버튼 */}
                            {isOwner && (
                            <div>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={(e) => {
                                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                                    searchAllRoot(dayKey); // 해당 날짜만 검색하도록 파라미터 전달
                                }}>경로보기</button>
                                <span className="badge bg-secondary">{days[dayKey].markerIds.length} Places</span>
                            </div>
                            )}
                        </div>
                    </div>


                    {/* 해당 날짜의 마커 리스트 섹션 */}
                    <MarkerListSection
                        selectedDay={dayKey}
                        markerIds={days[dayKey].markerIds}
                        selectedType={selectedType}
                        selectedSearch={selectedSearch}
                        routes={routes}
                        markerData={markerData}
                        setDays={setDays}
                        setMarkerData={setMarkerData}
                        removeMarker={removeMarker}
                        isOwner={isOwner}
                    />
                </div>

            ))}
            {isOwner && (
                <div>
                    <div className="d-grid gap-2">
                        <button className="btn w-100 mb-2" onClick={(e) => {searchAllRoot(null)}}>
                            <FaRoute className="me-2" /> 전체 경로 검색하기
                        </button>
                        {guest || (<>
                        <button className="btn w-100 mb-2" onClick={addDays}>
                            <FaPlus /> 날짜 추가
                        </button>
                        <button className="btn w-100" onClick={sendData}>
                            <FaFloppyDisk /> 저장
                        </button>
                        </>)}
                    </div>
                </div>
            )}
        </div>
    </>)
}