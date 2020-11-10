import {API_URL} from "../Constants";
import axios from 'axios';

class ServiceApi{

    getAllResults(){

        return axios.get(API_URL);
    }

}
export default new ServiceApi()