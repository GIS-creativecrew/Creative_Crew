import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/loginForm";
import TALeadDashboard from "./pages/TALeadDashboard";
import TADashboard from "./pages/TADashboard";
import InterviewerDashboard from "./pages/InterviewerDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import { AuthProvider } from "./components/AuthContext";
import CandidateLoginForm from "./components/CandidateLoginForm";
import CreatePanels from "./pages/CreatePanels";
import ScheduleInterviews from "./pages/ScheduleInterviews";
import TADriveInterviewTable from "./pages/TADriveInterviewTable";
import TADrivePanelTable from "./pages/TADrivePanelTable";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/register" element={<SignUpForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/" element={<LoginForm />} />
              <Route path="/dashboard/talead" element={<TALeadDashboard />} />
              <Route path="/dashboard/ta" element={<TADashboard />} />
              <Route
                path="/dashboard/interviewer"
                element={<InterviewerDashboard />}
              />
              <Route path="/candidate-login" element={<CandidateLoginForm />} />
              <Route
                path="/dashboard/candidate"
                element={<CandidateDashboard />}
              />
              <Route path="/dashboard/ta/create-panels" element={<CreatePanels />} />
              <Route path="/dashboard/ta/schedule-interviews" element={<ScheduleInterviews />} />
              <Route path="/dashboard/ta/drives-table" element={<TADriveInterviewTable />} />
              <Route path="/dashboard/ta/panel-table" element={<TADrivePanelTable />} />
            </Routes>
          </header>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
