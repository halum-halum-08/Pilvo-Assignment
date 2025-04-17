import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Badge, 
  Modal, Form, Spinner, Alert 
} from 'react-bootstrap';
import { getIncidents, createIncident, deleteIncident } from '../../services/incidentApi';
import { getServices } from '../../services/serviceApi';
import { Incident } from '../../models/incident';
import { Link } from 'react-router-dom';

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'investigating',
    type: 'incident',
    severity: 'minor',
    serviceIds: [] as string[]
  });

  useEffect(() => {
    fetchIncidents();
    fetchServices();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await getIncidents(undefined, true);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await createIncident(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        status: 'investigating',
        type: 'incident',
        severity: 'minor',
        serviceIds: []
      });
      fetchIncidents();
    } catch (err) {
      console.error('Error creating incident:', err);
      setError('Failed to create incident');
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteIncident(id);
        fetchIncidents();
      } catch (err) {
        console.error('Error deleting incident:', err);
        setError('Failed to delete incident');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, serviceIds: selectedOptions });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge bg="warning">Investigating</Badge>;
      case 'identified':
        return <Badge bg="info">Identified</Badge>;
      case 'monitoring':
        return <Badge bg="primary">Monitoring</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge bg="danger">Critical</Badge>;
      case 'major':
        return <Badge bg="warning">Major</Badge>;
      case 'minor':
        return <Badge bg="info">Minor</Badge>;
      case 'none':
        return <Badge bg="secondary">None</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Incident Management</h1>
          <p>Create and manage incidents and scheduled maintenance events</p>
        </Col>
        <Col xs="auto" className="align-self-center">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create New Incident
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Header>
          <Row>
            <Col>All Incidents</Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : incidents.length === 0 ? (
            <p className="text-center py-3">No incidents found</p>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(incident => (
                  <tr key={incident.id}>
                    <td>
                      <Link to={`/admin/incidents/${incident.id}`}>
                        {incident.title}
                      </Link>
                    </td>
                    <td>
                      <Badge bg={incident.type === 'incident' ? 'danger' : 'primary'}>
                        {incident.type === 'incident' ? 'Incident' : 'Maintenance'}
                      </Badge>
                    </td>
                    <td>{getStatusBadge(incident.status)}</td>
                    <td>{getSeverityBadge(incident.severity)}</td>
                    <td>{new Date(incident.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/admin/incidents/${incident.id}`} className="btn btn-sm btn-primary me-2">
                        Edit
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteIncident(incident.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Incident Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Incident</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
              >
                <option value="incident">Incident</option>
                <option value="maintenance">Scheduled Maintenance</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
              >
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Severity</Form.Label>
              <Form.Select 
                name="severity" 
                value={formData.severity} 
                onChange={handleInputChange}
              >
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="none">None</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Affected Services</Form.Label>
              <Form.Select 
                multiple
                onChange={handleServiceSelection}
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Hold Ctrl (Windows) or Command (Mac) to select multiple services
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateIncident}
            disabled={!formData.title || !formData.description}
          >
            Create Incident
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IncidentsPage;