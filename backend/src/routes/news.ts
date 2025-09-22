import { Router} from 'express';
import axios from 'axios';

const router = Router();
const APITUBE_BASE_URL = 'https://api.apitube.io/v1/news'; 
const API_KEY = 'api_live_2G6RS6f3YmHDRzAnTSc9LktF0yIDiHzmnd5VBsj9pDNhnEs0D9omM2bucLkl'; // Replace with your actual API key