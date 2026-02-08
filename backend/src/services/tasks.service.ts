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
    const rows = await this.sheetsService.readRange(`${TASKS_SHEET}!A2:F`);
    
    // Filter out empty rows
    const filteredRows = rows.filter(row => {
      // Check if all values are empty/null/undefined
      const allEmpty = row.every(cell => !cell || cell.toString().trim() === '');
      // Check if the first column (task name) is empty
      const taskEmpty = !row[0] || row[0].toString().trim() === '';
      
      // Row is valid if it's not completely empty AND has a task name
      return !allEmpty && !taskEmpty;
    });
    
    return filteredRows.map((row, index) => ({
      id: `task-${index + 2}`,
      taskList: row[0] || '',
      taskOwner: row[1] || '',
      status: (row[2] as any) || 'Not Started',
      claimedDate: row[3] || '',
      dueDate: row[4] || '',
      notes: row[5] || '',
    }));
  }

  async getTask(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const newRow = [
      task.taskList,
      task.taskOwner || '',
      task.status || 'Not Started',
      task.claimedDate || new Date().toISOString().split('T')[0],
      task.dueDate || '',
      task.notes || '',
    ];

    await this.sheetsService.appendRange(`${TASKS_SHEET}!A:F`, [newRow]);
    
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
    
    // If status changed to Completed, add to task history
    if (updates.status === 'Completed' && currentTask.status !== 'Completed') {
      await this.addToHistory(updatedTask);
    }

    const updatedRow = [
      updatedTask.taskList,
      updatedTask.taskOwner,
      updatedTask.status,
      updatedTask.claimedDate,
      updatedTask.dueDate,
      updatedTask.notes,
    ];

    await this.sheetsService.writeRange(`${TASKS_SHEET}!A${rowNumber}:F${rowNumber}`, [updatedRow]);
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    // Read all data
    const allRows = await this.sheetsService.readRange(`${TASKS_SHEET}!A:F`);
    
    // Remove the specific row (accounting for 0-based index)
    allRows.splice(rowNumber - 1, 1);
    
    // Clear and rewrite
    await this.sheetsService.clearRange(`${TASKS_SHEET}!A2:F`);
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(`${TASKS_SHEET}!A2:F`, allRows.slice(1));
    }
  }

  private async addToHistory(task: Task): Promise<void> {
    if (!task.taskOwner || !task.claimedDate) {
      console.warn('Skipping task history: Missing required fields', {
        taskList: task.taskList,
        hasOwner: !!task.taskOwner,
        hasClaimedDate: !!task.claimedDate,
      });
      return;
    }

    const completedDate = new Date().toISOString().split('T')[0];
    const claimedDate = new Date(task.claimedDate);
    const completedDateTime = new Date(completedDate);
    const durationDays = Math.floor((completedDateTime.getTime() - claimedDate.getTime()) / (1000 * 60 * 60 * 24));

    const historyRow = [
      task.taskList,
      task.taskOwner,
      completedDate,
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

  async getAvailableStatuses(): Promise<string[]> {
    try {
      // Read all status values from Column C (skipping header row)
      const rows = await this.sheetsService.readRange(`${TASKS_SHEET}!C2:C`);
      
      // Extract unique non-empty status values
      const statuses = new Set<string>();
      rows.forEach(row => {
        const status = row[0];
        if (status && status.toString().trim() !== '') {
          statuses.add(status.toString().trim());
        }
      });
      
      // Return as array, or default statuses if none found
      const statusArray = Array.from(statuses);
      return statusArray.length > 0 ? statusArray : ['Not Started', 'In Progress', 'Completed'];
    } catch (error) {
      console.error('Failed to get available statuses:', error);
      // Return default statuses on error
      return ['Not Started', 'In Progress', 'Completed'];
    }
  }
}
