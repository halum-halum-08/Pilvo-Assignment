const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let services = [
  { id: '1', name: 'Authentication', status: 'operational' },
  { id: '2', name: 'API', status: 'operational' },
  { id: '3', name: 'Dashboard', status: 'operational' },
  { id: '4', name: 'Database', status: 'degraded' },
];

let incidents = [
  {
    id: '1',
    title: 'API Slowdown',
    description: 'We are experiencing slowdowns with our API service.',
    status: 'investigating',
    type: 'incident',
    severity: 'major',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serviceIds: ['2'],
    updates: [
      {
        id: '1',
        incidentId: '1',
        message: 'We are investigating issues with our API service.',
        status: 'investigating',
        createdAt: new Date().toISOString(),
      }
    ]
  }
];

// API Routes
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is running' });
});

// Get all services
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Get service by ID
app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(service);
});

// Create service
app.post('/api/services', (req, res) => {
  const { name, status } = req.body;
  const newService = {
    id: uuidv4(),
    name,
    status: status || 'operational'
  };
  services.push(newService);
  res.status(201).json(newService);
});

// Update service
app.put('/api/services/:id', (req, res) => {
  const { name, status } = req.body;
  const serviceIndex = services.findIndex(s => s.id === req.params.id);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  services[serviceIndex] = {
    ...services[serviceIndex],
    name: name || services[serviceIndex].name,
    status: status || services[serviceIndex].status
  };
  
  res.json(services[serviceIndex]);
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
  const serviceIndex = services.findIndex(s => s.id === req.params.id);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  const deletedService = services.splice(serviceIndex, 1);
  res.json(deletedService[0]);
});

// Get all incidents
app.get('/api/incidents', (req, res) => {
  const { type, includeUpdates } = req.query;
  let filteredIncidents = [...incidents];
  
  if (type) {
    filteredIncidents = filteredIncidents.filter(i => i.type === type);
  }
  
  if (includeUpdates !== 'true') {
    filteredIncidents = filteredIncidents.map(i => {
      const { updates, ...rest } = i;
      return rest;
    });
  }
  
  res.json(filteredIncidents);
});

// Get incident by ID
app.get('/api/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  
  res.json(incident);
});

// Create incident
app.post('/api/incidents', (req, res) => {
  const { title, description, status, type, severity, serviceIds } = req.body;
  const now = new Date().toISOString();
  
  const newIncident = {
    id: uuidv4(),
    title,
    description,
    status: status || 'investigating',
    type: type || 'incident',
    severity: severity || 'minor',
    createdAt: now,
    updatedAt: now,
    serviceIds: serviceIds || [],
    updates: [
      {
        id: uuidv4(),
        incidentId: '',
        message: `Incident created: ${description}`,
        status: status || 'investigating',
        createdAt: now
      }
    ]
  };
  
  // Set the incident ID for the first update
  newIncident.updates[0].incidentId = newIncident.id;
  
  incidents.push(newIncident);
  res.status(201).json(newIncident);
});

// Update incident
app.put('/api/incidents/:id', (req, res) => {
  const { title, description, status, severity, serviceIds } = req.body;
  const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
  
  if (incidentIndex === -1) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  
  incidents[incidentIndex] = {
    ...incidents[incidentIndex],
    title: title || incidents[incidentIndex].title,
    description: description || incidents[incidentIndex].description,
    status: status || incidents[incidentIndex].status,
    severity: severity || incidents[incidentIndex].severity,
    serviceIds: serviceIds || incidents[incidentIndex].serviceIds,
    updatedAt: new Date().toISOString()
  };
  
  res.json(incidents[incidentIndex]);
});

// Delete incident
app.delete('/api/incidents/:id', (req, res) => {
  const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
  
  if (incidentIndex === -1) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  
  const deletedIncident = incidents.splice(incidentIndex, 1);
  res.json(deletedIncident[0]);
});

// Add update to incident
app.post('/api/incidents/:id/updates', (req, res) => {
  const { message, status } = req.body;
  const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
  
  if (incidentIndex === -1) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  
  const newUpdate = {
    id: uuidv4(),
    incidentId: req.params.id,
    message,
    status: status || incidents[incidentIndex].status,
    createdAt: new Date().toISOString()
  };
  
  incidents[incidentIndex].updates.push(newUpdate);
  incidents[incidentIndex].status = status || incidents[incidentIndex].status;
  incidents[incidentIndex].updatedAt = new Date().toISOString();
  
  res.status(201).json(newUpdate);
});

// Serve static files (if in production)
app.use(express.static(path.join(__dirname, '../build')));

// All other routes should redirect to the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});