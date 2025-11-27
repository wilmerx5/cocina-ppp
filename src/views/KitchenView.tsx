import React from 'react'
import { useOrderStore } from '../stores/orderStore'

function KitchenView() {

    const {orders}= useOrderStore()
  return (
    <div>
        {orders.length>0?
        orders.map(el=> <div key={el.orderId}>
            <p> {el.phone}</p>
        </div>)
        :'no hay ordenes'}
    </div>
  )
}

export default KitchenView