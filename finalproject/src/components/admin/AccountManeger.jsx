import axios from "axios";
import { useCallback, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { PiTildeBold } from "react-icons/pi";

export default function AccountManager() {
    //state
    const [input, setInput] = useState({//입력용
        accountId : "",
        accountNickname: "",
        accountEmail : "",
        accountContact: "",
        accountBirth : "",
        minAccountPoint:"", maxAccountPoint:"",
        beginAccountJoin:"", endAccountJoin:"",
        accountAddress: "",
        accountLevelList: ["일반회원", "우수회원", "관리자"],
    });
    const [accountList, setAccountList] = useState([]);//결과 출력용

    //callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setInput(prev=>({
            ...prev , 
            [name] : value
        }));
    }, []);

    const sendData = useCallback(async ()=>{
        const {data} = await axios.post("/account/search", input);
        setAccountList(data);
    }, [input]);

    const changeAccountLevelList = useCallback(e=>{
        const value = e.target.value;//체크박스의 value를 불러온다

        // if(input에 있는 accountLevelList의 항목 중에 value가 포함되어 있다면) {
        if(input.accountLevelList.includes(value)) {
            //제거하고 다시 설정
            setInput(prev=>({
                ...prev,//기존 항목은 유지하고
                //accountLevelList: value가 아닌놈들만 찾아와 (= value를 지워)
                accountLevelList: prev.accountLevelList.filter(level=> level !== value)
            }));
        }
        else {
            //추가하고 다시 설정
            setInput(prev=>({
                ...prev,//기존 항목은 유지하고
                //accountLevelList는 기존 accountLevelList에 value를 추가!
                accountLevelList: [...prev.accountLevelList, value]
            }));
        }
    }, [input]);

    //render
    return (<>
        <h1>Account Manager</h1>
        <hr/>

        {/* 검색창 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" 
                        name="accountId" value={input.accountId} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">닉네임</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="accountNickname" 
                        value={input.accountNickname} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이메일</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="accountEmail" 
                        value={input.accountEmail} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">연락처</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="accountContact" 
                        value={input.accountContact} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">생년월일</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="accountBirth" 
                        value={input.accountBirth} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">포인트</label>
            <div className="col-sm-9 d-flex align-items-center">
                <input type="text" className="form-control" name="minAccountPoint" 
                        value={input.minAccountPoint} onChange={changeStrValue}/>
                <PiTildeBold className="mx-2 fs-1"/>
                <input type="text" className="form-control" name="maxAccountPoint" 
                        value={input.maxAccountPoint} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">가입일</label>
            <div className="col-sm-9 d-flex align-items-center">
                <input type="text" className="form-control" name="beginAccountJoin" 
                        value={input.beginAccountJoin} onChange={changeStrValue}/>
                <PiTildeBold className="mx-2 fs-1"/>
                <input type="text" className="form-control" name="endAccountJoin" 
                        value={input.endAccountJoin} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주소(지역)</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="accountAddress" 
                        value={input.accountAddress} onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">등급</label>
            <div className="col-sm-9">
                <div className="form-check">
                    <label className="form-check-label">
                        <input className="form-check-input" type="checkbox" value="일반회원" 
                                checked={input.accountLevelList.includes("일반회원")}
                                onChange={changeAccountLevelList} />
                        <span>일반회원</span>
                    </label>
                </div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input className="form-check-input" type="checkbox" value="우수회원"
                                checked={input.accountLevelList.includes("우수회원")} 
                                onChange={changeAccountLevelList} />
                        <span>우수회원</span>
                    </label>
                </div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input className="form-check-input" type="checkbox" value="관리자"
                                checked={input.accountLevelList.includes("관리자")}
                                onChange={changeAccountLevelList} />
                        <span>관리자</span>
                    </label>
                </div>
            </div>
        </div>
        <div className="row mt-4">
            <div className="col text-end">
                <button type="button" className="btn btn-success btn-lg" onClick={sendData}>
                    <FaMagnifyingGlass/>
                    <span className="ms-2">검색</span>
                </button>
            </div>
        </div>

        {/* 검색 결과 */}
        {accountList.map(account=>(
        <div className="row mt-4" key={account.accountId}>
            <div className="col">
                <div className="shadow p-4 rounded">
                    <h2>{account.accountId} 님의 정보</h2>
                    <ul className="list-group list-group-flush mt-4">
                        <li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">닉네임</span> {account.accountNickname}</li>
                        <li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">이메일</span> {account.accountEmail}</li>
                        {account.accountContact !== null && (<li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">연락처</span> {account.accountContact}</li>)}
                        {account.accountBirth !== null && (<li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">생년월일</span> {account.accountBirth}</li>)}
                        <li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">포인트</span> {account.accountPoint} point</li>
                        {account.accountAddress1 !== null && (<li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">주소</span> {account.accountAddress1} {account.accountAddress2}</li>)}
                        <li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">가입일</span> {account.accountJoin}</li>
                        <li className="list-group-item d-flex align-items-center"><span className="badge text-bg-primary me-4">등급</span>{account.accountLevel}</li>
                    </ul>
                </div>
            </div>
        </div>
        ))}
    </>)
}