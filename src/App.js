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
import Admin_Panel from './components/main/dashboard/admin/Admin_Panel';
import View_applications from './components/main/dashboard/admin/admin-pages/View_Applications';
import Add_Applications from './components/main/dashboard/admin/admin-pages/Add_Application';
import Registration from './components/main/Registration';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Main />} />
        <Route path="/admin" element={<Admin_Panel />} >
          <Route path='/admin/view-applications' element={<View_applications />} />
          <Route path='/admin/add-applications' element={<Add_Applications />} />

        </Route>
        <Route path="/registration" element={<Registration />} />

        <Route path='/dashboard/:id' element={<Dashboard />}>
          <Route path='/dashboard/:id' element={<Panel />} />
          <Route path='/dashboard/:id/Bio-data' element={<Bio_data />} />
          <Route path='/dashboard/:id/Edit' element={<Edit_Bio />} />
          <Route path='/dashboard/:id/Course_reg' element={<Course_reg />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
