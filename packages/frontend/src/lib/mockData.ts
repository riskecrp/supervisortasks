import { Task, Discussion, Supervisor } from '@/types';

export const mockTasks: Task[] = [
  {
    id: '1',
    taskList: 'Review and approve monthly reports',
    taskOwner: 'John Smith',
    status: 'In Progress',
    claimedDate: '2026-02-01',
    dueDate: '2026-02-10',
    completedDate: null,
    notes: 'Awaiting final approval from team lead',
  },
  {
    id: '2',
    taskList: 'Conduct quarterly team reviews',
    taskOwner: 'Sarah Johnson',
    status: 'Not Started',
    claimedDate: null,
    dueDate: '2026-02-03',
    completedDate: null,
    notes: 'Schedule meetings with all team members',
  },
  {
    id: '3',
    taskList: 'Update training documentation',
    taskOwner: 'Mike Davis',
    status: 'Completed',
    claimedDate: '2026-01-15',
    dueDate: '2026-01-30',
    completedDate: '2026-01-28',
    notes: 'All sections updated and reviewed',
  },
  {
    id: '4',
    taskList: 'Process employee feedback forms',
    taskOwner: 'Emily Brown',
    status: 'In Progress',
    claimedDate: '2026-02-05',
    dueDate: '2026-02-15',
    completedDate: null,
    notes: '15 out of 30 forms processed',
  },
  {
    id: '5',
    taskList: 'Organize team building event',
    taskOwner: 'John Smith',
    status: 'Blocked',
    claimedDate: '2026-01-20',
    dueDate: '2026-02-20',
    completedDate: null,
    notes: 'Waiting for budget approval',
  },
];

export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    datePosted: '2026-02-08',
    topic: 'New policy implementation strategy',
    link: 'https://example.com/discussion/1',
    supervisorFeedback: {
      'John Smith': true,
      'Sarah Johnson': false,
      'Mike Davis': true,
    },
  },
  {
    id: '2',
    datePosted: '2026-02-07',
    topic: 'Q1 Performance metrics review',
    link: 'https://example.com/discussion/2',
    supervisorFeedback: {
      'John Smith': false,
      'Sarah Johnson': true,
      'Mike Davis': false,
    },
  },
  {
    id: '3',
    datePosted: '2026-02-06',
    topic: 'Remote work policy updates',
    link: 'https://example.com/discussion/3',
    supervisorFeedback: {
      'John Smith': true,
      'Sarah Johnson': true,
      'Mike Davis': true,
    },
  },
];

export const mockSupervisors: Supervisor[] = [
  {
    name: 'John Smith',
    rank: 'Senior Supervisor',
    isOnLOA: false,
    loaStartDate: null,
    loaEndDate: null,
    totalTasksCompleted: 12,
    monthlyTasksCompleted: 3,
  },
  {
    name: 'Sarah Johnson',
    rank: 'Supervisor',
    isOnLOA: false,
    loaStartDate: null,
    loaEndDate: null,
    totalTasksCompleted: 8,
    monthlyTasksCompleted: 2,
  },
  {
    name: 'Mike Davis',
    rank: 'Lead Supervisor',
    isOnLOA: true,
    loaStartDate: '2026-02-05',
    loaEndDate: '2026-02-20',
    totalTasksCompleted: 15,
    monthlyTasksCompleted: 1,
  },
  {
    name: 'Emily Brown',
    rank: 'Supervisor',
    isOnLOA: false,
    loaStartDate: null,
    loaEndDate: null,
    totalTasksCompleted: 10,
    monthlyTasksCompleted: 4,
  },
];
