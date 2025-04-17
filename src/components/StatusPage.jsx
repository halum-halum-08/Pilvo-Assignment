import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const StatusPage = () => {
  // ...existing code...
  
  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>System Status</h1>
        </Col>
        <Col xs="auto">
          <Link to="/admin">
            <Button variant="danger">Admin Dashboard</Button>
          </Link>
        </Col>
      </Row>
      
      {/* Rest of the status page content */}
      // ...existing code...
    </Container>
  );
};

export default StatusPage;