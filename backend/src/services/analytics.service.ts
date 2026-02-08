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
    const completedTasks = tasks.filter(t => 
      t.status && t.status.toString().trim().toLowerCase() === 'completed'
    ).length;
    
    // Count other statuses dynamically
    const inProgressTasks = tasks.filter(t => 
      t.status && 
      t.status.toString().trim().toLowerCase() !== 'completed' &&
      t.status.toString().trim() !== ''
    ).length;
    
    const notStartedTasks = tasks.filter(t => 
      !t.status || t.status.toString().trim() === ''
    ).length;

    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => !s.onLOA).length;
    const supervisorsOnLOA = supervisors.filter(s => s.onLOA).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const supervisorMetrics = await this.calculateSupervisorMetrics(supervisors, tasks);
    
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

    // Get task history for completion metrics (as fallback)
    const taskHistory = await this.tasksService.getTaskHistory();

    return supervisors.map(supervisor => {
      // Count completed tasks directly from Tasks sheet where status = "Completed" and taskOwner exists
      const completedTasksFromSheet = tasks.filter(
        t => t.taskOwner && 
             t.taskOwner.trim() === supervisor.name && 
             t.status && 
             t.status.toString().trim().toLowerCase() === 'completed'
      );
      
      const totalCompleted = completedTasksFromSheet.length;
      
      // Count tasks completed this month (using claimedDate as proxy since we don't have completion date in Tasks sheet)
      // Note: This is an approximation. For accurate month/week counts, use task history if available
      const tasksWithDates = completedTasksFromSheet.filter(t => t.claimedDate);
      
      const thisMonth = tasksWithDates.filter(t => {
        if (!t.claimedDate) return false;
        const claimedDate = new Date(t.claimedDate);
        return claimedDate >= startOfMonth;
      }).length;

      // Count tasks completed this week
      const thisWeek = tasksWithDates.filter(t => {
        if (!t.claimedDate) return false;
        const claimedDate = new Date(t.claimedDate);
        return claimedDate >= startOfWeek;
      }).length;

      // Calculate average completion days from task history (if available)
      const historyForSupervisor = taskHistory.filter(
        h => h.supervisor === supervisor.name
      );
      const totalDays = historyForSupervisor.reduce((sum, h) => {
        return sum + (h.durationDays || 0);
      }, 0);
      const averageCompletionDays = historyForSupervisor.length > 0 ? totalDays / historyForSupervisor.length : 0;

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
