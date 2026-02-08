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
    const [tasks, supervisors, loaRecords, taskHistory] = await Promise.all([
      this.tasksService.getAllTasks(),
      this.supervisorsService.getAllSupervisors(),
      this.loaService.getAllLOARecords(),
      this.tasksService.getTaskHistory(),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const notStartedTasks = tasks.filter(t => t.status === 'Not Started').length;

    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => !s.onLOA).length;
    const supervisorsOnLOA = supervisors.filter(s => s.onLOA).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const supervisorMetrics = await this.calculateSupervisorMetrics(supervisors, tasks, taskHistory);
    
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

    const [tasks, taskHistory] = await Promise.all([
      this.tasksService.getAllTasks(),
      this.tasksService.getTaskHistory(),
    ]);
    const metrics = await this.calculateSupervisorMetrics([supervisor], tasks, taskHistory);
    
    return metrics[0] || null;
  }

  private async calculateSupervisorMetrics(
    supervisors: any[],
    tasks: any[],
    taskHistory: any[]
  ): Promise<SupervisorMetrics[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return supervisors.map(supervisor => {
      // Count all tasks currently claimed by this supervisor from the Tasks sheet
      const supervisorTasks = tasks.filter(
        t => t.claimedBy === supervisor.name
      );

      // Count completed tasks
      const completedTasks = supervisorTasks.filter(t => t.status === 'Completed');
      const totalCompleted = completedTasks.length;
      
      // Count tasks completed this month
      const thisMonth = completedTasks.filter(t => {
        if (!t.completedDate) return false;
        const completedDate = new Date(t.completedDate);
        return completedDate >= startOfMonth;
      }).length;

      // Count tasks completed this week
      const thisWeek = completedTasks.filter(t => {
        if (!t.completedDate) return false;
        const completedDate = new Date(t.completedDate);
        return completedDate >= startOfWeek;
      }).length;

      // Get completion metrics from task history for accurate duration tracking
      const supervisorHistoryTasks = taskHistory.filter(
        t => t.supervisor === supervisor.name
      );
      const totalDays = supervisorHistoryTasks.reduce((sum, t) => sum + (t.durationDays || 0), 0);
      const averageCompletionDays = supervisorHistoryTasks.length > 0 ? totalDays / supervisorHistoryTasks.length : 0;

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
