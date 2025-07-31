"use client"


import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Table, Modal, Spinner } from 'react-bootstrap';
import { Alarm, Kanban, ListCheck, People, BarChart } from 'react-bootstrap-icons';
import ProjectForm from '@/components/ProjectForm';
import { getProjects } from '@/lib/projectService';
import { Project } from '@/types/project';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [key, setKey] = useState('overview');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenProjectModal = () => setShowProjectModal(true);
  const handleCloseProjectModal = () => setShowProjectModal(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [showProjectModal]); // refetch when modal closes (new project may be added)

  // Compute metrics
  const totalProjects = projects.length;
  const teamMembers = projects.reduce((sum, p) => sum + (p.teamSize || 0), 0);
  const completedTasks = projects.length > 0 ? Math.round((projects.filter(p => p.progress >= 100).length / projects.length) * 100) : 0;
  const activeTasks = projects.filter(p => p.status === 'in_progress').length;

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center justify-content-between">
        <Col>
          <h2>Welcome back!</h2>
          <p className="text-muted">Here's a list of your projects and their status.</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleOpenProjectModal}>
            <Kanban className="me-2" /> New Project
          </Button>
        </Col>
        <Modal show={showProjectModal} onHide={handleCloseProjectModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>New Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProjectForm onSuccess={handleCloseProjectModal} onCancel={handleCloseProjectModal} />
          </Modal.Body>
        </Modal>
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
                  <h3>{isLoading ? <Spinner animation="border" size="sm" /> : totalProjects}</h3>
                  <p className="text-muted">Total number of projects</p>
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
                  <h3>{isLoading ? <Spinner animation="border" size="sm" /> : activeTasks}</h3>
                  <p className="text-muted">Active projects</p>
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
                  <h3>{isLoading ? <Spinner animation="border" size="sm" /> : teamMembers}</h3>
                  <p className="text-muted">Total team members (sum)</p>
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
                  <h3>{isLoading ? <Spinner animation="border" size="sm" /> : completedTasks + '%'}</h3>
                  <p className="text-muted">Projects completed (%)</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <Card>
                <Card.Header>Project Overview</Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center" style={{ height: 300, background: '#f8f9fa' }}>
                  {isLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <div style={{ width: 250, height: 250 }}>
                      <Doughnut
                        data={{
                          labels: ['Planning', 'In Progress', 'On Hold', 'Completed'],
                          datasets: [
                            {
                              label: 'Projects by Status',
                              data: [
                                projects.filter(p => p.status === 'planning').length,
                                projects.filter(p => p.status === 'in_progress').length,
                                projects.filter(p => p.status === 'on_hold').length,
                                projects.filter(p => p.status === 'completed').length,
                              ],
                              backgroundColor: [
                                '#6c757d', // planning
                                '#0d6efd', // in_progress
                                '#ffc107', // on_hold
                                '#198754', // completed
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          plugins: {
                            legend: { position: 'bottom' },
                          },
                        }}
                      />
                    </div>
                  )}
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
                  {isLoading ? <Spinner animation="border" size="sm" /> :
                    projects.slice(0, 3).map((p, i) => (
                      <div key={p.id} className="d-flex justify-content-between mb-3">
                        <div>
                          <strong>{p.name} updated</strong>
                          <p className="mb-0 text-muted">Status: {p.status}</p>
                        </div>
                        <span className="text-muted">{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  }
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
                  {isLoading ? (
                    <tr><td colSpan={3}><Spinner animation="border" size="sm" /></td></tr>
                  ) : (
                    projects.map((p, idx) => (
                      <tr key={p.id}>
                        <td>{idx + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.status}</td>
                      </tr>
                    ))
                  )}
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
