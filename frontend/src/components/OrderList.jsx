/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import axios from "axios"
function OrderList() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axios.get('/api/orders').then(response => {
            setOrders(response.data);
        });
    }, []);

    const generateInvoice = (orderId) => {
        axios.get(`/api/orders/${orderId}/invoice`, { responseType: 'blob' }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        });
    };
    console.log(orders);
    return (
        <div>
            <h1>Orders</h1>
            <ul>
                {orders.map(order => (
                    <li key={order._id}>
                        {order.customerName} - ${order.totalAmount}
                        <button onClick={() => generateInvoice(order._id)}>Generate Invoice</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default OrderList
