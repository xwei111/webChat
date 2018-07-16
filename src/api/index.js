import axios from 'axios';
const baseURL = process.env.API_HOST;

export function register(user,pass) {
    return axios.get(`${baseURL}/register?user=${user}&pass=${pass}`)
        .then((data)=>data.data)
}

export function login(user,pass) {
    return axios.get(`${baseURL}/login?user=${user}&pass=${pass}`)
        .then((data)=>data.data)
}

export function getEmoticon(){
    return axios.get(`${baseURL}/getEmoticon`)
        .then((data)=>data.data)
}

export function searchChatcontent(){
    return axios.get(`${baseURL}/searchChatcontent`)
    .then((data)=>data.data)
}