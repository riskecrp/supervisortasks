export interface Task {
  id: string;
  taskList: string;
  taskOwner: string;
  status: string;
  claimedDate: string;
  dueDate: string;
  notes: string;
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
  workloadDistribution?: {
    averageTasksPerSupervisor: number;
    highestWorkload: { name: string; taskCount: number };
    lowestWorkload: { name: string; taskCount: number };
    distributionStdDev: number;
  };
}

export interface SupervisorMetrics {
  name: string;
  totalCompleted: number;
  thisMonth: number;
  thisWeek: number;
  averageCompletionDays: number;
  onLOA: boolean;
}
