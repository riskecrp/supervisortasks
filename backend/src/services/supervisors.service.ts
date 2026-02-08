import { SheetsService } from './sheets.service';
import { Supervisor } from '../types';
import { DiscussionsService } from './discussions.service';

const DISCUSSIONS_SHEET = 'Discussions Pending Feedback';
const TASK_ROTATION_SHEET = 'Task Rotation';
const TASK_ROTATION_HEADERS = ['Employee Name', 'Rank', 'LOA?', 'LOA Start Date', 'LOA End Date'];

export class SupervisorsService {
  private sheetsService: SheetsService;
  private discussionsService: DiscussionsService;

  constructor(sheetsService: SheetsService, discussionsService: DiscussionsService) {
    this.sheetsService = sheetsService;
    this.discussionsService = discussionsService;
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    const supervisorNames = await this.discussionsService.getSupervisorsFromDiscussions();
    
    // Ensure Task Rotation sheet is initialized with all supervisors
    await this.ensureTaskRotationSync(supervisorNames);
    
    // Get LOA status and rank for each supervisor from Task Rotation
    let taskRotationData: any[][] = [];
    try {
      taskRotationData = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
    } catch (error) {
      console.log('Task Rotation sheet not found');
    }

    // Create a map of supervisor data
    const supervisorDataMap = new Map<string, { rank: string, onLOA: boolean }>();
    if (taskRotationData.length > 1) {
      taskRotationData.slice(1).forEach(row => {
        const name = row[0] ? row[0].toString().trim() : '';
        const rank = row[1] || '';
        const loaStatus = row[2] === 'TRUE' || row[2] === true;
        if (name) {
          supervisorDataMap.set(name, { rank, onLOA: loaStatus });
        }
      });
    }

    return supervisorNames.map(name => {
      const trimmedName = name.trim();
      const data = supervisorDataMap.get(trimmedName) || { rank: '', onLOA: false };
      return {
        name: trimmedName,
        rank: data.rank,
        active: true,
        onLOA: data.onLOA,
      };
    });
  }

  private async ensureTaskRotationSync(supervisorNames: string[]): Promise<void> {
    try {
      // Read existing Task Rotation data
      let existingRows: any[][] = [];
      try {
        existingRows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      } catch (error) {
        // Sheet might not exist
        console.log('Task Rotation sheet does not exist, will create it');
      }

      // If no rows exist, create header
      if (existingRows.length === 0) {
        await this.sheetsService.writeRange(`${TASK_ROTATION_SHEET}!A1:E1`, [TASK_ROTATION_HEADERS]);
        existingRows = [TASK_ROTATION_HEADERS];
      }

      // Get list of supervisors already in Task Rotation
      const existingSupervisors = new Set(existingRows.slice(1).map(row => row[0] ? row[0].toString().trim() : '').filter(Boolean));
      
      // Add any missing supervisors
      const missingNames = supervisorNames.filter(name => !existingSupervisors.has(name));
      
      if (missingNames.length > 0) {
        const newRows = missingNames.map(name => [name, '', 'FALSE', '', '']);
        await this.sheetsService.appendRange(`${TASK_ROTATION_SHEET}!A:E`, newRows);
        console.log(`Added ${missingNames.length} supervisors to Task Rotation sheet:`, missingNames);
      }
    } catch (error: any) {
      console.error('Failed to sync Task Rotation sheet:', error.message);
      // Don't throw - this is a secondary operation
    }
  }

  async addSupervisor(name: string, rank?: string): Promise<Supervisor> {
    // Get current headers
    const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A1:Z1`);
    const headers = rows.length > 0 ? rows[0] : ['Date Posted', 'Topic', 'Link'];
    
    // Check if supervisor already exists
    if (headers.includes(name)) {
      throw new Error('Supervisor already exists');
    }

    // Add new supervisor column
    headers.push(name);
    await this.sheetsService.writeRange(`${DISCUSSIONS_SHEET}!A1:Z1`, [headers]);

    // Add supervisor to Task Rotation sheet
    await this.addSupervisorToTaskRotation(name, rank || '');

    return {
      name,
      rank: rank || '',
      active: true,
      onLOA: false,
    };
  }

  private async addSupervisorToTaskRotation(name: string, rank: string = ''): Promise<void> {
    try {
      // Check if Task Rotation sheet exists and has data
      let existingRows: any[][] = [];
      try {
        existingRows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      } catch (error) {
        // Sheet might not exist or have no data
        console.log('Task Rotation sheet does not exist or has no data, will create it');
      }

      // If no rows exist, create header
      if (existingRows.length === 0) {
        await this.sheetsService.writeRange(`${TASK_ROTATION_SHEET}!A1:E1`, [TASK_ROTATION_HEADERS]);
        existingRows = [TASK_ROTATION_HEADERS];
      }

      // Check if supervisor already exists in Task Rotation
      const supervisorExists = existingRows.slice(1).some(row => row[0] === name);
      
      if (!supervisorExists) {
        // Add new supervisor to Task Rotation
        const newRow = [name, rank, 'FALSE', '', ''];
        await this.sheetsService.appendRange(`${TASK_ROTATION_SHEET}!A:E`, [newRow]);
        console.log(`Added ${name} to Task Rotation sheet`);
      }
    } catch (error: any) {
      console.error('Failed to add supervisor to Task Rotation sheet:', error.message);
      // Don't throw - this is a secondary operation
    }
  }

  async removeSupervisor(name: string): Promise<void> {
    const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A:Z`);
    
    if (rows.length === 0) {
      throw new Error('No data found in discussions sheet');
    }

    const headers = rows[0];
    const supervisorIndex = headers.indexOf(name);

    if (supervisorIndex === -1) {
      throw new Error('Supervisor not found');
    }

    // Remove the supervisor column from all rows
    const updatedRows = rows.map(row => {
      row.splice(supervisorIndex, 1);
      return row;
    });

    // Clear and rewrite
    await this.sheetsService.clearRange(`${DISCUSSIONS_SHEET}!A:Z`);
    await this.sheetsService.writeRange(`${DISCUSSIONS_SHEET}!A1:Z`, updatedRows);

    // Remove supervisor from Task Rotation sheet
    await this.removeSupervisorFromTaskRotation(name);
  }

  private async removeSupervisorFromTaskRotation(name: string): Promise<void> {
    try {
      const allRows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      
      if (allRows.length <= 1) {
        // Only header row or no data
        return;
      }

      // Find the row with this supervisor
      const rowIndex = allRows.findIndex((row, index) => index > 0 && row[0] === name);
      
      if (rowIndex !== -1) {
        // Remove the row
        allRows.splice(rowIndex, 1);
        
        // Clear and rewrite
        await this.sheetsService.clearRange(`${TASK_ROTATION_SHEET}!A2:E`);
        if (allRows.length > 1) {
          await this.sheetsService.writeRange(`${TASK_ROTATION_SHEET}!A2:E`, allRows.slice(1));
        }
        console.log(`Removed ${name} from Task Rotation sheet`);
      }
    } catch (error: any) {
      console.error('Failed to remove supervisor from Task Rotation sheet:', error.message);
      // Don't throw - this is a secondary operation
    }
  }

  private async getLOARecords(): Promise<any[][]> {
    try {
      return await this.sheetsService.readRange('LOA Tracking!A2:E');
    } catch (error) {
      // LOA sheet might not exist yet
      return [];
    }
  }
}
