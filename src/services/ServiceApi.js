import {API_URL} from "../Constants";
import axios from 'axios';

class ServiceApi{

    getAllResults(){

        return axios.get("./dataset.json");
    }

}
export default new ServiceApi()