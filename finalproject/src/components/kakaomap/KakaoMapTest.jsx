import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import KakaoLoader from "./useKakaoLoader";
import {v4 as uuidv4} from "uuid";

import "./KakaoMapTest.css";
import axios from "axios";
import { DndProvider } from "react-dnd";
import MarkerListSection from "../dnd/MarkerListSection";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaPlus } from "react-icons/fa6";

export default function KakaoMapTest() {
    KakaoLoader()

    const [days, setDays] = useState({
        1: {
            markerIds : [ /* uuid-1, uuid-2 */],
            distance : {
                /*
                    uuid1-uuid2 : {
                        RECOMMEND: int,
                        TIME: int,
                        DISTANCE: int
                    },
                */
            },
            duration : {
                /*
                    uuid1-uuid2 : {
                        RECOMMEND: int,
                        TIME: int,
                        DISTANCE: int
                    },
                */
            },
            polyline : {
                    RECOMMEND : {
                        // uuid1-uuid2 : { linePath } 
                    },
                    TIME : {
                        // uuid1-uuid2 : { linePath    }
                    },
                    DISTANCE : {
                        // uuid1-uuid2 : { linePath    }
                    }
            },
        },
    });
    const [markerData, setMarkerData] = useState({
        /* 
            uuid-1 : {
                no: int,
                x: double,
                y: double,
                name: string,
                content: string
        */
    })
    const [selectedDay, setSelectedDay] = useState(1)
    const [polyLine, setPolyLine] = useState([]);
    const [selectedType, setSelectedType] = useState({
        RECOMMEND : true,
        TIME : false,
        DISTANCE : false
    })

    const [center, setCenter] = useState({
        lng: 126.9780,
        lat: 37.5665,
    })

    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = {
            x: latlng.getLng(),
            y: latlng.getLat(),
        }
        
        const {data} = await axios.post("/kakaoMap/getAddress", address);
        const addressName = data.documents.map(({address, road_address}) => {
            if(road_address === null){
                return address.address_name;
            }
            if(road_address.building_name.length !== 0){
                return road_address.building_name
            }
            if(road_address.road_name.length !== 0){
                return road_address.road_name
            }
            if(road_address.address_name.length !== 0){
                return road_address.address_name
            }
                
        })

        // 1. setDays를 먼저 실행하여 새로운 markerIds의 길이를 확정하고,
        //    기존의 distance/duration을 유지하며 마커 ID를 추가합니다.
        const currentDay = days[selectedDay] || { markerIds: [] };
        const markerNo = currentDay.markerIds.length + 1;
        setDays(prev => {
            return {
                ...prev,
                [selectedDay]: {
                    ...currentDay, // distance와 duration을 포함한 기존 필드 유지
                    markerIds: [...currentDay.markerIds, id], // 새 ID 추가
                }
            };
        });

        // 2. setMarkerData를 실행할 때, setDays에서 계산한 newMarkerNo를 사용합니다.
        //    (setDays 호출 직후 newMarkerNo가 업데이트 되므로 사용 가능)
        setMarkerData(prev => ({
            ...prev,
            [id]: { 
                no: markerNo, // setDays에서 계산된 정확한 순서
                ...address, 
                name: addressName[0],
                content: "메모영역"
            }
        }));
    }, [days, selectedDay]);

    const removeMarker = useCallback((id) => {
        // 1. days의 최신 스냅샷을 기반으로 업데이트될 배열을 미리 계산
        const currentMarkerIds = days[selectedDay]?.markerIds || [];
        const updatedMarkerIds = currentMarkerIds.filter(markerId => markerId !== id);
        let removedIndex = -1; // 삭제된 마커의 인덱스를 저장할 변수

        setDays(prevDays => {
            const currentDay = prevDays[selectedDay];
            if (!currentDay) return prevDays;
            
            // 1-1. markerIds 배열에서 ID 제거
            const markerIds = currentDay.markerIds;
            removedIndex = markerIds.indexOf(id); // 삭제할 마커의 순서 (index)

            if (removedIndex === -1) return prevDays; // ID가 없으면 변경 없음

            // 1-2. distance와 duration 정보 정리
            const newDistance = { ...currentDay.distance };
            const newDuration = { ...currentDay.duration };

            // 💡 경로 정리 논리:
            // 1. 삭제된 마커(id)와 관련된 모든 경로(key) 제거 (ex: A-id, id-B)
            // 2. 삭제된 마커의 앞뒤 마커(prevId, nextId) 사이의 새로운 경로(prevId-nextId)를 계산해야 함 (TBD)
            
            // (TBD 로직 대신, 일단 관련 경로 제거만 수행)
            // const prevId = removedIndex > 0 ? markerIds[removedIndex - 1] : null;
            // const nextId = removedIndex < markerIds.length - 1 ? markerIds[removedIndex + 1] : null;

            // 1. 삭제된 마커와 연결된 모든 키 제거 (시작/끝 모두)
            Object.keys(currentDay.distance).forEach(key => {
                if (key.startsWith(id + '-') || key.endsWith('-' + id)) {
                    delete newDistance[key];
                    delete newDuration[key];
                }
            });

            // 2. (추가 경로 계산 로직 - 필요 시 백엔드 API 호출)
            // 마커가 중간에 있을 경우 (prevId !== null && nextId !== null)
            // prevId와 nextId 사이의 새 경로 정보를 API로 계산하고 newDistance/newDuration에 추가해야 합니다.
            // 현재는 API 호출이 어렵기 때문에 일단 생략하고, 다음 마커 추가 시 계산되도록 합니다.

            // 1-3. days 상태 업데이트 결과 반환
            return {
                ...prevDays,
                [selectedDay]: {
                    ...currentDay,
                    markerIds: updatedMarkerIds,
                    distance: newDistance,
                    duration: newDuration,
                },
            };
        });


        // 2. markerData 상태 업데이트
        setMarkerData(prevMarkerData => {
            const updatedMarkerData = { ...prevMarkerData };
            delete updatedMarkerData[id]; // 마커 데이터 제거

            // **markerData의 'no' 값 재정렬 (선택된 날짜의 마커만)**            
            const newMarkerData = { ...updatedMarkerData }; // 최종 반환할 객체

            updatedMarkerIds.forEach((markerId, index) => {
                // markerData에서 해당 ID의 데이터가 있는지 확인
                if (newMarkerData[markerId]) {
                    newMarkerData[markerId] = {
                        ...newMarkerData[markerId],
                        no: index + 1, // 새로운 순서 할당
                    };
                }
            });

            return newMarkerData;
        });

    }, [days, selectedDay, setDays, setMarkerData]); 

    const markerElements = useCallback(e=>{
        return (days[selectedDay].markerIds.map(id => (
        <MapMarker
            key={id}
            position={{ lng: markerData[id].x, lat: markerData[id].y  }}
            image={
                {
                    src:'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
                    size: {
                        width: 36,
                        height: 37
                    },
                    options: {
                        offset: {
                            x: 13,
                            y: 37
                        },
                        spriteOrigin: {
                            x: 0,
                            y: (markerData[id].no-1)*46+10
                        },
                        spriteSize : {
                            width: 36,
                            height: 691
                        }
                    }

                }
            }
        />
        )));
    }, [markerData, selectedDay, days]);

    const PRIORITY_COLORS = {
        "RECOMMEND": "#0052FF",
        "TIME": "#FF2D2D",
        "DISTANCE": "#00B050"
    };

    const polyLineElements = useCallback(() => {
        return (
            polyLine
                // 선택된 타입에 따라 필터링 (selectedType: { RECOMMEND: true, ... })
                .filter(pl => selectedType[pl.priority]) 
                .map((pl, idx) => (
                    <Polyline
                        key={idx}
                        path={pl.linePath}
                        strokeWeight={5}
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                        // ⭐️ priority를 사용하여 색상 매핑 ⭐️
                        strokeColor={PRIORITY_COLORS[pl.priority]} 
                    />
                ))
        );
        
    }, [polyLine, selectedType]); // polyLine이 업데이트되면 렌더링

    const searchAllRoot = useCallback(async (e) => {
        resetData();
        if(days[selectedDay]?.markerIds.length <= 1) return;
        const priorities = ["RECOMMEND", "TIME", "DISTANCE"];
        if(days[selectedDay]?.markerIds.length === 2) {
            const fromId = days[selectedDay].markerIds[0];
            const toId = days[selectedDay].markerIds[1];
            const key = `${fromId}-${toId}`;

            const selectedDayMarkerData = days[selectedDay]?.markerIds.map(id => markerData[id]);

            const results = await Promise.all(
                priorities.map(priority =>
                    axios.post(`/kakaoMap/search?priority=${priority}`, Object.values(selectedDayMarkerData))
                )
            );
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];
            const distanceUpdates = {};
            const durationUpdates = {};
            const polyLineData = {
                RECOMMEND: {},
                TIME: {},
                DISTANCE: {}
            };
            
            results.forEach((result,index) => {
                const {summary, sections} = result.data.routes[0];
                const {roads, duration, distance} = sections[0];
                const {priority} = summary;
                // console.log(`roads : ${roads} || duration : ${duration} || distance : ${distance}`);
                // console.log(`priority : ${priority}`);
                
                const linePath = [];
                roads.forEach(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                distanceUpdates[priority] = distance
                durationUpdates[priority] = duration
                polyLineData[priority][key] = { linePath };
            });
            setDays(prev => {
                    const currentData = prev[selectedDay];
                    // 기존 distance/duration 데이터에 새 데이터를 병합
                    const mergedDistance = { 
                        ...currentData.distance, 
                        [key]: { 
                            ...currentData.distance[key], 
                            ...distanceUpdates // RECOMMEND, TIME, DISTANCE의 값
                        }
                    };
                    const mergedDuration = { 
                        ...currentData.duration, 
                        [key]: { 
                            ...currentData.duration[key], 
                            ...durationUpdates // RECOMMEND, TIME, DISTANCE의 값
                        }
                    };
                    
                    // Polyline도 기존 데이터와 병합 (현재는 마커 2개이므로 덮어쓰기)
                    // (마커 2개일 때는 모든 경로를 한 번에 계산하므로 전체 polyline을 덮어써도 무방함)
                    const mergedPolyline = {
                        RECOMMEND: {...currentData.polyline?.RECOMMEND, ...polyLineData.RECOMMEND},
                        TIME: {...currentData.polyline?.TIME, ...polyLineData.TIME},
                        DISTANCE: {...currentData.polyline?.DISTANCE, ...polyLineData.DISTANCE},
                    };


                    return {
                        ...prev,
                        [selectedDay] : {
                            ...currentData,
                            distance : mergedDistance,
                            duration : mergedDuration,
                            polyline: mergedPolyline
                        }
                    }
                });

                setPolyLine(prev => [
                    ...prev,
                    {linePath: {...polyLineData}, }
                ])
        } else {
            const {data} = await axios.post("/kakaoMap/searchAll", Object.values(markerData));
            const {summary, sections} = data.routes[0];
            
            const {priority} = summary;
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];

            const distanceUpdates = {};
            const durationUpdates = {};
            const polyLineUpdate = [];

            sections.map(({roads, duration, distance}, index) => {
                const fromId = days[selectedDay].markerIds[index];
                const toId = days[selectedDay].markerIds[index+1];
                const key = `${fromId}-${toId}`;

                const linePath = [];
                roads.forEach(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });

                distanceUpdates[key] = { [priority] : distance};
                durationUpdates[key] = { [priority] : duration};
                polyLineUpdate.push({linePath, color : colors[index % 3], priority : priorities[0]})
            })
            setDays(prev => {
                const currentData = prev[selectedDay];
                // 이전 거리/시간 데이터를 복사
                const updatedDistance = { ...currentData.distance };
                const updatedDuration = { ...currentData.duration };

                // 모든 세그먼트(key)를 순회하며 업데이트
                Object.keys(distanceUpdates).forEach(key => {
                    updatedDistance[key] = {
                        ...(updatedDistance[key] || {}), // 기존 데이터 유지 (없으면 빈 객체)
                        ...distanceUpdates[key]      // 새 데이터 병합
                    };
                    updatedDuration[key] = {
                        ...(updatedDuration[key] || {}), // 기존 데이터 유지
                        ...durationUpdates[key]      // 새 데이터 병합
                    };
                    
                    // 🚨 문제 3 해결: duration 업데이트 시 distance 참조 오류 방지
                    // 위 로직은 distance/duration을 각각 독립적으로 업데이트하므로 안전합니다.
                });
                return {
                    ...prev,
                    [selectedDay]: {
                        ...currentData,
                        distance: updatedDistance,
                        duration: updatedDuration
                    }
                };
            });
            setPolyLine(prev => [
                ...prev,
                ...polyLineUpdate
            ])
        }
    }, [days, selectedDay])

    const resetData = useCallback(e => {
        setPolyLine([]);
    }, [])

    const selectType = useCallback(e => {
        const {name} = e.target;
        setSelectedType(prev => ({
            ...prev,
            [name] : !prev[name]
        }))
    }, [location])

    const addDays = useCallback(e=>{
        setDays(prev => ({
            ...prev,
            [Object.keys(prev).length + 1] : {
                markerIds : [],
                distance: {},
                duration: {},
                polyline: {
                    RECOMMEND : {},
                    TIME : {},
                    DISTANCE : {},
                },
            }   
        }));
        setSelectedDay(selectedDay+1);
    }, [days, selectedDay]);

    // polyline을 가져와서 사용하기 위한 Effect
    useEffect(() => {
        const cachedPolyline = days[selectedDay]?.polyline;
        // console.log(cachedPolyline)
        
        if (cachedPolyline) {
            let linesToRender = [];
            // 캐시된 days 데이터를 지도 렌더링용 polyLine 배열 형태로 변환
            ['RECOMMEND', 'TIME', 'DISTANCE'].forEach(priority => {
                const segmentMap = cachedPolyline[priority]; 
                if (segmentMap) {
                    Object.values(segmentMap).forEach(segment => {
                        linesToRender.push({
                            priority: priority,
                            linePath: segment.linePath
                        });
                    });
                }
            });
            
            setPolyLine(linesToRender); // ⭐️ 변환된 배열을 polyLine 상태에 저장 ⭐️
        } else {
            setPolyLine([]); 
        }
        
        // selectedDay나 days가 바뀔 때마다 실행되어 polyLine을 갱신합니다.
    }, [selectedDay, days, setPolyLine]);

    return (
        <>            
            <div className="map-wrapper">
                <Map
                className="map-info"
                center={center}
                level={3}
                onClick={(_, mouseEvent) => {
                    addMarker(mouseEvent.latLng);
                }}
                >

                {markerElements()}
                {polyLineElements()}
                </Map>
                <div className="marker-list">
                    <h4 className="text-center">Marker List</h4>
                    <div className="row day-line">
                        <div className="col d-flex add-day">
                            {Object.keys(days).map(dayKey => (
                                <button name={`${dayKey}`} className="btn btn-outline-secondary" key={dayKey}
                                    onClick={e=> setSelectedDay((e.target.name))}>
                                    {dayKey}
                                </button>
                            ))}
                            <button className="btn btn-outline-success" onClick={addDays}>
                                <FaPlus/>
                            </button>
                        </div>
                        <div className="row">
                            <div className="col text-center fs-4">
                                {selectedDay}Day
                            </div>
                        </div>
                    </div>
                    <DndProvider backend={HTML5Backend}>
                        <MarkerListSection
                            markerIds={days[selectedDay].markerIds}
                            distance={days[selectedDay].distance}
                            duration={days[selectedDay].duration}
                            markerData={markerData}
                            selectedDay={selectedDay}
                            selectedType={selectedType}
                            setDays={setDays}
                            setMarkerData={setMarkerData}
                            removeMarker={removeMarker}
                        />
                    </DndProvider>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-secondary" onClick={searchAllRoot}>테스트 조회용</button>
                    <button type="button" className="btn btn-secondary ms-1" name="RECOMMEND" onClick={selectType}>추천경로</button>
                    <button type="button" className="btn btn-secondary ms-1" name="TIME" onClick={selectType}>최단시간</button>
                    <button type="button" className="btn btn-secondary ms-1" name="DISTANCE" onClick={selectType}>최단길이</button>
                </div>
            </div>
        </>
    )
}