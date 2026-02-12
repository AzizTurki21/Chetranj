import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './lib/gameContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { ColorSelection } from './pages/ColorSelection';
import { GameRoom } from './pages/GameRoom';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/room/:roomId/color" element={<ColorSelection />} />
            <Route path="/room/:roomId/play" element={<GameRoom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
