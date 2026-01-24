import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EditorPage } from './pages/Editor/EditorPage';
import './styles/index.scss';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        {/* Auto-detect basename based on current path for proxy support */}
        <BrowserRouter basename={window.location.pathname.startsWith('/story-weaver') ? '/story-weaver' : '/'}>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
            </Routes>
        </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;
