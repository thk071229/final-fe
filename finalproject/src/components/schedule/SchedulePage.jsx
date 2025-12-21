import { useParams } from "react-router-dom";
import Reply from "./Reply";
// import Review from "./Review";
import Schedule from "./Schedule";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import KakaoLoader from "../kakaomap/useKakaoLoader";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import { v4 as uuidv4 } from "uuid";
import { guestState, loginIdState } from "../../utils/jotai";



export default function SchedulePage() {
    KakaoLoader()

    const guest = useAtomValue(guestState);


    const accountId = useAtomValue(loginIdState);
    const [memberList, setMemberList] = useState([]);
    const [days, setDays] = useState({
        1: {
            markerIds: [],
            routes: {
                CAR: { RECOMMEND: [], TIME: [], DISTANCE: [] },
                WALK: { RECOMMEND: [], TIME: [], DISTANCE: [] }
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
    const [polyline, setPolyLine] = useState([]);
    const [selectedType, setSelectedType] = useState({
        RECOMMEND: true,
        TIME: false,
        DISTANCE: false
    })
    const [selectedSearch, setSelectedSearch] = useState("CAR")

    const copyUrl = useCallback(async () => {

        try {

            const { data } = await axios.get(`/schedule/share/${scheduleNo}`);
            console.log("shareKey", data);

            const url = `${window.location.origin}/share/${data}`;
            await navigator.clipboard.writeText(url);

            toast.success("링크 복사 완료")
        } catch (error) {
            toast.error('링크 생성 실패');
        }

    }, []);
    const [center, setCenter] = useState({
        lng: 126.9780,
        lat: 37.5665,
    })

    const [searchData, setSearchKeyword] = useState({
        query: ""
    })

    const [searchList, setSearchList] = useState([
        /*
        {
            addressName : "",
            categoryGroupName : "",
            phone : "",
            placeName : "",
            placeUrl : "",
            roadAddressName : "",
            x : "",
            y : ""
        }
        */
    ])

    const [tempMarker, setTempMarker] = useState([
        /*
        {
            x: double,
            y: double,
        }
         */
    ])
    const { scheduleNo } = useParams();
    const [scheduleDto, setScheduleDto] = useState({
        scheduleName: "",
        schedulePublic: false,
        scheduleState: "",
        scheduleNo: scheduleNo
    })

    const routeHistory = useRef({});

    useEffect(() => {
        console.log("SchedulePage params scheduleNo =", scheduleNo);
    }, [scheduleNo]);

    const PRIORITY_COLORS = {
        RECOMMEND: "#0052FF",
        TIME: "#FF2D2D",
        DISTANCE: "#00B050"
    };

    // Marker 추가
    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = { x: latlng.getLng(), y: latlng.getLat() };

        const { data } = await axios.post("/kakaoMap/getAddress", address);
        const addressName = data.documents.map(({ address, road_address }) => {
            if (road_address === null) return address.address_name;
            return road_address.building_name || road_address.road_name || road_address.address_name;
        });

        const currentDay = days[selectedDay] || { markerIds: [] };
        const markerNo = currentDay.markerIds.length + 1;

        setDays(prev => ({
            ...prev,
            [selectedDay]: {
                ...prev[selectedDay],
                markerIds: [...prev[selectedDay].markerIds, id],
            }
        }));

        setMarkerData(prev => ({
            ...prev,
            [id]: { no: markerNo, ...address, name: addressName[0], content: "" }
        }));
    }, [days, selectedDay]);

    const addTempMarker = useCallback((latlng) => {
        setTempMarker(prev => ([
            ...prev,
            {
                x: latlng.getLng(),
                y: latlng.getLat(),
            }
        ]))
    }, [])

    const addDays = useCallback(() => {
        const currentDayKeys = Object.keys(days).map(Number);
        const nextDay = currentDayKeys.length > 0 ? Math.max(...currentDayKeys) + 1 : 1;

        setDays(prev => ({
            ...prev,
            [nextDay]: {
                markerIds: [],
                routes: {
                    CAR: { RECOMMEND: [], TIME: [], DISTANCE: [] },
                    WALK: { RECOMMEND: [], TIME: [], DISTANCE: [] }
                }
            }
        }));
        setSelectedDay(nextDay);
    }, [days]);

    const removeMarker = useCallback((dayKey, id) => {
        setDays(prevDays => {
            const targetDay = prevDays[dayKey];
            if (!targetDay) return prevDays;

            const updatedMarkerIds = targetDay.markerIds.filter(markerId => markerId !== id);

            // 모든 타입(CAR, WALK)과 모든 우선순위에서 해당 마커 관련 경로 제거
            const updatedRoutes = { ...targetDay.routes };
            ["CAR", "WALK"].forEach(mode => {
                ["RECOMMEND", "TIME", "DISTANCE"].forEach(priority => {
                    if (updatedRoutes[mode] && updatedRoutes[mode][priority]) {
                        updatedRoutes[mode][priority] = updatedRoutes[mode][priority].filter(route =>
                            !route.routeKey.startsWith(id + '##') && !route.routeKey.endsWith('##' + id)
                        );
                    }
                });
            });

            return {
                ...prevDays,
                [dayKey]: {
                    ...targetDay,
                    markerIds: updatedMarkerIds,
                    routes: updatedRoutes,
                },
            };
        });

        setMarkerData(prevMarkerData => {
            const updatedMarkerData = { ...prevMarkerData };
            delete updatedMarkerData[id];
            const currentMarkerIds = days[dayKey]?.markerIds.filter(mId => mId !== id) || [];
            currentMarkerIds.forEach((mId, index) => {
                if (updatedMarkerData[mId]) {
                    updatedMarkerData[mId] = { ...updatedMarkerData[mId], no: index + 1 };
                }
            });
            return updatedMarkerData;
        });
    }, [days]);

    const markerElements = useCallback(() => {
        const currentDayData = days[selectedDay];

        // 해당 날짜 데이터나 markerIds가 없으면 아무것도 그리지 않음
        if (!currentDayData || !currentDayData.markerIds) {
            return null;
        }
        return (currentDayData.markerIds?.map(id => (
            <MapMarker
                key={id}
                position={{ lng: markerData[id].x, lat: markerData[id].y }}
                image={
                    {
                        src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
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
                                y: (markerData[id].no - 1) * 46 + 10
                            },
                            spriteSize: {
                                width: 36,
                                height: 691
                            }
                        }

                    }
                }
            />
        )));
    }, [markerData, selectedDay, days]);

    const tempMarkerElements = useCallback(() => {
        const handleMarkerClick = (clickedMarker) => {
            // 1. addMarker 함수 호출을 위한 customLatLng 객체 생성
            const customLatLng = {
                getLat: () => parseFloat(clickedMarker.y),
                getLng: () => parseFloat(clickedMarker.x)
            };

            // 2. tempMarker 목록에서 클릭된 마커를 제거
            setTempMarker(prevTempMarkers => {
                // 클릭된 마커(clickedMarker)와 x, y 좌표가 모두 일치하지 않는
                // 마커들만 필터링하여 새로운 배열을 만듭니다.
                const newTempMarkers = prevTempMarkers.filter(
                    (marker) => !(marker.x === clickedMarker.x && marker.y === clickedMarker.y)
                );
                return newTempMarkers;
            });

            // 3. addMarker 함수 호출 (주요 로직 수행)
            return addMarker(customLatLng);
        };
        return (tempMarker?.map((marker, index) => (
            <MapMarker
                key={index}
                position={{ lng: marker.x, lat: marker.y }}
                onClick={() => handleMarkerClick(marker)}
            />
        )));
    }, [tempMarker, addMarker]);

    const polylineElements = useCallback(() => {
        const currentDayRoutes = days[selectedDay]?.routes;
        if (!currentDayRoutes || !currentDayRoutes[selectedSearch]) return null;

        const modeRoutes = currentDayRoutes[selectedSearch];

        return Object.keys(selectedType).map(priority => {
            if (selectedType[priority] && modeRoutes[priority]) {
                return modeRoutes[priority].map((segment, idx) => (
                    <Polyline
                        key={`${priority}-${idx}`}
                        path={segment.linepath}
                        strokeWeight={5}
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                        strokeColor={PRIORITY_COLORS[priority]}
                        zIndex={10}
                    />
                ));
            }
            return null;
        });
    }, [days, selectedDay, selectedSearch, selectedType]);

    const parseVertexes = (roads) => {
        const linepath = [];
        roads.forEach(({ vertexes }) => {
            for (let i = 0; i < vertexes.length; i += 2) {
                linepath.push({ lng: vertexes[i], lat: vertexes[i + 1] });
            }
        });
        return linepath;
    }

    const searchAllRoot = useCallback(async (day = null) => {
        const targetDayKeys = day ? [day] : Object.keys(days);
        const validDayKeys = targetDayKeys.filter(key => days[key]?.markerIds.length >= 2);

        if (validDayKeys.length === 0) return;

        const mode = selectedSearch;
        const activePriorities = Object.keys(selectedType).filter(key => selectedType[key] === true);
        if (activePriorities.length === 0) return;

        const requests = [];
        const cachedUpdates = []; // 캐시에서 찾은 데이터를 임시 보관

        validDayKeys.forEach(dayKey => {
            const markerIds = days[dayKey].markerIds;
            const currentOrderKey = markerIds.join(","); // 마커 ID 순서를 문자열로 변환 (캐시 키)
            const markerValues = markerIds.map(id => markerData[id]);
            console.log(`[검색 시도] 일자: ${dayKey}, 순서: ${currentOrderKey}`);

            activePriorities.forEach(priority => {
                const cacheKey = `${dayKey}-${mode}-${priority}`;

                // 1. 캐시 확인: 해당 날짜/모드/우선순위에 동일한 마커 순서의 기록이 있는지 확인
                if (routeHistory.current[cacheKey] && routeHistory.current[cacheKey][currentOrderKey]) {
                    console.log(`%c[캐시 적중] ${cacheKey} - 기존 데이터를 불러옵니다.`, "color: #4CAF50; font-weight: bold");
                    cachedUpdates.push({
                        dayKey, mode, priority,
                        data: routeHistory.current[cacheKey][currentOrderKey]
                    });
                } else {
                    // 2. 캐시에 없으면 API 요청 목록에 추가
                    console.log(`%c[캐시 실패] ${cacheKey} - 서버에 새로 요청합니다.`, "color: #FF9800; font-weight: bold");
                    const baseUrl = mode === "CAR"
                        ? (markerIds.length === 2 ? "/kakaoMap/search" : "/kakaoMap/searchAll")
                        : "/kakaoMap/searchForWalk";

                    requests.push({
                        dayKey, mode, priority, currentOrderKey, // 나중에 캐시에 저장하기 위해 orderKey 포함
                        promise: axios.post(`${baseUrl}?priority=${priority}`, markerValues)
                    });
                }
            });
        });

        // 모든 데이터가 캐시에 있다면 API 호출 없이 상태 업데이트 후 종료
        if (requests.length === 0 && cachedUpdates.length > 0) {
            setDays(prev => {
                const nextDays = { ...prev };
                cachedUpdates.forEach(({ dayKey, mode, priority, data }) => {
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};
                    nextDays[dayKey].routes[mode][priority] = data;
                });
                return nextDays;
            });
            return;
        }

        try {
            // API 요청 실행
            const responses = await Promise.all(requests.map(r => r.promise));

            setDays(prev => {
                const nextDays = { ...prev };

                // A. 캐시에서 가져온 데이터 먼저 적용
                cachedUpdates.forEach(({ dayKey, mode, priority, data }) => {
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};
                    nextDays[dayKey].routes[mode][priority] = data;
                });

                // B. API로 새로 받은 데이터 적용 및 캐시 저장
                responses.forEach((res, index) => {
                    const { dayKey, mode, priority, currentOrderKey } = requests[index];
                    const data = res.data;
                    const currentMarkerIds = nextDays[dayKey].markerIds;

                    if (!nextDays[dayKey].routes) nextDays[dayKey].routes = { CAR: {}, WALK: {} };
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};

                    const routeSegments = [];
                    if (mode === "CAR") {
                        const { sections } = data.routes[0];
                        sections.forEach((section, idx) => {
                            routeSegments.push({
                                routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                                distance: section.distance,
                                duration: section.duration,
                                linepath: parseVertexes(section.roads),
                            });
                        });
                    } else {
                        data.distance.forEach((dist, idx) => {
                            routeSegments.push({
                                routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                                distance: dist,
                                duration: data.duration[idx],
                                linepath: data.linepath[idx],
                            });
                        });
                    }

                    // 특정 모드/우선순위 결과 업데이트
                    nextDays[dayKey].routes[mode][priority] = routeSegments;

                    // [핵심] 결과를 히스토리에 저장하여 다음번에 재사용
                    const cacheKey = `${dayKey}-${mode}-${priority}`;
                    if (!routeHistory.current[cacheKey]) routeHistory.current[cacheKey] = {};
                    routeHistory.current[cacheKey][currentOrderKey] = routeSegments;
                    console.log(`[캐시 저장] ${cacheKey}의 결과를 히스토리에 기록했습니다.`);
                });

                return nextDays;
            });
        } catch (err) {
            toast.error("경로 검색 중 오류가 발생했습니다.");
            console.error(err);
        }
    }, [days, markerData, selectedSearch, selectedType]);
    // 주소 검색
    const addMarkerForSearch = useCallback(async () => {
        setSearchList([]);
        const { data } = await axios.post("/kakaoMap/searchAddress", searchData);
        // const {documents} = data;
        // console.log(data);
        data.map(element => {

            setSearchList(prev => ([
                ...prev,
                {
                    addressName: element.address_name,
                    categoryGroupName: element.category_group_name,
                    phone: element.phone,
                    placeName: element.place_name,
                    placeUrl: element.place_url,
                    roadAddressName: element.road_address_name,
                    x: element.x,
                    y: element.y
                }
            ]))
        })
    }, [searchData]);

    const selectType = useCallback(e => {
        const { name } = e.target;
        setSelectedType(() => ({
            [name]: true
        }))
    }, [])

    const selectSearch = useCallback(e => {
        const { name } = e.target;
        setSelectedSearch(name)
    }, [])

    const sendData = useCallback(async () => {
        const payload = {
            data: {
                days: days,
                markerData: markerData
            },
            scheduleDto: {
                ...scheduleDto,
                schedulePublic: scheduleDto.schedulePublic ? "Y" : "N"
            }
        };
        const { data } = await axios.post("/kakaoMap/insertData", payload)
        console.log(data);
        setScheduleDto(prev => ({
            ...prev,
            scheduleName: data.scheduleName,
            scheduleState: data.scheduleState,
            schedulePublic: data.schedulePublic === "Y"
        }));
    }, [days, markerData, scheduleDto])

    const loadData = useCallback(async () => {
        console.log("loadData called with scheduleNo =", scheduleNo);

        if (!scheduleNo) return;

        try {
            const response = await axios.post(`/schedule/detail`, scheduleDto);
            const wrapper = response.data; // ScheduleInsertDataWrapperVO 객체

            // 1. 일정 상세 데이터 (days, markerData) 처리
            if (wrapper.data && wrapper.data.days && Object.keys(wrapper.data.days).length > 0) {
                const loadedDays = wrapper.data.days;
                setDays(loadedDays);
                setMarkerData(wrapper.data.markerData);

                // [캐시 추가 로직] DB에서 가져온 경로 데이터를 히스토리에 등록
                Object.keys(loadedDays).forEach(dayKey => {
                    const dayObj = loadedDays[dayKey];
                    const markerIds = dayObj.markerIds;

                    // 마커가 2개 미만이면 경로가 없으므로 스킵
                    if (!markerIds || markerIds.length < 2) return;

                    const currentOrderKey = markerIds.join(","); // 현재 순서 지문
                    const routesMap = dayObj.routes; // { CAR: { RECOMMEND: [...] }, WALK: {...} }

                    if (routesMap) {
                        Object.keys(routesMap).forEach(mode => {
                            const priorities = routesMap[mode];
                            Object.keys(priorities).forEach(priority => {
                                const routeSegments = priorities[priority];

                                // 데이터가 존재하는 경우에만 캐시에 저장
                                if (routeSegments && routeSegments.length > 0) {
                                    const cacheKey = `${dayKey}-${mode}-${priority}`;

                                    if (!routeHistory.current[cacheKey]) {
                                        routeHistory.current[cacheKey] = {};
                                    }

                                    // 이 순서(OrderKey)에 대한 경로 데이터를 기억함
                                    routeHistory.current[cacheKey][currentOrderKey] = routeSegments;

                                    console.log(`%c[DB 캐시 등록] ${cacheKey}`, "color: #3498db; font-weight: bold", currentOrderKey);
                                }
                            });
                        });
                    }
                });
            }

            // 2. 일정 기본 정보 (scheduleDto) 처리
            if (wrapper.scheduleDto) {
                setScheduleDto({
                    ...wrapper.scheduleDto,
                    schedulePublic: wrapper.scheduleDto.schedulePublic === "Y"
                });
            }
        } catch (error) {
            console.error("데이터 로드 중 오류 발생:", error);
            toast.error("일정을 불러오는 데 실패했습니다.");
        }
    }, [scheduleNo, scheduleDto]); // scheduleDto 추가 (보통 axios 호출 시 사용하므로)

    // polyline을 가져와서 사용하기 위한 Effect
    useEffect(() => {
        const modeRoutes = days[selectedDay]?.routes?.[selectedSearch];
        if (!modeRoutes) {
            setPolyLine([]);
            return;
        }

        const activeLines = [];
        Object.keys(selectedType).forEach(priority => {
            if (selectedType[priority] && modeRoutes[priority]) {
                modeRoutes[priority].forEach(seg => {
                    activeLines.push({ ...seg, priority, type: selectedSearch });
                });
            }
        });
        setPolyLine(activeLines);
    }, [selectedDay, days, selectedSearch, selectedType]);

    useEffect(() => {

        async function loadMember() {
            const { data } = await axios.get(`/schedule/memberList/${scheduleNo}`);
            setMemberList(data);
            console.log("데이터확인 =", data);
        }

        loadMember();
    }, [scheduleNo]);

    useEffect(() => {
        if (!scheduleNo) return; // 안전장치
        console.log("번호확인", scheduleNo);
        loadData();
    }, [scheduleNo]);

    useEffect(() => {
        const currentDayMarkers = days[selectedDay]?.markerIds || [];

        if (currentDayMarkers.length >= 2) {
            console.log("자동 검색 시작");
            searchAllRoot(selectedDay);
        }
    }, [selectedSearch, selectedType, selectedDay]);

    const currentDayData = days[selectedDay] || { markerIds: [], routes: [] }; // 데이터가 없으면 빈 배열 반환

    const outletContext = {
        days,
        markerIds: currentDayData.markerIds,
        routes: currentDayData.routes,
        markerData,
        selectedDay,
        center,
        searchData,
        searchList,
        tempMarker,
        polyline,
        accountId,
        memberList,
        scheduleNo,
        selectedSearch,
        selectedType,
        setDays,
        setMarkerData,
        removeMarker,
        setCenter,
        setSearchKeyword,
        setSearchList,
        setTempMarker,
        setSelectedDay,
        setSelectedType,
        setSelectedSearch,
        setPolyLine,
        copyUrl,
        addMarker,
        addDays,
        searchAllRoot,
        addMarkerForSearch,
        addTempMarker,
        selectType,
        selectSearch,
        sendData,
        scheduleDto
    };

    return (
        <>
            <div className="container">
                <div className=" map-area">
                    <div className="schedule-list">

                        {/* 1. SchedulePage에서 Schedule 컴포넌트 렌더링 */}
                        {/* SchedulePage의 상태와 함수를 Schedule 컴포넌트로 전달 */}
                        <Schedule
                            copyUrl={copyUrl}
                            memberList={memberList}
                            outletContext={outletContext} // context를 Schedule로 전달
                        />

                    </div>
                    <div className="d-flex detail-box justify-content-center align-items-center">
                        <button type="button"
                            className="btn btn-secondary"
                            onClick={() => setScheduleDto(prev => ({ ...prev, schedulePublic: !prev.schedulePublic }))}>
                            <span>
                                {scheduleDto.schedulePublic ? "공개" : "비공개"}
                            </span>
                        </button>
                        <div className="d-flex justify-content-center align-items-center box ms-2">
                            <span>참여자 : </span>
                            {memberList.map((member) => (
                                <span className="ms-1" key={member}>{member.scheduleMemberNickname}</span>
                            ))}
                        </div>

                        {guest || (
                            <div className="d-flex justify-content-center align-items-center box ms-2"
                                onClick={copyUrl}>
                                <FaLink /><span className="ms-1 point">일정 공유하기</span>
                            </div>
                        )}
                    </div>
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
                            {tempMarkerElements()}
                            {polylineElements()}
                        </Map>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col">
                            <Reply />
                            {/* <Review/> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
