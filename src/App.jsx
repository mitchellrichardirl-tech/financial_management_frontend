import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadStatement from './pages/UploadStatement';
import CategorizeTransactions from './pages/CategorizeTransactions';
import ProcessReceipts from './pages/ProcessReceipts';
import BulkReceiptProcessor from './pages/BulkReceiptProcessor';
import TestCandidates from './pages/TestCandidates';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation header */}
        <nav className="nav-menu">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload Statement</Link>
          <Link to="/categorize">Categorize Transactions</Link>
          <Link to="/process-receipts">Process Receipts</Link>
          <Link to="/bulk-upload">Bulk Upload Receipts</Link>
          <Link to="/test-candidates">Test Candidates</Link>
        </nav>

        {/* Main content area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="home-page">
                <h1>Transaction Manager</h1>
                <p>Welcome! Use the navigation above to get started.</p>
              </div>
            } />
            <Route path="/upload" element={<UploadStatement />} />
            <Route path="/categorize" element={<CategorizeTransactions />} />
            <Route path="/process-receipts" element={<ProcessReceipts />} />
            <Route path="/bulk-upload" element={<BulkReceiptProcessor />} />
            <Route path="/test-candidates" element={<TestCandidates />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;