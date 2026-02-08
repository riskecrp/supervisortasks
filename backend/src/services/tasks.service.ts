import { SheetsService } from './sheets.service';
import { Task } from '../types';

const TASKS_SHEET = 'Tasks';
const TASK_HISTORY_SHEET = "'Task History'";

export class TasksService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllTasks(): Promise<Task[]> {
    const rows = await this.sheetsService.readRange(`${TASKS_SHEET}!A2:E`);
    
    // Filter out empty rows while tracking original row numbers
    const tasks: Task[] = [];
    rows.forEach((row, index) => {
      // Check if all values are empty/null/undefined
      const allEmpty = row.every(cell => !cell || cell.toString().trim() === '');
      // Check if the first column (task name) is empty
      const taskEmpty = !row[0] || row[0].toString().trim() === '';
      
      // Only include row if it's not completely empty AND has a task name
      if (!allEmpty && !taskEmpty) {
        tasks.push({
          id: `task-${index + 2}`, // Use original row number (index + 2 because A2 is row 2)
          task: row[0] || '',
          claimedBy: row[1] || '',
          status: (row[2] as any) || 'Not Started',
          completedDate: row[3] || '',
          createdDate: row[4] || new Date().toISOString().split('T')[0],
        });
      }
    });
    
    return tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const createdDate = new Date().toISOString().split('T')[0];
    const newRow = [
      task.task,
      task.claimedBy || '',
      task.status || 'Not Started',
      task.completedDate || '',
      createdDate,
    ];

    await this.sheetsService.appendRange(`${TASKS_SHEET}!A:E`, [newRow]);
    
    const tasks = await this.getAllTasks();
    return tasks[tasks.length - 1];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const rowNumber = parseInt(id.split('-')[1]);
    const currentTask = await this.getTask(id);
    
    if (!currentTask) {
      throw new Error('Task not found');
    }

    const updatedTask = { ...currentTask, ...updates };
    
    // If status changed to Completed, set completed date
    if (updates.status === 'Completed' && currentTask.status !== 'Completed') {
      updatedTask.completedDate = new Date().toISOString().split('T')[0];
      
      // Add to task history
      await this.addToHistory(updatedTask);
    }

    const updatedRow = [
      updatedTask.task,
      updatedTask.claimedBy,
      updatedTask.status,
      updatedTask.completedDate,
      updatedTask.createdDate,
    ];

    await this.sheetsService.writeRange(`${TASKS_SHEET}!A${rowNumber}:E${rowNumber}`, [updatedRow]);
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    // Read all data
    const allRows = await this.sheetsService.readRange(`${TASKS_SHEET}!A:E`);
    
    // Remove the specific row (accounting for 0-based index)
    allRows.splice(rowNumber - 1, 1);
    
    // Clear and rewrite
    await this.sheetsService.clearRange(`${TASKS_SHEET}!A2:E`);
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(`${TASKS_SHEET}!A2:E`, allRows.slice(1));
    }
  }

  private async addToHistory(task: Task): Promise<void> {
    if (!task.claimedBy || !task.completedDate || !task.createdDate) {
      return;
    }

    const completedDate = new Date(task.completedDate);
    const createdDate = new Date(task.createdDate);
    const durationDays = Math.floor((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    const historyRow = [
      task.task,
      task.claimedBy,
      task.completedDate,
      durationDays.toString(),
    ];

    try {
      await this.sheetsService.appendRange(`${TASK_HISTORY_SHEET}!A:D`, [historyRow]);
    } catch (error) {
      console.error('Failed to add to task history:', error);
      // Don't fail the main operation if history update fails
    }
  }

  async getTaskHistory(): Promise<any[]> {
    try {
      const rows = await this.sheetsService.readRange(`${TASK_HISTORY_SHEET}!A2:D`);
      return rows.map((row, index) => ({
        id: `history-${index + 2}`,
        taskName: row[0] || '',
        supervisor: row[1] || '',
        completedDate: row[2] || '',
        durationDays: parseInt(row[3]) || 0,
      }));
    } catch (error) {
      console.error('Failed to get task history:', error);
      return [];
    }
  }
}
