import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Badge, 
  ListGroup, Spinner, Alert 
} from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import { 
  getIncidentById, 
  updateIncident, 
  addIncidentUpdate 
} from '../../services/incidentApi';
import { getServices } from '../../services/serviceApi';
import { Incident, CreateIncidentUpdateDto } from '../../models/incident';

const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    severity: '',
    serviceIds: [] as string[]
  });
  
  const [updateData, setUpdateData] = useState<CreateIncidentUpdateDto>({
    message: '',
    status: 'investigating'
  });

  useEffect(() => {
    fetchIncident();
    fetchServices();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const data = await getIncidentById(id);
      setIncident(data);
      setFormData({
        title: data.title,
        description: data.description,
        status: data.status,
        severity: data.severity,
        serviceIds: data.serviceIds
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch incident details');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
  };

  const handleServiceSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, serviceIds: selectedOptions });
  };

  const handleSubmitUpdate = async () => {
    try {
      setLoading(true);
      await updateIncident(id, formData);
      setIsEditing(false);
      fetchIncident();
    } catch (err) {
      setError('Failed to update incident');
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateData.message) {
      return;
    }
    
    try {
      setLoading(true);
      await addIncidentUpdate(id, updateData);
      setUpdateData({
        message: '',
        status: incident?.status || 'investigating'
      });
      fetchIncident();
    } catch (err) {
      setError('Failed to add update');
      console.error(err);
      setLoading(false);
    }
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

  if (loading && !incident) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !incident) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => history.push('/admin/incidents')}>
          Back to Incidents
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="secondary" onClick={() => history.push('/admin/incidents')}>
            &larr; Back to Incidents
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {incident && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <Row>
                <Col>
                  <h2>
                    {incident.type === 'incident' ? 'Incident' : 'Maintenance'}: {incident.title}
                  </h2>
                </Col>
                <Col xs="auto">
                  {!isEditing ? (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" className="me-2" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="success" onClick={handleSubmitUpdate}>
                        Save Changes
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
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

                  <Row>
                    <Col md={6}>
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
                    </Col>
                    <Col md={6}>
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
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Affected Services</Form.Label>
                    <Form.Select 
                      multiple
                      value={formData.serviceIds}
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
              ) : (
                <>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Type:</Col>
                    <Col md={9}>
                      <Badge bg={incident.type === 'incident' ? 'danger' : 'primary'}>
                        {incident.type === 'incident' ? 'Incident' : 'Scheduled Maintenance'}
                      </Badge>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Status:</Col>
                    <Col md={9}>{getStatusBadge(incident.status)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Severity:</Col>
                    <Col md={9}>{getSeverityBadge(incident.severity)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Created:</Col>
                    <Col md={9}>{new Date(incident.createdAt).toLocaleString()}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Last Updated:</Col>
                    <Col md={9}>{new Date(incident.updatedAt).toLocaleString()}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Description:</Col>
                    <Col md={9}>{incident.description}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={3} className="fw-bold">Affected Services:</Col>
                    <Col md={9}>
                      {incident.serviceIds.length === 0 ? (
                        <em>None specified</em>
                      ) : (
                        <ul className="list-unstyled">
                          {incident.serviceIds.map(serviceId => {
                            const service = services.find(s => s.id === serviceId);
                            return (
                              <li key={serviceId}>
                                <Badge bg="secondary" className="me-1">
                                  {service ? service.name : serviceId}
                                </Badge>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h3>Updates</h3>
            </Card.Header>
            <Card.Body>
              <ListGroup className="mb-4">
                {incident.updates && incident.updates.length > 0 ? (
                  incident.updates
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(update => (
                      <ListGroup.Item key={update.id} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{new Date(update.createdAt).toLocaleString()}</strong>
                          {getStatusBadge(update.status)}
                        </div>
                        <div>{update.message}</div>
                      </ListGroup.Item>
                    ))
                ) : (
                  <p>No updates yet.</p>
                )}
              </ListGroup>

              <h4>Add New Update</h4>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={updateData.status}
                    onChange={handleUpdateInputChange}
                  >
                    <option value="investigating">Investigating</option>
                    <option value="identified">Identified</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="message"
                    value={updateData.message}
                    onChange={handleUpdateInputChange}
                    placeholder="Provide details about the current status of the incident..."
                    required
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  onClick={handleAddUpdate}
                  disabled={!updateData.message}
                >
                  Add Update
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default IncidentDetailPage;