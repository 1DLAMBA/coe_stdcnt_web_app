import logo from './logo.svg';
import './App.css';
import Application_check from './components/main/Application_check';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './components/main/Main';
import Dashboard from './components/main/Dashboard';
import Bio_data from './components/main/dashboard/Bio_data';
import Course_reg from './components/main/dashboard/Course_reg';
import Edit_Bio from './components/main/dashboard/Edit_Bio';
import Panel from './components/main/dashboard/Panel';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Main />} />
        <Route path='/dashboard' element={<Dashboard />}>
          <Route path='/dashboard' element={<Panel />} />
          <Route path='/dashboard/Bio-data' element={<Bio_data />} />
          <Route path='/dashboard/Edit' element={<Edit_Bio />} />
          <Route path='/dashboard/Course_reg' element={<Course_reg />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
