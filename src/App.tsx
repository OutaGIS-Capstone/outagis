import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar.tsx";
import OutageList from "./OutageList";
import Home from "./Home.tsx";
import Report from "./Report.tsx";
import Form from "./Form.tsx";
import Signin from "./Signin.tsx";
import RegionDetails from "./RegionDetails.tsx";
import Account from "./Account.tsx";
import Tutorial from "./Tutorial.tsx";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/outage-list" element={<OutageList />} />
      <Route path="/report-outage" element={<Report />} />
      <Route path="/report-form" element={<Form />} />
      <Route path="/signin" element={<Signin />} /> 
      <Route path="/region/:regionName" element={<RegionDetails />} />
      <Route path="/account" element={<Account />} />            
      <Route path="/tutorial" element={<Tutorial />} />            
      </Routes>
    </Router>
  );
}

export default App;
