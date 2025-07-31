'use client';

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project, statusVariant, statusText, ITEMS_PER_PAGE_OPTIONS, ItemsPerPage, ProjectStatus } from "@/types/project";
import { getProjects, deleteProject } from "@/lib/projectService";
import ProjectForm from "@/components/ProjectForm";
import { 
  Button, 
  Table, 
  Badge, 
  Form, 
  Modal, 
  Pagination, 
  Dropdown, 
  ProgressBar,
  Alert 
} from 'react-bootstrap';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  ThreeDotsVertical
} from 'react-bootstrap-icons';

interface ProjectListProps {
  initialProjects?: Project[];
}

export default function ProjectList({ initialProjects = [] }: ProjectListProps) {
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(!initialProjects.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "">("");
  const [error, setError] = useState<string | null>(null);
  
  // CRUD State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await getProjects({
          search: searchTerm,
          status: statusFilter || undefined,
        });
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!initialProjects.length) {
      fetchProjects();
    }
  }, [searchTerm, statusFilter, initialProjects.length]);

  // Handle project created/updated
  const handleProjectSaved = () => {
    router.refresh();
    setProjectToEdit(null);
    setIsCreateModalOpen(false);
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject(projectToDelete.id);
      router.refresh();
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project');
    }
  };

  // Filter projects based on search term
  const filteredProjects = useMemo(() => 
    projects.filter((project) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchLower) ||
        statusText[project.status as keyof typeof statusText].toLowerCase().includes(searchLower)
      );
    }),
    [projects, searchTerm]
  );

  // Calculate pagination
  const { totalItems, totalPages, startIndex, paginatedProjects } = useMemo(() => {
    const total = filteredProjects.length;
    const pages = Math.ceil(total / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filteredProjects.slice(start, start + itemsPerPage);
    
    return {
      totalItems: total,
      totalPages: pages,
      startIndex: start,
      paginatedProjects: paginated
    };
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10) as ItemsPerPage;
    if (isNaN(newItemsPerPage)) return;
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Status badge variant mapping
  const getStatusVariant = (status: Project["status"]) => {
    switch (status) {
      case "planning": return "secondary";
      case "in_progress": return "primary";
      case "on_hold": return "warning";
      case "completed": return "success";
      default: return "secondary";
    }
  };

  return (
    <div className="p-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div className="d-flex flex-column flex-md-row gap-3 flex-grow-1">
          <Form.Control
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: '300px' }}
          />
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProjectStatus | '');
              setCurrentPage(1);
            }}
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={16} />
            New Project
          </Button>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Show</span>
            <Form.Select
              value={itemsPerPage.toString()}
              onChange={handleItemsPerPageChange}
              style={{ width: '100px' }}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option.toString()}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>

      <div className="border rounded">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Timeline</th>
              <th>Team</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedProjects.length > 0 ? (
              paginatedProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link 
                      href={`/dashboard/projects/${project.id}`} 
                      className="text-decoration-none"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(project.status)}>
                      {statusText[project.status]}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProgressBar 
                        now={project.progress} 
                        variant={project.progress === 100 ? 'success' : 'primary'} 
                        style={{ width: '100%' }}
                      />
                      <span className="text-muted">{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-muted">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex">
                      {Array.from({ length: Math.min(3, project.teamSize) }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '32px', 
                            height: '32px',
                            marginLeft: i > 0 ? '-8px' : '0',
                            border: '1px solid #dee2e6'
                          }}
                        >
                          {i === 2 && project.teamSize > 3 ? `+${project.teamSize - 2}` : `U${i + 1}`}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="text-end">
                    <Dropdown>
                      <Dropdown.Toggle variant="light" id="dropdown-actions">
                        <ThreeDotsVertical size={16} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end">
                        <Dropdown.Item onClick={() => setProjectToEdit(project)}>
                          <Pencil className="me-2" size={14} />
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => {
                            setProjectToDelete(project);
                            setShowDeleteDialog(true);
                          }}
                          className="text-danger"
                        >
                          <Trash2 className="me-2" size={14} />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
            <div className="text-muted mb-2 mb-md-0">
              Showing <span className="fw-semibold">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
              <span className="fw-semibold">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="fw-semibold">{totalItems}</span> projects
            </div>
            
            <Pagination className="m-0">
              <Pagination.Prev 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              
              {/* First page */}
              {currentPage > 2 && (
                <Pagination.Item onClick={() => handlePageChange(1)}>
                  1
                </Pagination.Item>
              )}
              
              {/* Ellipsis */}
              {currentPage > 3 && <Pagination.Ellipsis />}
              
              {/* Pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Pagination.Item 
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}
              
              {/* Ellipsis */}
              {currentPage < totalPages - 2 && totalPages > 5 && <Pagination.Ellipsis />}
              
              {/* Last page */}
              {currentPage < totalPages - 1 && totalPages > 1 && (
                <Pagination.Item onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              )}
              
              <Pagination.Next 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal show={isCreateModalOpen} onHide={() => setIsCreateModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProjectForm 
            onSuccess={handleProjectSaved} 
            onCancel={() => setIsCreateModalOpen(false)} 
          />
        </Modal.Body>
      </Modal>

      {/* Edit Project Modal */}
      <Modal show={!!projectToEdit} onHide={() => setProjectToEdit(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {projectToEdit && (
            <ProjectForm 
              project={projectToEdit} 
              onSuccess={handleProjectSaved} 
              onCancel={() => setProjectToEdit(null)} 
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal show={showDeleteDialog} onHide={() => setShowDeleteDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently delete the project "{projectToDelete?.name}". This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProject}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}