import { useCallback } from "react";
// import update from "immutability-helper";
import { Marker } from "./Marker";

export default function MarkerListSection({ markerIds, routes, markerData, setDays, setMarkerData, selectedDay, selectedType, selectedSearch, removeMarker }) {
    // id로 마커 찾기 (DnD용)
    const findMarker = useCallback((id) => {
        const index = markerIds.indexOf(id);
        return { id, index };
    }, [markerIds]);

    const moveMarker = useCallback((id, atIndex) => {
        setDays((prev) => {
            // console.log(prev[selectedDay].markerIds.indexOf(id))
            const currentMarkerIds = prev[selectedDay].markerIds;
            const fromIndex = currentMarkerIds.indexOf(id);
            if (fromIndex === -1 || atIndex < 0 || atIndex >= currentMarkerIds.length) {
                return prev;
            }

            const updated = [...currentMarkerIds];
            // console.log(updated)
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(atIndex, 0, moved);

            setMarkerData(prev => {
                const newMarkerData = { ...prev };

                // 1. 순서가 변경된 updated 배열을 순회합니다.
                updated.forEach((markerId, index) => {
                    // 2. 새로운 순서(index + 1)를 해당 markerId의 location에 할당합니다.
                    if (newMarkerData[markerId]) {
                        newMarkerData[markerId] = {
                            ...newMarkerData[markerId],
                            no: index + 1, // 1부터 시작하도록 설정
                        };
                    }
                });

                return newMarkerData;
            });

            return {
                ...prev,
                [selectedDay]: {
                    ...prev[selectedDay],
                    markerIds: updated
                }
            };
        });
    }, [setMarkerData, setDays, selectedDay]);

    const changeStrValue = useCallback((e, id) => {
        const { name, value } = e.target;
        setMarkerData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [name]: value
            }
        }));
    }, [setMarkerData])


    // 리스트 렌더링 (여기가 DnD가 작동하는 영역)
    const listElements = markerIds.map((id, index) => {
        const prevId = markerIds[index - 1];
        const nextId = markerIds[index + 1];

        // 2. 경로 검색을 위한 키 생성
        const prevKey = prevId ? `${prevId}##${id}` : null;   // (이전 -> 현재)
        const nextKey = nextId ? `${id}##${nextId}` : null;   // (현재 -> 다음)

        const modeRoutes = routes?.[selectedSearch] || {};
        const activePriority = Object.keys(selectedType).find(key => selectedType[key] === true);

        // 3. 경로 데이터 검색 함수 (키를 받아 해당 배열에서 검색)
        const findRouteData = (targetKey) => {
            if (!targetKey || !activePriority || !modeRoutes[activePriority]) return null;
            return modeRoutes[activePriority].find(r => r.routeKey === targetKey);
        };

        const prevRoute = findRouteData(prevKey);
        const nextRoute = findRouteData(nextKey);

        const durationForMarker = {
            prev: prevRoute ? prevRoute.duration : null,
            next: nextRoute ? nextRoute.duration : null,
        };

        const distanceForMarker = {
            prev: prevRoute ? prevRoute.distance : null,
            next: nextRoute ? nextRoute.distance : null,
        };
            return (<Marker
            key={id}
            id={`${id}`}
            markerData={markerData[id]}
            duration={durationForMarker}
            distance={distanceForMarker}
            moveMarker={moveMarker}
            findMarker={findMarker}
            onRemove={() => removeMarker(selectedDay, id)}
            changeStrValue={(e) => changeStrValue(e, id)}
        />
        )
    });

    return (
        <div className="marker-list-inner">
            {markerIds.length > 0 ? (
                listElements
            ) : (
                <div className="text-center py-4 text-muted small border-top border-bottom">
                    이 날짜에는 일정이 없습니다.
                </div>
            )}
        </div>
    );
}
