import api from "../lib/api"
import authApi from "../lib/authApi"
import type { User } from "../types/index.types"



export const authService = {

    getUser:()=>{
        return authApi.get<User>('/auth/user')
    },

    refreshToken:()=>{
        return api.post('/auth/refresh')
    },
    logOut:()=>{
        return api.post('/auth/logout')
    },

}