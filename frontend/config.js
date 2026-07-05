const API = import.meta.env.PROD
  ? 'https://aerth-intelligence-os.onrender.com/api'
  : 'http://localhost:5000/api';

const SOCKET_URL = import.meta.env.PROD
  ? 'https://aerth-intelligence-os.onrender.com'
  : 'http://localhost:5000';

export { API, SOCKET_URL };