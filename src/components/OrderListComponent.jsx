import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { handleAxiosError } from '../configs/HandleAxiosError';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, ORDER } from '../configs/host-config';

const OrderListComponent = () => {
  const [orderList, setOrderList] = useState([]);
  const { onLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const cancelOrder = async (id) => {
    if (!confirm('정말 취소하시겠습니까?')) return;
    try {
      const res = await axiosInstance.patch(`${API_BASE_URL}${ORDER}/${id}`);
      // 주문 취소를 백엔드로 요청하고, 문제가 없었다면 주문 목록을 다시 렌더링.
      setOrderList((prevList) => {
        return prevList.map((order) =>
          order.id === id ? { ...order, orderStatus: 'CANCELED' } : order,
        );
        // const cancelOrder = prevList.find((order) => order.id === id);
        // cancelOrder.orderStatus = 'CANCELED';
        // const filtered = prevList.filter((order) => order.id !== id);
        // return [...filtered, cancelOrder];
      });
    } catch (e) {
      handleAxiosError(e, onLogout, navigate);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get(`${API_BASE_URL}${ORDER}/my-order`);
        setOrderList(res.data.result);
      } catch (e) {
        console.log(e);
        handleAxiosError(e, onLogout, navigate);
      }
    };

    fetchOrders();
  }, []);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>회원 EMAIL</TableCell>
            <TableCell>주문상태</TableCell>
            <TableCell>액션</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderList.map((order) => (
            <React.Fragment key={order.id}>
              <TableRow>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.userEmail}</TableCell>
                <TableCell>
                  {order.orderStatus === 'ORDERED'
                    ? '주문 완료'
                    : '주문 취소됨'}
                </TableCell>
                <TableCell>
                  {order.orderStatus === 'ORDERED' && (
                    <Button
                      color='secondary'
                      size='small'
                      onClick={() => cancelOrder(order.id)}
                    >
                      CANCEL
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {/* 확장된 행 (주문 세부 사항) */}
              <TableRow>
                <TableCell colSpan={4}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        주문 세부 사항 (클릭 시 열립니다!)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ul>
                        {order.orderDetails.map((orderItem) => (
                          <li key={orderItem.id}>
                            {orderItem.productName} - {orderItem.count} 개
                          </li>
                        ))}
                      </ul>
                    </AccordionDetails>
                  </Accordion>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderListComponent;
