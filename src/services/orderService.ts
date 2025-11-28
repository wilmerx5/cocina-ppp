import { isAxiosError } from "axios";
import api from "../lib/api";
import type { CreateOrder, Order, PreOrderItem, UpdateOrder } from "../types/index.types";



export default{

    getDailyOrders: async()=>{
        try{
            const {data}= await api.get('/orders/daily')

            console.log(data)
            return data
        }
        catch(e){
            if (isAxiosError(e) && e.response){
                throw new Error(e.response.data.message)
            }
            
            throw new Error("Error desconocido"+e)
        }
    },
     updateOrderGeneralInfo: async({orderId, info}:{orderId:Order['orderId'],info:UpdateOrder})=>{
        try{

            const {data}= await api.patch(`/orders/${orderId}/info`,
                info
            )

            console.log(data)
            return data
        }
        catch(e){
            if (isAxiosError(e) && e.response){
                throw new Error(e.response.data.message)
            }
            
            throw new Error("Error desconocido"+e)
        }
    },
}