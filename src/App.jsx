import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadStatement from './pages/UploadStatement';
import CategorizeTransactions from './pages/CategorizeTransactions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Simple navigation header */}
        <nav style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0',
          marginBottom: '20px' 
        }}>
          <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
          <Link to="/upload" style={{ marginRight: '20px' }}>Upload Statement</Link>
          <Link to="/categorize">Categorize Transactions</Link>
        </nav>

        {/* Route definitions */}
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '20px' }}>
              <h1>Transaction Manager</h1>
              <p>Welcome! Use the navigation above to get started.</p>
            </div>
          } />
          <Route path="/upload" element={<UploadStatement />} />
          <Route path="/categorize" element={<CategorizeTransactions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;