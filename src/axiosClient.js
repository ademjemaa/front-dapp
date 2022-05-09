import axios from 'axios';

const axiosClient = axios.create({
	baseURL: 'https://api.staking.loftsclub.com/api/',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
})

export default axiosClient;