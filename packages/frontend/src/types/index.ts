export interface Task {
  id: string;
  taskList: string;
  taskOwner: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  claimedAssignedDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
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
  rank: string;
  isOnLOA: boolean;
  loaStartDate: string | null;
  loaEndDate: string | null;
}

export interface LOARecord {
  id: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Active' | 'Completed';
}
