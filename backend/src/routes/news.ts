import { Router} from 'express';
import axios from 'axios';

const router = Router();
const APITUBE_BASE_URL = 'https://api.apitube.io/v1/news'; 
const API_KEY = 'api_live_2G6RS6f3YmHDRzAnTSc9LktF0yIDiHzmnd5VBsj9pDNhnEs0D9omM2bucLkl'; // Replace with your actual API key

//news endpoints
router.get('gaming', async (req, res) => {
    try {
        const { pageSize = '10', page = '1' } = req.query;
        console.log('Fetching gaming news with pageSize:', {pageSize, page});
        console.log('APITUBE key:', API_KEY);

        const response = await axios.get(`${APITUBE_BASE_URL}/gaming`, {
            params: {
                apiKey: API_KEY,
                pageSize,
                page,
            },
        });