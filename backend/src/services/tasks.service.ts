import { SheetsService } from './sheets.service';
import { Task } from '../types';
import { getValidTaskStatus } from '../constants/task-statuses';

const TASKS_SHEET = 'Tasks';
const TASK_HISTORY_SHEET = 'Task History';

export class TasksService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const range = this.sheetsService.buildRange(TASKS_SHEET, 'A2:E1000');
      console.log(`Reading tasks from range: ${range}`);
      
      const rows = await this.sheetsService.readRange(range);
      console.log(`Retrieved ${rows.length} rows from Google Sheets`);
      
      if (rows.length === 0) {
        console.warn('No data found in Tasks sheet. Please check that the sheet contains data starting from row 2.');
        return [];
      }
      
      // Filter out empty rows while tracking original row numbers
      const tasks: Task[] = [];
      rows.forEach((row, index) => {
        // Check if all values are empty/null/undefined
        const allEmpty = row.every(cell => !cell || cell.toString().trim() === '');
        // Check if the first column (task name) is empty
        const taskEmpty = !row[0] || row[0].toString().trim() === '';
        
        // Only include row if it's not completely empty AND has a task name
        if (!allEmpty && !taskEmpty) {
          const task: Task = {
            id: `task-${index + 2}`, // Use original row number (index + 2 because A2 is row 2)
            task: row[0] || '',
            claimedBy: row[1] || '',
            status: getValidTaskStatus(row[2], 'Assigned'),
            completedDate: row[3] || '',
            createdDate: row[4] || new Date().toISOString().split('T')[0],
          };
          
          // Log first few tasks for debugging
          if (tasks.length < 3) {
            console.log(`Task ${index + 2}:`, JSON.stringify(task, null, 2));
          }
          
          tasks.push(task);
        }
      });
      
      console.log(`Returning ${tasks.length} valid tasks after filtering empty rows`);
      return tasks;
    } catch (error: any) {
      console.error('Error reading tasks from Google Sheets:', error.message);
      console.error('Please verify:');
      console.error('1. The Google Sheets API credentials are properly configured');
      console.error('2. The sheet has a tab named "Tasks"');
      console.error('3. The service account has access to the spreadsheet');
      console.error('4. The sheet has the correct column structure: A=Task, B=Claimed By, C=Status, D=Completed Date, E=Created Date');
      throw error;
    }
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

    await this.sheetsService.appendRange(this.sheetsService.buildRange(TASKS_SHEET, 'A:E'), [newRow]);
    
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

    await this.sheetsService.writeRange(this.sheetsService.buildRange(TASKS_SHEET, `A${rowNumber}:E${rowNumber}`), [updatedRow]);
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    // Read all data
    const allRows = await this.sheetsService.readRange(this.sheetsService.buildRange(TASKS_SHEET, 'A:E'));
    
    // Remove the specific row (accounting for 0-based index)
    allRows.splice(rowNumber - 1, 1);
    
    // Clear and rewrite
    await this.sheetsService.clearRange(this.sheetsService.buildRange(TASKS_SHEET, 'A2:E1000'));
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(this.sheetsService.buildRange(TASKS_SHEET, 'A2:E1000'), allRows.slice(1));
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
