import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify";

export default function AccountDashboard(){

    const [accountList, setAccountList] = useState([])

    const loadData = useCallback(async () => {
        try {
            const { data } = await axios.post("/admin/list");
            setAccountList(data);
        } catch (error) {
            toast.error("데이터 로드 실패:", error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [])

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0 text-center">회원 정보 현황</h4>
                        </div>
                        <div className="card-body p-0">
                            {/* 테이블을 감싸는 div로 가로 스크롤 대비 */}
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 text-center align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>아이디</th>
                                            <th>닉네임</th>
                                            <th>등급</th>
                                            <th>연락처</th>
                                            <th>이메일</th>
                                            <th>만든 일정 수</th>
                                            <th>최대 일정 수</th>
                                            <th>가입일</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountList.length > 0 ? (
                                            accountList.map((account) => (
                                                <tr key={account.accountId}>
                                                    <td className="fw-bold text-primary">{account.accountId}</td>
                                                    <td>{account.accountNickname}</td>
                                                    <td>
                                                        <span className={`badge ${
                                                            account.accountLevel === '관리자' ? 'bg-danger' : 
                                                            account.accountLevel === '상담사' ? 'bg-success' : 'bg-secondary'
                                                        }`}>
                                                            {account.accountLevel}
                                                        </span>
                                                    </td>
                                                    <td>{account.accountContact}</td>
                                                    <td>{account.accountEmail || "-"}</td>
                                                    <td>{account.accountMadeSchedule}개</td>
                                                    <td>{account.accountMaxSchedule}개</td>
                                                    <td>{account.accountJoin ? account.accountJoin.split(' ')[0] : "-"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-5 text-muted">등록된 회원 정보가 없습니다.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}