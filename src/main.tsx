import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// (no StrictMode: it runs every game's intro twice in development)
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
