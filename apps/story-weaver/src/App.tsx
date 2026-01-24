import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EditorPage } from './pages/Editor/EditorPage';
import './styles/index.scss';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
