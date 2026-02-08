import { SheetsService } from './sheets.service';
import { Discussion } from '../types';

const DISCUSSIONS_SHEET = 'Discussions Pending Feedback';

export class DiscussionsService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllDiscussions(): Promise<Discussion[]> {
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    
    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const supervisors = headers.slice(3); // Supervisors start from column D (index 3)

    // Filter out empty rows while tracking original row numbers (skip header row)
    const discussions: Discussion[] = [];
    rows.slice(1).forEach((row, index) => {
      // Check if all values are empty/null/undefined
      const allEmpty = row.every(cell => !cell || cell.toString().trim() === '');
      // Check if the topic (second column) is empty
      const topicEmpty = !row[1] || row[1].toString().trim() === '';
      
      // Only include row if it's not completely empty AND has a topic
      if (!allEmpty && !topicEmpty) {
        const supervisorFeedback: Record<string, boolean> = {};
        
        supervisors.forEach((supervisor, i) => {
          if (supervisor) {
            supervisorFeedback[supervisor] = row[3 + i] === 'TRUE' || row[3 + i] === true || row[3 + i] === 'YES';
          }
        });

        discussions.push({
          id: `discussion-${index + 2}`, // Use original row number (index + 2 because row 1 is header, so data starts at row 2)
          datePosted: row[0] || '',
          topic: row[1] || '',
          link: row[2] || '',
          supervisorFeedback,
        });
      }
    });

    return discussions;
  }

  async getDiscussion(id: string): Promise<Discussion | null> {
    const discussions = await this.getAllDiscussions();
    return discussions.find(d => d.id === id) || null;
  }

  async createDiscussion(discussion: Omit<Discussion, 'id'>): Promise<Discussion> {
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    const headers = rows.length > 0 ? rows[0] : [];
    const supervisors = headers.slice(3);

    const newRow = [
      discussion.datePosted,
      discussion.topic,
      discussion.link,
    ];

    // Add empty feedback for each supervisor
    supervisors.forEach(() => {
      newRow.push('');
    });

    await this.sheetsService.appendRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'), [newRow]);
    
    const discussions = await this.getAllDiscussions();
    return discussions[discussions.length - 1];
  }

  async updateDiscussionFeedback(id: string, supervisorName: string, completed: boolean): Promise<Discussion> {
    const rowNumber = parseInt(id.split('-')[1]);
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    
    if (rows.length === 0) {
      throw new Error('No discussions found');
    }

    const headers = rows[0];
    const supervisorIndex = headers.indexOf(supervisorName);

    if (supervisorIndex === -1) {
      throw new Error('Supervisor not found in discussions sheet');
    }

    const columnLetter = this.numberToColumn(supervisorIndex + 1);
    const value = completed ? 'TRUE' : '';
    
    await this.sheetsService.writeRange(
      this.sheetsService.buildRange(DISCUSSIONS_SHEET, `${columnLetter}${rowNumber}`),
      [[value]]
    );

    const discussion = await this.getDiscussion(id);
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    return discussion;
  }

  async deleteDiscussion(id: string): Promise<void> {
    const rowNumber = parseInt(id.split('-')[1]);
    
    const allRows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A:Z'));
    allRows.splice(rowNumber - 1, 1);
    
    await this.sheetsService.clearRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A2:Z'));
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A2:Z'), allRows.slice(1));
    }
  }

  async getSupervisorsFromDiscussions(): Promise<string[]> {
    const rows = await this.sheetsService.readRange(this.sheetsService.buildRange(DISCUSSIONS_SHEET, 'A1:Z1'));
    if (rows.length === 0) {
      return [];
    }
    return rows[0].slice(3).filter(Boolean);
  }

  private numberToColumn(num: number): string {
    let column = '';
    while (num > 0) {
      const remainder = (num - 1) % 26;
      column = String.fromCharCode(65 + remainder) + column;
      num = Math.floor((num - 1) / 26);
    }
    return column;
  }
}
