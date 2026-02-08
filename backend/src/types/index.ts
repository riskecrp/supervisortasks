export interface Task {
  id: string;
  task: string;
  claimedBy: string;
  status: 'Assigned' | 'Claimed' | 'Pending Reach Out' | 'Pending Meeting' | 'Pending Employee Reach Out' | 'Pending Discussion' | 'Completed';
  completedDate?: string;
  createdDate: string;
}

export interface Discussion {
  id: string;
  datePosted: string;
  topic: string;
  link: string;
  supervisorFeedback: Record<string, boolean>;
}

export interface Supervisor {
  name: string;
  active: boolean;
  onLOA: boolean;
}

export interface LOARecord {
  id: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Active' | 'Completed';
}

export interface TaskHistory {
  id: string;
  taskName: string;
  supervisor: string;
  completedDate: string;
  durationDays: number;
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  totalSupervisors: number;
  activeSupervisors: number;
  supervisorsOnLOA: number;
  completionRate: number;
  supervisorMetrics: SupervisorMetrics[];
}

export interface SupervisorMetrics {
  name: string;
  totalCompleted: number;
  thisMonth: number;
  thisWeek: number;
  averageCompletionDays: number;
  onLOA: boolean;
}
