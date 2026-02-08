import { SheetsService } from './sheets.service';
import { Task } from '../types';

const TASKS_SHEET = 'Tasks';
const TASK_HISTORY_SHEET = 'Task History';

export class TasksService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllTasks(): Promise<Task[]> {
    // Read only the core 3 columns that existed originally
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(TASKS_SHEET, 'A2:C1000'));
    
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
          status: (row[2] as any) || 'Assigned',
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
    // Only write the core 3 columns to maintain backward compatibility
    const newRow = [
      task.task,
      task.claimedBy || '',
      task.status || 'Assigned',
    ];

    await this.sheetsService.appendRange(this.sheetsService.buildRange(TASKS_SHEET, 'A:C'), [newRow]);
    
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
    
    // Only write back the core 3 columns to preserve any other data in the sheet
    const updatedRow = [
      updatedTask.task,
      updatedTask.claimedBy,
      updatedTask.status,
    ];

    await this.sheetsService.writeRange(this.sheetsService.buildRange(TASKS_SHEET, `A${rowNumber}:C${rowNumber}`), [updatedRow]);
    
    // If task is marked as completed, add to task history
    if (updatedTask.status === 'Completed' && currentTask.status !== 'Completed') {
      await this.addToHistory(updatedTask);
    }
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    // Read all data from the core 3 columns
    const allRows = await this.sheetsService.readRange(this.sheetsService.buildRange(TASKS_SHEET, 'A:C'));
    
    // Remove the specific row (accounting for 0-based index)
    allRows.splice(rowNumber - 1, 1);
    
    // Clear and rewrite
    await this.sheetsService.clearRange(this.sheetsService.buildRange(TASKS_SHEET, 'A2:C1000'));
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(this.sheetsService.buildRange(TASKS_SHEET, 'A2:C1000'), allRows.slice(1));
    }
  }

  private async addToHistory(task: Task): Promise<void> {
    if (!task.claimedBy) {
      return;
    }

    const completedDate = new Date().toISOString().split('T')[0];
    
    // Since we don't track creation date, use 'N/A' for duration
    const historyRow = [
      task.task,
      task.claimedBy,
      completedDate,
      'N/A', // Duration not available without creation date tracking
    ];

    try {
      await this.sheetsService.appendRange(this.sheetsService.buildRange(TASK_HISTORY_SHEET, 'A:D'), [historyRow]);
    } catch (error) {
      console.error('Failed to add to task history:', error);
      // Don't fail the main operation if history update fails
    }
  }

  async getTaskHistory(): Promise<any[]> {
    try {
      const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(TASK_HISTORY_SHEET, 'A2:D1000'));
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
