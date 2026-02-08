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
      console.log(`Reading all LOA records from ${LOA_SHEET}...`);
      const rows = await this.sheetsService.readRange(`${LOA_SHEET}!A2:E`);
      console.log(`Found ${rows.length} LOA record rows`);
      
      return rows.map((row, index) => ({
        id: `loa-${index + 2}`,
        supervisorName: row[0] || '',
        startDate: row[1] || '',
        endDate: row[2] || '',
        reason: row[3] || '',
        status: (row[4] as any) || 'Active',
      }));
    } catch (error: any) {
      console.error('Failed to get LOA records:', {
        error: error.message,
        stack: error.stack,
        sheet: LOA_SHEET,
      });
      return [];
    }
  }

  async getLOARecord(id: string): Promise<LOARecord | null> {
    const records = await this.getAllLOARecords();
    return records.find(r => r.id === id) || null;
  }

  async createLOARecord(record: Omit<LOARecord, 'id'>): Promise<LOARecord> {
    console.log('Creating LOA record:', {
      supervisorName: record.supervisorName,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status || 'Active',
      // Reason omitted for privacy
    });

    const newRow = [
      record.supervisorName,
      record.startDate,
      record.endDate,
      record.reason,
      record.status || 'Active',
    ];

    try {
      console.log(`Attempting to append to ${LOA_SHEET} sheet...`);
      await this.sheetsService.appendRange(`${LOA_SHEET}!A:E`, [newRow]);
      console.log('Successfully appended LOA record to sheet');
    } catch (error: any) {
      // If sheet doesn't exist, create it first
      console.error('Failed to append LOA record, attempting to create header row:', {
        error: error.message,
        sheet: LOA_SHEET,
        stack: error.stack,
        // Data omitted for privacy
      });
      
      try {
        console.log(`Creating header row for ${LOA_SHEET} sheet...`);
        await this.sheetsService.writeRange(`${LOA_SHEET}!A1:E1`, [
          ['Supervisor Name', 'Start Date', 'End Date', 'Reason', 'Status']
        ]);
        console.log('Header row created successfully');
        
        console.log('Retrying append operation...');
        await this.sheetsService.appendRange(`${LOA_SHEET}!A:E`, [newRow]);
        console.log('Successfully appended LOA record after creating header');
      } catch (retryError: any) {
        console.error('Failed to create LOA record after retry:', {
          error: retryError.message,
          stack: retryError.stack,
          sheet: LOA_SHEET,
          // Data omitted for privacy
        });
        throw new Error(`Failed to create LOA record: ${retryError.message}`);
      }
    }
    
    // Sync to Task Rotation tab
    try {
      console.log('Syncing LOA data to Task Rotation sheet...');
      await this.syncToTaskRotation();
      console.log('Successfully synced to Task Rotation sheet');
    } catch (syncError: any) {
      console.error('Failed to sync to Task Rotation sheet (non-fatal):', {
        error: syncError.message,
        stack: syncError.stack,
      });
      // Don't throw - this is a secondary operation
    }
    
    console.log('Fetching updated LOA records...');
    const records = await this.getAllLOARecords();
    const newRecord = records[records.length - 1];
    
    if (!newRecord) {
      throw new Error('Failed to create LOA record: Record not found after creation');
    }
    
    console.log('LOA record created successfully with ID:', newRecord.id);
    return newRecord;
  }

  async updateLOARecord(id: string, updates: Partial<LOARecord>): Promise<LOARecord> {
    const rowNumber = parseInt(id.split('-')[1]);
    console.log(`Updating LOA record at row ${rowNumber}`, {
      id,
      updatedFields: Object.keys(updates),
      // Values omitted for privacy
    });
    
    const currentRecord = await this.getLOARecord(id);
    
    if (!currentRecord) {
      console.error(`LOA record not found: ${id}`);
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

    try {
      console.log(`Writing updated LOA record to row ${rowNumber}...`);
      await this.sheetsService.writeRange(`${LOA_SHEET}!A${rowNumber}:E${rowNumber}`, [updatedRow]);
      console.log('Successfully updated LOA record');
    } catch (error: any) {
      console.error('Failed to update LOA record:', {
        error: error.message,
        stack: error.stack,
        id,
        rowNumber,
        // Data omitted for privacy
      });
      throw new Error(`Failed to update LOA record: ${error.message}`);
    }
    
    // Sync to Task Rotation tab
    try {
      console.log('Syncing to Task Rotation after update...');
      await this.syncToTaskRotation();
    } catch (syncError: any) {
      console.error('Failed to sync after update (non-fatal):', syncError.message);
    }
    
    return updatedRecord;
  }

  async deleteLOARecord(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    console.log(`Deleting LOA record at row ${rowNumber}...`);
    
    try {
      const allRows = await this.sheetsService.readRange(`${LOA_SHEET}!A:E`);
      console.log(`Total rows before delete: ${allRows.length}`);
      
      allRows.splice(rowNumber - 1, 1);
      console.log(`Total rows after delete: ${allRows.length}`);
      
      await this.sheetsService.clearRange(`${LOA_SHEET}!A2:E`);
      if (allRows.length > 1) {
        await this.sheetsService.writeRange(`${LOA_SHEET}!A2:E`, allRows.slice(1));
      }
      console.log('Successfully deleted LOA record');
    } catch (error: any) {
      console.error('Failed to delete LOA record:', {
        error: error.message,
        stack: error.stack,
        id,
        rowNumber,
      });
      throw new Error(`Failed to delete LOA record: ${error.message}`);
    }
    
    // Sync to Task Rotation tab
    try {
      console.log('Syncing to Task Rotation after delete...');
      await this.syncToTaskRotation();
    } catch (syncError: any) {
      console.error('Failed to sync after delete (non-fatal):', syncError.message);
    }
  }

  async getActiveLOA(): Promise<LOARecord[]> {
    const allRecords = await this.getAllLOARecords();
    return allRecords.filter(record => record.status === 'Active');
  }

  async syncToTaskRotation(): Promise<void> {
    try {
      console.log(`Reading Task Rotation sheet: ${TASK_ROTATION_SHEET}...`);
      // Read all supervisors from Task Rotation sheet
      const taskRotationRows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A2:E`);
      console.log(`Found ${taskRotationRows.length} rows in Task Rotation sheet`);
      
      // Get all active LOA records
      console.log('Fetching active LOA records...');
      const activeLOARecords = await this.getActiveLOA();
      console.log(`Found ${activeLOARecords.length} active LOA records`);
      
      // Create a map of supervisor names to LOA records
      const loaMap = new Map<string, LOARecord>();
      activeLOARecords.forEach(loa => {
        loaMap.set(loa.supervisorName, loa);
      });
      console.log(`Mapped ${loaMap.size} supervisors with active LOA`);
      
      // Update Task Rotation rows
      let activeLOACount = 0;
      const updatedRows = taskRotationRows.map(row => {
        const supervisorName = row[0] || '';
        const rank = row[1] || '';
        
        const loaRecord = loaMap.get(supervisorName);
        
        if (loaRecord) {
          // Supervisor has active LOA
          activeLOACount++;
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
      console.log(`Updated ${activeLOACount} supervisors to LOA=TRUE`);
      
      // Write back to Task Rotation sheet
      if (updatedRows.length > 0) {
        const range = `${TASK_ROTATION_SHEET}!A2:E${updatedRows.length + 1}`;
        console.log(`Writing ${updatedRows.length} updated rows to ${range}...`);
        await this.sheetsService.writeRange(range, updatedRows);
        console.log('Successfully synced LOA data to Task Rotation sheet');
      } else {
        console.log('No rows to update in Task Rotation sheet');
      }
    } catch (error: any) {
      console.error('Failed to sync to Task Rotation sheet:', {
        error: error.message,
        stack: error.stack,
        sheet: TASK_ROTATION_SHEET,
      });
      // Don't throw error - this is a secondary operation
    }
  }
}
