import { Activity } from './../models/Activity';
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { history } from '../..';
import { store } from '../stores/store';

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

axios.defaults.baseURL = "http://localhost:5000/api";

axios.interceptors.response.use(async response => {
    await sleep(1000);
    return response;
}, (error: AxiosError) => {
    const {data, status, config} = error.response!;
    switch(status) {
        case 400:
            if(typeof data === "string") {
                toast.error(data);
            }
            if(config.method === "get" && data.errors.hasOwnProperty("id")) {
                history.push("/not-found")
            }
            if (data.errors) {
                const modalStateErrors = [];
                for(const key in data.errors) {
                    if (data.errors[key]) {
                        modalStateErrors.push(data.errors[key])
                    }
                }
                throw modalStateErrors.flat();
            } else {
                toast.error(data);
            }
            break;
        case 401:
            toast.error('unauthorised');
            break;
        case 404:
            history.push('/not-found')
            break;
        case 500:
            store.commonStore.setServerError(data);
            history.push("/server-error");
            break;
    }
    return Promise.reject(error);
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