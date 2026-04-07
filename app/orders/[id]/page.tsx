import type React from "react"
import OrderDetailsClientPage from "./client-page"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ params }) => {
  return <OrderDetailsClientPage params={params} />
}

export default OrderDetailsPage
