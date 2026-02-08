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
    const inProgressTasks = tasks.filter(t => 
      t.status === 'Claimed' || 
      t.status === 'Pending Reach Out' || 
      t.status === 'Pending Meeting' || 
      t.status === 'Pending Employee Reach Out' || 
      t.status === 'Pending Discussion'
    ).length;
    const notStartedTasks = tasks.filter(t => t.status === 'Assigned').length;

    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => !s.onLOA).length;
    const supervisorsOnLOA = supervisors.filter(s => s.onLOA).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const supervisorMetrics = await this.calculateSupervisorMetrics(supervisors, taskHistory);

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
    };
  }

  async getSupervisorMetrics(supervisorName: string): Promise<SupervisorMetrics | null> {
    const supervisors = await this.supervisorsService.getAllSupervisors();
    const supervisor = supervisors.find(s => s.name === supervisorName);
    
    if (!supervisor) {
      return null;
    }

    const taskHistory = await this.tasksService.getTaskHistory();
    const metrics = await this.calculateSupervisorMetrics([supervisor], taskHistory);
    
    return metrics[0] || null;
  }

  private async calculateSupervisorMetrics(
    supervisors: any[],
    taskHistory: any[]
  ): Promise<SupervisorMetrics[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return supervisors.map(supervisor => {
      const supervisorTasks = taskHistory.filter(
        t => t.supervisor === supervisor.name
      );

      const totalCompleted = supervisorTasks.length;
      
      const thisMonth = supervisorTasks.filter(t => {
        const completedDate = new Date(t.completedDate);
        return completedDate >= startOfMonth;
      }).length;

      const thisWeek = supervisorTasks.filter(t => {
        const completedDate = new Date(t.completedDate);
        return completedDate >= startOfWeek;
      }).length;

      const totalDays = supervisorTasks.reduce((sum, t) => sum + (t.durationDays || 0), 0);
      const averageCompletionDays = totalCompleted > 0 ? totalDays / totalCompleted : 0;

      return {
        name: supervisor.name,
        totalCompleted,
        thisMonth,
        thisWeek,
        averageCompletionDays: Math.round(averageCompletionDays * 10) / 10,
        onLOA: supervisor.onLOA || false,
      };
    });
  }
}
