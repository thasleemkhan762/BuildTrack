"use client"


import { useState } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Table } from 'react-bootstrap';
import { Alarm, Kanban, ListCheck, People, BarChart } from 'react-bootstrap-icons';

export default function DashboardPage() {
  const [key, setKey] = useState('overview');

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center justify-content-between">
        <Col>
          <h2>Welcome back!</h2>
          <p className="text-muted">Here's a list of your projects and their status.</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary">
            <Kanban className="me-2" /> New Project
          </Button>
        </Col>
      </Row>

      <Tabs activeKey={key} onSelect={(k) => setKey(k as string)} className="mb-3">
        <Tab eventKey="overview" title="Overview">
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">Total Projects</Card.Title>
                    <Kanban className="text-muted" />
                  </div>
                  <h3>12</h3>
                  <p className="text-muted">+2 from last month</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">Active Tasks</Card.Title>
                    <ListCheck className="text-muted" />
                  </div>
                  <h3>24</h3>
                  <p className="text-muted">+5 from last week</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">Team Members</Card.Title>
                    <People className="text-muted" />
                  </div>
                  <h3>8</h3>
                  <p className="text-muted">+1 new hire this month</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">Tasks Completed</Card.Title>
                    <BarChart className="text-muted" />
                  </div>
                  <h3>89%</h3>
                  <p className="text-muted">+5% from last month</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <Card>
                <Card.Header>Project Overview</Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center" style={{ height: 300, background: '#f8f9fa' }}>
                  <p className="text-muted">Project chart will be displayed here</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <div>
                    <h5 className="mb-0">Recent Activity</h5>
                    <small className="text-muted">Latest updates from your team</small>
                  </div>
                </Card.Header>
                <Card.Body>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="d-flex justify-content-between mb-3">
                      <div>
                        <strong>Project {i} updated</strong>
                        <p className="mb-0 text-muted">Task completed by John Doe</p>
                      </div>
                      <span className="text-muted">2h ago</span>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="projects" title="Projects">
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Project Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Site Renovation</td>
                    <td>In Progress</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>New Office</td>
                    <td>Completed</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="reports" title="Reports" disabled>
          <p className="text-muted">Reports section is under construction.</p>
        </Tab>
      </Tabs>
    </Container>
  );
}
