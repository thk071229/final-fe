import { useCallback, useEffect, useMemo, useState } from "react";
import "./KakaoPay.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { numberWithComma } from "../../utils/format";

export default function KakaoPay() {

    /* =======================
       화면 크기 감지
    ======================= */
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = width < 768;

    /* =======================
       상태
    ======================= */
    const [shopList, setShopList] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const { data } = await axios.get("/shop/");
        setShopList(
            data.map(item => ({
                ...item,
                check: false,
                qty: 1
            }))
        );
    }, []);

    /* =======================
       체크 로직
    ======================= */
    const changeCheckAll = useCallback(e => {
        const checked = e.target.checked;
        setCheckAll(checked);
        setShopList(prev =>
            prev.map(shop => ({ ...shop, check: checked }))
        );
    }, []);

    const changeShopCheck = useCallback(e => {
        const { value, checked } = e.target;
        const next = shopList.map(shop =>
            shop.shopNo === Number(value)
                ? { ...shop, check: checked }
                : shop
        );

        setShopList(next);
        setCheckAll(next.every(shop => shop.check));
    }, [shopList]);

    const changeShopQty = useCallback((e, shop) => {
        const qty = parseInt(e.target.value);
        setShopList(prev =>
            prev.map(s =>
                s.shopNo === shop.shopNo
                    ? { ...s, qty: Number.isNaN(qty) ? 0 : qty }
                    : s
            )
        );
    }, []);

    /* =======================
       계산
    ======================= */
    const checkedShopList = useMemo(
        () => shopList.filter(shop => shop.check),
        [shopList]
    );

    const checkedTotal = useMemo(
        () =>
            checkedShopList.reduce(
                (sum, shop) => sum + shop.shopPrice * shop.qty,
                0
            ),
        [checkedShopList]
    );

    /* =======================
       결제
    ======================= */
    const navigate = useNavigate();

    const purchase = useCallback(async () => {
        const payload = checkedShopList.map(shop => ({
            no: shop.shopNo,
            qty: shop.qty
        }));

        const { data } = await axios.post("/kakaopay/buy", payload);
        navigate(data.next_redirect_pc_url);
    }, [checkedShopList, navigate]);

    /* =======================
       렌더
    ======================= */
    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <h3 className="text-center">일정 최대 개수 증가를 구매하세요</h3>
                    <p className="text-center text-desc">
                        일정 최대 개수를 증가시켜서 더욱 쾌적하게 즐기세요.
                    </p>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    {isMobile ? (
                        /* =======================
                           모바일: 테이블
                        ======================= */
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={checkAll}
                                            onChange={changeCheckAll}
                                        />
                                    </th>
                                    <th>이름</th>
                                    <th>금액</th>
                                    <th>증가량</th>
                                    <th width="100">수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shopList.map((shop, index) => (
                                    <tr key={shop.shopNo} className={`bg-card-${index % 3}`}>
                                        <td className="checkbox-cell">
                                            <input
                                                type="checkbox"
                                                value={shop.shopNo}
                                                checked={shop.check}
                                                onChange={changeShopCheck}
                                            />
                                        </td>
                                        <td className="checkbox-cell">{shop.shopName}</td>
                                        <td className="checkbox-cell">{numberWithComma(shop.shopPrice)}원</td>
                                        <td className="checkbox-cell">{numberWithComma(shop.shopValue)}회</td>
                                        <td className="checkbox-cell">
                                            <input
                                                type="number"
                                                className="form-control"
                                                min={1}
                                                value={shop.qty}
                                                disabled={!shop.check}
                                                onChange={e => changeShopQty(e, shop)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        /* =======================
                           데스크톱: 카드
                        ======================= */
                        <div className="row justify-content-center mx-5 g-2">
                            <div className="col-12 text-center mb-2">
                                <label className="d-inline-flex align-items-center gap-1 fw-semibold">
                                    <input
                                        type="checkbox"
                                        checked={checkAll}
                                        onChange={changeCheckAll}
                                    />
                                    모두 구매
                                </label>
                            </div>

                            {shopList.map((shop, index) => (
                                <div
                                    key={shop.shopNo}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                >
                                    <div className={`shadow rounded-4 p-4 h-100 bg-card-${index % 3}`}>
                                        <p className="text-center fw-semibold">
                                            <input
                                                type="checkbox"
                                                value={shop.shopNo}
                                                checked={shop.check}
                                                onChange={changeShopCheck}
                                                className="me-2"
                                            />
                                            {numberWithComma(shop.shopValue)}회 증가
                                        </p>

                                        <p className="text-center">
                                            {shop.shopDesc}
                                        </p>

                                        <p className="text-center">
                                            {numberWithComma(shop.shopPrice)}원
                                        </p>

                                        <div className="d-flex justify-content-center">
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                style={{ width: "60px" }}
                                                min={1}
                                                value={shop.qty}
                                                disabled={!shop.check}
                                                onChange={e => changeShopQty(e, shop)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="row mt-4">
                <h5 className="col text-start">
                    {checkedShopList.length}개의 상품권
                </h5>
                <h5 className="col text-end">
                    금액: {numberWithComma(checkedTotal)}원
                </h5>
            </div>

            <div className="row mt-4">
                <div className="col text-center">
                    <button
                        className="btn btn-lg btn-outline-success"
                        onClick={purchase}
                        disabled={checkedShopList.length === 0}
                    >
                        구매
                    </button>
                </div>
            </div>
        </>
    );
}