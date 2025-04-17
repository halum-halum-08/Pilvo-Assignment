import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import IncidentsPage from './pages/admin/IncidentsPage';
import IncidentDetailPage from './pages/admin/IncidentDetailPage';
import StatusPage from './components/StatusPage';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/admin/incidents/:id" component={IncidentDetailPage} />
        <Route path="/admin/incidents" component={IncidentsPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/" component={StatusPage} />
      </Switch>
    </Router>
  );
};

export default App;