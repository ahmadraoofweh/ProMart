// app/order-success/layout.js
export default function OrderLayout({ children }) {
  return <section>{children}</section>; // If children is missing, the page won't render
}