import { Activity } from './../models/Activity';
import axios, { AxiosResponse } from "axios";

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

axios.defaults.baseURL = "http://localhost:5000/api";

axios.interceptors.response.use(async response => {
    try {
        await sleep(1000);
        return response;
    } catch (err) {
        console.log(err);
        return await Promise.reject(err);
    }
})

const resBody = <T> (res: AxiosResponse<T>) => res.data;

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(resBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(resBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(resBody),
    delete: <T> (url: string) => axios.delete<T>(url).then(resBody) 
}

const Activities = {
    list: () => requests.get<Activity[]>("/activities"),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (a: Activity) => axios.post(`/activities`, a),
    update: (a: Activity) => axios.put(`/activities/${a.id}`, a),
    delete: (id: string) => axios.delete(`/activities/${id}`)
}

const agent = {
    Activities
}

export default agent;