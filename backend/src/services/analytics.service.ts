import { SheetsService } from './sheets.service';
import { TasksService } from './tasks.service';
import { SupervisorsService } from './supervisors.service';
import { LOAService } from './loa.service';
import { Analytics, SupervisorMetrics } from '../types';

export class AnalyticsService {
  private sheetsService: SheetsService;
  private tasksService: TasksService;
  private supervisorsService: SupervisorsService;
  private loaService: LOAService;

  constructor(
    sheetsService: SheetsService,
    tasksService: TasksService,
    supervisorsService: SupervisorsService,
    loaService: LOAService
  ) {
    this.sheetsService = sheetsService;
    this.tasksService = tasksService;
    this.supervisorsService = supervisorsService;
    this.loaService = loaService;
  }

  async getAnalytics(): Promise<Analytics> {
    const [tasks, supervisors, loaRecords] = await Promise.all([
      this.tasksService.getAllTasks(),
      this.supervisorsService.getAllSupervisors(),
      this.loaService.getAllLOARecords(),
    ]);

    const totalTasks = tasks.length;
    
    // Pre-process status values once
    const tasksWithNormalizedStatus = tasks.map(t => ({
      ...t,
      normalizedStatus: t.status ? t.status.toString().trim().toLowerCase() : ''
    }));
    
    const completedTasks = tasksWithNormalizedStatus.filter(t => 
      t.normalizedStatus === 'completed'
    ).length;
    
    // Count other statuses dynamically
    const inProgressTasks = tasksWithNormalizedStatus.filter(t => 
      t.normalizedStatus !== 'completed' && t.normalizedStatus !== ''
    ).length;
    
    const notStartedTasks = tasksWithNormalizedStatus.filter(t => 
      t.normalizedStatus === ''
    ).length;

    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => !s.onLOA).length;
    const supervisorsOnLOA = supervisors.filter(s => s.onLOA).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const supervisorMetrics = await this.calculateSupervisorMetrics(supervisors, tasksWithNormalizedStatus);
    
    // Calculate workload distribution
    const workloadDistribution = this.calculateWorkloadDistribution(supervisorMetrics);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalSupervisors,
      activeSupervisors,
      supervisorsOnLOA,
      completionRate,
      supervisorMetrics,
      workloadDistribution,
    };
  }

  async getSupervisorMetrics(supervisorName: string): Promise<SupervisorMetrics | null> {
    const supervisors = await this.supervisorsService.getAllSupervisors();
    const supervisor = supervisors.find(s => s.name === supervisorName);
    
    if (!supervisor) {
      return null;
    }

    const tasks = await this.tasksService.getAllTasks();
    const metrics = await this.calculateSupervisorMetrics([supervisor], tasks);
    
    return metrics[0] || null;
  }

  private async calculateSupervisorMetrics(
    supervisors: any[],
    tasks: any[]
  ): Promise<SupervisorMetrics[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Group tasks by supervisor once to avoid repeated filtering
    const tasksBySupervisor = new Map<string, any[]>();
    tasks.forEach(task => {
      if (task.taskOwner && task.taskOwner.trim()) {
        const owner = task.taskOwner.trim();
        if (!tasksBySupervisor.has(owner)) {
          tasksBySupervisor.set(owner, []);
        }
        tasksBySupervisor.get(owner)!.push(task);
      }
    });

    return supervisors.map(supervisor => {
      // Get all tasks for this supervisor
      const supervisorTasks = tasksBySupervisor.get(supervisor.name) || [];
      
      // Filter to only completed tasks
      const completedTasks = supervisorTasks.filter(
        t => t.normalizedStatus === 'completed'
      );
      
      const totalCompleted = completedTasks.length;
      
      // Calculate thisMonth: count completed tasks where claimedDate is in current month
      const thisMonth = completedTasks.filter(task => {
        if (!task.claimedDate) return false;
        try {
          const claimedDate = new Date(task.claimedDate);
          return claimedDate >= startOfMonth;
        } catch {
          return false;
        }
      }).length;

      // Calculate thisWeek: count completed tasks where claimedDate is in current week
      const thisWeek = completedTasks.filter(task => {
        if (!task.claimedDate) return false;
        try {
          const claimedDate = new Date(task.claimedDate);
          return claimedDate >= startOfWeek;
        } catch {
          return false;
        }
      }).length;

      // Calculate averageCompletionDays: for each completed task, calculate days from claimedDate to today
      const tasksWithValidDates = completedTasks.filter(task => {
        if (!task.claimedDate) return false;
        try {
          new Date(task.claimedDate);
          return true;
        } catch {
          return false;
        }
      });
      
      let averageCompletionDays = 0;
      if (tasksWithValidDates.length > 0) {
        const totalDays = tasksWithValidDates.reduce((sum, task) => {
          const claimedDate = new Date(task.claimedDate);
          const daysDiff = Math.floor((now.getTime() - claimedDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + daysDiff;
        }, 0);
        averageCompletionDays = totalDays / tasksWithValidDates.length;
      }

      return {
        name: supervisor.name,
        totalCompleted,
        thisMonth,
        thisWeek,
        averageCompletionDays: this.roundToOneDecimal(averageCompletionDays),
        onLOA: supervisor.onLOA || false,
      };
    });
  }

  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private calculateWorkloadDistribution(metrics: SupervisorMetrics[]) {
    if (metrics.length === 0) {
      return {
        averageTasksPerSupervisor: 0,
        highestWorkload: { name: '', taskCount: 0 },
        lowestWorkload: { name: '', taskCount: 0 },
        distributionStdDev: 0,
      };
    }

    const taskCounts = metrics.map(m => m.totalCompleted);
    const totalCompleted = taskCounts.reduce((sum, count) => sum + count, 0);
    const averageTasksPerSupervisor = totalCompleted / metrics.length;

    // Find highest and lowest workload
    const sortedMetrics = [...metrics].sort((a, b) => b.totalCompleted - a.totalCompleted);
    const highestWorkload = {
      name: sortedMetrics[0]?.name || '',
      taskCount: sortedMetrics[0]?.totalCompleted || 0,
    };
    const lowestWorkload = {
      name: sortedMetrics[sortedMetrics.length - 1]?.name || '',
      taskCount: sortedMetrics[sortedMetrics.length - 1]?.totalCompleted || 0,
    };

    // Calculate standard deviation
    const variance = taskCounts.reduce((sum, count) => {
      return sum + Math.pow(count - averageTasksPerSupervisor, 2);
    }, 0) / taskCounts.length;
    const distributionStdDev = Math.sqrt(variance);

    return {
      averageTasksPerSupervisor: this.roundToOneDecimal(averageTasksPerSupervisor),
      highestWorkload,
      lowestWorkload,
      distributionStdDev: this.roundToOneDecimal(distributionStdDev),
    };
  }
}
