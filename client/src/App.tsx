import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderList from './pages/ProviderList';
import ProviderDetail from './pages/ProviderDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProviderList />} />
        <Route path="/providers" element={<ProviderList />} />
        <Route path="/providers/:id" element={<ProviderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
