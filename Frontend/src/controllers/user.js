import axios from "axios";


export const connectToBackend = async () => {
    let response;
    try {
        response = await axios.get(`http://localhost:3000/`);
        return response.data;     
    } catch (error) {
        throw error.response?.data || error.message;
    }
}