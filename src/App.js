import logo from './logo.svg';
import './App.css';
import Application_check from './components/main/Application_check';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './components/main/Main';
import Dashboard from './components/main/Dashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={ <Main/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
      </BrowserRouter>
  );
}

export default App;
