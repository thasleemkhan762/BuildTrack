import { Project } from '@/types/project';

const BASE_URL = '/api/projects';

interface GetProjectsParams {
  search?: string;
  status?: Project['status'];
}

export async function getProjects(params?: GetProjectsParams): Promise<Project[]> {
  const url = new URL(BASE_URL, window.location.origin);
  
  if (params?.search) {
    url.searchParams.append('search', params.search);
  }
  
  if (params?.status) {
    url.searchParams.append('status', params.status);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }

  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch project');
  }

  return res.json();
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  console.log(res);

  if (!res.ok) {
    throw new Error('Failed to create project');
  }

  return res.json();
}

export async function updateProject(
  id: string,
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update project');
  }

  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
}