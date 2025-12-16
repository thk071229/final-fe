import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import "./KakaoPay.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { numberWithComma } from "../../utils/format";

export default function KakaoPay() {

    const [shopList, setShopList] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const changeCheckAll = useCallback(e => {
        setCheckAll(e.target.checked);
        setShopList(prev =>
            prev.map(
                shop => ({
                    ...shop,
                    check: e.target.checked,
                })
            )
        );
    }, []);

    const checkedShopList = useMemo(() => {
        return shopList.filter(shop => shop.check === true);
    }, [shopList]);

    const checkedTotal = useMemo(() => {
        return checkedShopList.reduce(
            (total, shop) => total + (shop.shopPrice * shop.qty),
            0
        );
    }, [checkedShopList]);

    const loadData = useCallback(async () => {
        const { data } = await axios.get("/shop/");

        const convert = data.map(g => ({
            ...g,
            check: false,
            qty: 1
        }));
        setShopList(convert);
    }, []);

    const changeShopCheck = useCallback(e => {
        const { value, checked } = e.target;

        const convert = shopList.map(shop => {
            if (shop.shopNo === parseInt(value)) {
                return { ...shop, check: checked };
            }
            return shop;
        });

        const count = convert.filter(shop => shop.check === true).length;

        setShopList(convert);
        setCheckAll(convert.length === count);
    }, [shopList]);

    const changeShopQty = useCallback(e => {
        const shopNo = e.target.dataset.pk;
        const value = e.target.value;

        const convert = shopList.map(shop => {
            if (shop.shopNo === parseInt(shopNo)) {
                return { ...shop, qty: parseInt(value) };
            }
            return shop;
        });

        setShopList(convert);
    }, [shopList]);

    const changeShopQty2 = useCallback((e, obj) => {
        const convert = shopList.map(shop => {
            if (shop.shopNo === obj.shopNo) {
                const number = parseInt(e.target.value);
                return { ...shop, qty: Number.isNaN(number) ? 0 : number };
            }
            return shop;
        });
        setShopList(convert);
    }, [shopList]);

    const navigate = useNavigate();
    const purchase = useCallback(async () => {

        const convertList = checkedShopList.map(shop => ({
            no: shop.shopNo,
            qty: shop.qty
        }));

        const { data } = await axios.post("/kakaopay/buy", convertList);

        navigate(data.next_redirect_pc_url);

    }, [checkedShopList]);

    return (<>

        <div
            className="fade-jumbotron"
            style={{ animationDelay: `${0.03}s` }}
        >
            <Jumbotron subject="카카오페이 결제" detail="무엇을 살지 정해야 함" />
        </div>

        <div
            className="fade-link"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="row my-4">
                <div className="col-6 text-center">
                    <Link to="/kakaopay/pay/info" className="none-decortion">결제 내역 보기</Link>
                </div>
                <div className="col-6 text-center">
                    <Link to="/" className="none-decortion">홈</Link>
                </div>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <div className="text-nowrap table-responsive">
                    <div
                        className="fade-item"
                        style={{ animationDelay: `${0.03}s` }}
                    >
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox"
                                            checked={checkAll}
                                            onChange={changeCheckAll} />
                                    </th>
                                    <th>이름</th>
                                    <th>금액</th>
                                    <th>증가량</th>
                                    <th width="100">수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shopList.map((shop) => (
                                    <tr key={shop.shopNo}>
                                        <td className="checkbox-cell">
                                            <input type="checkbox" value={shop.shopNo}
                                                checked={shop.check} onChange={changeShopCheck} />
                                        </td>
                                        <td className="checkbox-cell">
                                            {shop.shopName}
                                        </td>
                                        <td className="checkbox-cell">
                                            {numberWithComma(shop.shopPrice)}원
                                        </td>
                                        <td className="checkbox-cell">
                                            {numberWithComma(shop.shopValue)}회
                                        </td>
                                        <td className="checkbox-cell">
                                            <input type="number" inputMode="numeric"
                                                className="form-control" min={1}
                                                value={numberWithComma(shop.qty)}
                                                disabled={shop.check === false}
                                                onChange={e => changeShopQty2(e, shop)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div
            className="fade-label"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="row mt-4">
                <div className="col fs-2">
                    {numberWithComma(checkedShopList.length)}개의 상품권
                </div>
                <div className="col text-end fs-2">
                    금액:{numberWithComma(checkedTotal)}원
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-lg btn-outline-success" onClick={purchase}
                        disabled={checkedShopList.length === 0}>구매</button>
                </div>
            </div>
        </div>
    </>)
}