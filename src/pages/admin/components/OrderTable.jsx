export default function OrderTable({ orders, onUpdate }) {
  return (
    <div className="admin-order-table">
      <div className="admin-table-head">
        <span>Order</span>
        <span>Customer</span>
        <span>Date</span>
        <span>Total</span>
        <span>Status</span>
      </div>
      {orders.map((order) => (
        <div className="admin-table-row" key={order.id}>
          <strong>{order.id}</strong>
          <span>{order.customer}</span>
          <span className="admin-muted">{order.date}</span>
          <strong>${order.total.toFixed(2)}</strong>
          <select
            className={`status-select ${order.status.toLowerCase()}`}
            value={order.status}
            onChange={(event) => onUpdate(order.id, event.target.value)}
          >
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}
