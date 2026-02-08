import { SheetsService } from './sheets.service';
import { Supervisor } from '../types';
import { DiscussionsService } from './discussions.service';

const DISCUSSIONS_SHEET = 'Discussions Pending Feedback';

export class SupervisorsService {
  private sheetsService: SheetsService;
  private discussionsService: DiscussionsService;

  constructor(sheetsService: SheetsService, discussionsService: DiscussionsService) {
    this.sheetsService = sheetsService;
    this.discussionsService = discussionsService;
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    const supervisorNames = await this.discussionsService.getSupervisorsFromDiscussions();
    
    // Get LOA status for each supervisor
    const loaRecords = await this.getLOARecords();
    const activeLOA = loaRecords.filter(loa => loa[4] === 'Active');
    const supervisorsOnLOA = activeLOA.map(loa => loa[0]);

    return supervisorNames.map(name => ({
      name,
      active: true,
      onLOA: supervisorsOnLOA.includes(name),
    }));
  }

  async addSupervisor(name: string): Promise<Supervisor> {
    // Get current headers
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A1:Z1'));
    const headers = rows.length > 0 ? rows[0] : ['Date Posted', 'Topic', 'Link'];
    
    // Check if supervisor already exists
    if (headers.includes(name)) {
      throw new Error('Supervisor already exists');
    }

    // Add new supervisor column
    headers.push(name);
    await this.sheetsService.writeRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A1:Z1'), [headers]);

    return {
      name,
      active: true,
      onLOA: false,
    };
  }

  async removeSupervisor(name: string): Promise<void> {
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    
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
    await this.sheetsService.clearRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    await this.sheetsService.writeRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A1:Z'), updatedRows);
  }

  private async getLOARecords(): Promise<any[][]> {
    try {
      return await this.sheetsService.readRange(this.sheetsService.buildRange('LOA Tracking', 'A2:E1000'));
    } catch (error) {
      // LOA sheet might not exist yet
      return [];
    }
  }
}
