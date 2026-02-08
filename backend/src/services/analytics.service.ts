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

    // Get task history for completion metrics (as fallback)
    const taskHistory = await this.tasksService.getTaskHistory();
    
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
    
    // Group task history by supervisor once
    const historyBySupervisor = new Map<string, any[]>();
    taskHistory.forEach(h => {
      if (h.supervisor) {
        if (!historyBySupervisor.has(h.supervisor)) {
          historyBySupervisor.set(h.supervisor, []);
        }
        historyBySupervisor.get(h.supervisor)!.push(h);
      }
    });

    return supervisors.map(supervisor => {
      // Count completed tasks directly from Tasks sheet where status = "Completed" and taskOwner exists
      // This gives the most accurate current count of all completed tasks
      const supervisorTasks = tasksBySupervisor.get(supervisor.name) || [];
      const completedTasksFromSheet = supervisorTasks.filter(
        t => t.normalizedStatus === 'completed'
      );
      
      const totalCompleted = completedTasksFromSheet.length;
      
      // For time-based metrics (thisMonth, thisWeek) and average completion days,
      // we use Task History which is populated when a task's status changes to "Completed"
      // Note: There may be a brief delay between marking completed and history entry creation
      // This means totalCompleted (from Tasks sheet) may be slightly higher than history counts
      const completedTasksFromHistory = historyBySupervisor.get(supervisor.name) || [];
      
      const thisMonth = completedTasksFromHistory.filter(h => {
        if (!h.completedDate) return false;
        const completedDate = new Date(h.completedDate);
        return completedDate >= startOfMonth;
      }).length;

      // Count tasks completed this week
      const thisWeek = completedTasksFromHistory.filter(h => {
        if (!h.completedDate) return false;
        const completedDate = new Date(h.completedDate);
        return completedDate >= startOfWeek;
      }).length;

      // Calculate average completion days from task history
      // Uses history count as denominator since only history has duration data
      const totalDays = completedTasksFromHistory.reduce((sum, h) => {
        return sum + (h.durationDays || 0);
      }, 0);
      const averageCompletionDays = completedTasksFromHistory.length > 0 ? totalDays / completedTasksFromHistory.length : 0;

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
