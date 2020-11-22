import {API_URL, API_COUNTY} from "../Constants";
import axios from 'axios';

class ServiceApi{

    getAllResults(){
        return axios.get(API_URL);
    }

    getCountyStats(){
        return axios.get(API_COUNTY);
    }

}
export default new ServiceApi()