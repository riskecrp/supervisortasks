import { SheetsService } from './sheets.service';
import { LOARecord } from '../types';

const LOA_SHEET = 'LOA Tracking';
const TASK_ROTATION_SHEET = 'Task Rotation';

export class LOAService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllLOARecords(): Promise<LOARecord[]> {
    try {
      const rows = await this.sheetsService.readRange(`${LOA_SHEET}!A2:E`);
      
      return rows.map((row, index) => ({
        id: `loa-${index + 2}`,
        supervisorName: row[0] || '',
        startDate: row[1] || '',
        endDate: row[2] || '',
        reason: row[3] || '',
        status: (row[4] as any) || 'Active',
      }));
    } catch (error) {
      console.error('Failed to get LOA records:', error);
      return [];
    }
  }

  async getLOARecord(id: string): Promise<LOARecord | null> {
    const records = await this.getAllLOARecords();
    return records.find(r => r.id === id) || null;
  }

  async createLOARecord(record: Omit<LOARecord, 'id'>): Promise<LOARecord> {
    const newRow = [
      record.supervisorName,
      record.startDate,
      record.endDate,
      record.reason,
      record.status || 'Active',
    ];

    try {
      await this.sheetsService.appendRange(`${LOA_SHEET}!A:E`, [newRow]);
    } catch (error) {
      // If sheet doesn't exist, create it first
      console.error('LOA sheet might not exist, attempting to create header row');
      await this.sheetsService.writeRange(`${LOA_SHEET}!A1:E1`, [
        ['Supervisor Name', 'Start Date', 'End Date', 'Reason', 'Status']
      ]);
      await this.sheetsService.appendRange(`${LOA_SHEET}!A:E`, [newRow]);
    }
    
    // Sync to Task Rotation tab
    await this.syncToTaskRotation();
    
    const records = await this.getAllLOARecords();
    return records[records.length - 1];
  }

  async updateLOARecord(id: string, updates: Partial<LOARecord>): Promise<LOARecord> {
    const rowNumber = parseInt(id.split('-')[1]);
    const currentRecord = await this.getLOARecord(id);
    
    if (!currentRecord) {
      throw new Error('LOA record not found');
    }

    const updatedRecord = { ...currentRecord, ...updates };
    
    const updatedRow = [
      updatedRecord.supervisorName,
      updatedRecord.startDate,
      updatedRecord.endDate,
      updatedRecord.reason,
      updatedRecord.status,
    ];

    await this.sheetsService.writeRange(`${LOA_SHEET}!A${rowNumber}:E${rowNumber}`, [updatedRow]);
    
    // Sync to Task Rotation tab
    await this.syncToTaskRotation();
    
    return updatedRecord;
  }

  async deleteLOARecord(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    const allRows = await this.sheetsService.readRange(`${LOA_SHEET}!A:E`);
    allRows.splice(rowNumber - 1, 1);
    
    await this.sheetsService.clearRange(`${LOA_SHEET}!A2:E`);
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(`${LOA_SHEET}!A2:E`, allRows.slice(1));
    }
    
    // Sync to Task Rotation tab
    await this.syncToTaskRotation();
  }

  async getActiveLOA(): Promise<LOARecord[]> {
    const allRecords = await this.getAllLOARecords();
    return allRecords.filter(record => record.status === 'Active');
  }

  async syncToTaskRotation(): Promise<void> {
    try {
      // Read all supervisors from Task Rotation sheet
      const taskRotationRows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A2:E`);
      
      // Get all active LOA records
      const activeLOARecords = await this.getActiveLOA();
      
      // Create a map of supervisor names to LOA records
      const loaMap = new Map<string, LOARecord>();
      activeLOARecords.forEach(loa => {
        loaMap.set(loa.supervisorName, loa);
      });
      
      // Update Task Rotation rows
      const updatedRows = taskRotationRows.map(row => {
        const supervisorName = row[0] || '';
        const rank = row[1] || '';
        
        const loaRecord = loaMap.get(supervisorName);
        
        if (loaRecord) {
          // Supervisor has active LOA
          return [
            supervisorName,
            rank,
            'TRUE',
            loaRecord.startDate,
            loaRecord.endDate,
          ];
        } else {
          // No active LOA
          return [
            supervisorName,
            rank,
            'FALSE',
            '',
            '',
          ];
        }
      });
      
      // Write back to Task Rotation sheet
      if (updatedRows.length > 0) {
        await this.sheetsService.writeRange(`${TASK_ROTATION_SHEET}!A2:E${updatedRows.length + 1}`, updatedRows);
      }
      
      console.log('Successfully synced LOA data to Task Rotation sheet');
    } catch (error) {
      console.error('Failed to sync to Task Rotation sheet:', error);
      // Don't throw error - this is a secondary operation
    }
  }
}
