export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed';

export type ItemsPerPage = 5 | 10 | 20 | 50;

export const ITEMS_PER_PAGE_OPTIONS: ItemsPerPage[] = [5, 10, 20, 50];

export const statusText: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed'
};

export const statusVariant: Record<ProjectStatus, string> = {
  planning: 'secondary',
  in_progress: 'primary',
  on_hold: 'warning',
  completed: 'success'
};

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  createdAt: string;
  updatedAt: string;
}