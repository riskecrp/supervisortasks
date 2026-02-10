import { SheetsService } from './sheets.service';
import { LOARecord } from '../types';

const TASK_ROTATION_SHEET = 'Task Rotation';

export class LOAService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllLOARecords(): Promise<LOARecord[]> {
    const rows = await this.readTaskRotation();
    return rows
      .map((row, index) => {
        const supervisorName = (row[0] || '').toString().trim();
        const loaFlag = String(row[2] ?? '').toUpperCase() === 'TRUE' || row[2] === true;
        const startDate = row[3] || '';
        const endDate = row[4] || '';
        if (!supervisorName || !loaFlag) return null;
        return {
          id: `loa-${index + 2}`,
          supervisorName,
          startDate,
          endDate,
          reason: '',
          status: 'Active' as LOARecord['status'],
        };
      })
      .filter((r): r is LOARecord => r !== null);
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
    });

    await this.updateTaskRotationRow(record.supervisorName, {
      loa: true,
      startDate: record.startDate,
      endDate: record.endDate,
    });

    const records = await this.getAllLOARecords();
    const newRecord = records.find(r => r.supervisorName === record.supervisorName);
    if (!newRecord) {
      throw new Error('Failed to create LOA record: supervisor not found in Task Rotation');
    }
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
    const makeActive = updatedRecord.status !== 'Completed';

    await this.updateTaskRotationRow(updatedRecord.supervisorName, {
      loa: makeActive,
      startDate: makeActive ? updatedRecord.startDate : '',
      endDate: makeActive ? updatedRecord.endDate : '',
    });

    return updatedRecord;
  }

  async deleteLOARecord(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    console.log(`Deleting LOA record at row ${rowNumber}...`);
    
    // Read the Task Rotation sheet directly to get the supervisor name
    try {
      const rows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      
      if (rows.length < rowNumber) {
        throw new Error('LOA record not found');
      }
      
      // Get the supervisor name from the row
      // rowNumber is 1-indexed (sheet row number), rows is 0-indexed with header at index 0
      // So sheet row 2 (first data row) is at rows[1], hence rows[rowNumber - 1]
      const supervisorName = rows[rowNumber - 1][0];
      
      if (!supervisorName) {
        throw new Error('LOA record not found or invalid');
      }

      // Update the row to clear LOA status and dates
      await this.updateTaskRotationRow(supervisorName.toString().trim(), {
        loa: false,
        startDate: '',
        endDate: '',
      });
    } catch (error: any) {
      console.error('Failed to delete LOA record:', error.message);
      throw new Error(`Failed to delete LOA record: ${error.message}`);
    }
  }

  async getActiveLOA(): Promise<LOARecord[]> {
    const allRecords = await this.getAllLOARecords();
    return allRecords.filter(record => record.status === 'Active');
  }

  private async readTaskRotation(): Promise<any[][]> {
    try {
      const rows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      return rows.slice(1); // exclude header
    } catch (error: any) {
      console.error('Failed to read Task Rotation sheet:', error.message);
      return [];
    }
  }

  private async updateTaskRotationRow(
    supervisorName: string,
    data: { loa: boolean; startDate: string; endDate: string }
  ): Promise<void> {
    try {
      const normalizedName = supervisorName.trim();

      // Read all rows including header
      let rows: any[][] = [];
      try {
        rows = await this.sheetsService.readRange(`${TASK_ROTATION_SHEET}!A:E`);
      } catch (err) {
        // Sheet missing; create header
        await this.sheetsService.writeRange(`${TASK_ROTATION_SHEET}!A1:E1`, [
          ['Employee Name', 'Rank', 'LOA?', 'LOA Start Date', 'LOA End Date'],
        ]);
        rows = [['Employee Name', 'Rank', 'LOA?', 'LOA Start Date', 'LOA End Date']];
      }

      if (rows.length === 0) {
        rows = [['Employee Name', 'Rank', 'LOA?', 'LOA Start Date', 'LOA End Date']];
      }

      const bodyRows = rows.slice(1);
      const targetIndex = bodyRows.findIndex(
        row => (row[0] || '').toString().trim() === normalizedName
      );

      if (targetIndex === -1) {
        throw new Error(
          `Supervisor "${normalizedName}" not found in Task Rotation sheet. Verify the name exists in column A.`
        );
      }

      const rowNumber = targetIndex + 2; // account for header
      await this.sheetsService.writeRange(
        `${TASK_ROTATION_SHEET}!C${rowNumber}:E${rowNumber}`,
        [[data.loa ? 'TRUE' : 'FALSE', data.startDate || '', data.endDate || '']]
      );
    } catch (error: any) {
      console.error('Failed to update Task Rotation LOA data:', error.message);
      throw new Error(`Failed to update LOA status: ${error.message}`);
    }
  }
}
