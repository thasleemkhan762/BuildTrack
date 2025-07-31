'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectStatus } from '@/types/project';
import { createProject, updateProject } from '@/lib/projectService';
import { format } from 'date-fns';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify'; // or use your own toast hook

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProjectForm({
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    status: 'planning',
    progress: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    teamSize: 1,
  });
  console.log(formData);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        progress: project.progress,
        startDate: project.startDate,
        endDate: project.endDate,
        teamSize: project.teamSize,
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'teamSize' || name === 'progress' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (project) {
        await updateProject(project.id, formData);
        toast.success('Project updated successfully');
      } else {
        await createProject(formData);
        toast.success('Project created successfully');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/projects');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 bg-white rounded shadow-sm">
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>Project Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter project name"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter project description"
        />
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="progress">
            <Form.Label>Progress ({formData.progress}%)</Form.Label>
            <Form.Control
              type="number"
              name="progress"
              min={0}
              max={100}
              value={formData.progress}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="teamSize">
        <Form.Label>Team Size</Form.Label>
        <Form.Control
          type="number"
          name="teamSize"
          min={1}
          value={formData.teamSize}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="outline-secondary"
          onClick={onCancel || (() => router.back())}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </Form>
  );
}
