import { SheetsService } from './sheets.service';
import { LOARecord } from '../types';

const LOA_SHEET = 'LOA Tracking';

export class LOAService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllLOARecords(): Promise<LOARecord[]> {
    try {
      const allRows = await this.sheetsService.readRange(`${LOA_SHEET}!A:E`);
      const rows = allRows.slice(1); // Skip header row
      
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
  }

  async getActiveLOA(): Promise<LOARecord[]> {
    const allRecords = await this.getAllLOARecords();
    return allRecords.filter(record => record.status === 'Active');
  }
}
