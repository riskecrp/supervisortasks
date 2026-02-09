import { SheetsService } from './sheets.service';
import { Discussion } from '../types';

const DISCUSSIONS_SHEET = 'Discussions Pending Feedback';
const NAMES_SHEET = 'Names';

export class DiscussionsService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  async getAllDiscussions(): Promise<Discussion[]> {
    const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A:Z`);
    
    if (rows.length === 0) {
      return [];
    }

    // Filter out empty rows (skip header row)
    const dataRows = rows.slice(1).filter(row => {
      // Check if all values are empty/null/undefined
      const allEmpty = row.every(cell => !cell || cell.toString().trim() === '');
      // Check if the topic (second column) is empty
      const topicEmpty = !row[1] || row[1].toString().trim() === '';
      
      // Row is valid if it's not completely empty AND has a topic
      return !allEmpty && !topicEmpty;
    });

    // Get the headers from the Discussions sheet to map columns
    // Note: These should match the full names from the Names tab
    const headers = rows[0];
    const discussionSupervisors = headers.slice(3).map(h => h ? h.toString().trim() : '').filter(Boolean);

    return dataRows.map((row, index) => {
      const supervisorFeedback: Record<string, boolean> = {};
      
      discussionSupervisors.forEach((supervisor, i) => {
        if (supervisor) {
          supervisorFeedback[supervisor] = row[3 + i] === 'TRUE' || row[3 + i] === true || row[3 + i] === 'YES';
        }
      });

      return {
        id: `discussion-${index + 2}`,
        datePosted: row[0] || '',
        topic: row[1] || '',
        link: row[2] || '',
        supervisorFeedback,
      };
    });
  }

  async getDiscussion(id: string): Promise<Discussion | null> {
    const discussions = await this.getAllDiscussions();
    return discussions.find(d => d.id === id) || null;
  }

  async createDiscussion(discussion: Omit<Discussion, 'id'>): Promise<Discussion> {
    const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A:Z`);
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

    await this.sheetsService.appendRange(`${DISCUSSIONS_SHEET}!A:Z`, [newRow]);
    
    const discussions = await this.getAllDiscussions();
    return discussions[discussions.length - 1];
  }

  async updateDiscussionFeedback(id: string, supervisorName: string, completed: boolean): Promise<Discussion> {
    const rowNumber = parseInt(id.split('-')[1]);
    const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A:Z`);
    
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
      `${DISCUSSIONS_SHEET}!${columnLetter}${rowNumber}`,
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
    
    const allRows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A:Z`);
    allRows.splice(rowNumber - 1, 1);
    
    await this.sheetsService.clearRange(`${DISCUSSIONS_SHEET}!A2:Z`);
    if (allRows.length > 1) {
      await this.sheetsService.writeRange(`${DISCUSSIONS_SHEET}!A2:Z`, allRows.slice(1));
    }
  }

  async getSupervisorsFromDiscussions(): Promise<string[]> {
    // Read supervisor names from the Names tab instead of Discussions headers
    try {
      const rows = await this.sheetsService.readRange(`${NAMES_SHEET}!A:A`);
      if (rows.length === 0) {
        return [];
      }
      // Skip header row if present, and trim all names
      const names = rows.slice(1).map(row => row[0] ? row[0].toString().trim() : '').filter(Boolean);
      return names;
    } catch (error) {
      console.error('Failed to read from Names sheet, falling back to Discussions headers:', error);
      // Fallback to old behavior if Names sheet doesn't exist
      const rows = await this.sheetsService.readRange(`${DISCUSSIONS_SHEET}!A1:Z1`);
      if (rows.length === 0) {
        return [];
      }
      return rows[0].slice(3).map(h => h ? h.toString().trim() : '').filter(Boolean);
    }
  }
  
  async getSupervisorRanksFromNames(): Promise<Map<string, string>> {
    const rankMap = new Map<string, string>();
    try {
      const rows = await this.sheetsService.readRange(`${NAMES_SHEET}!A:B`);
      if (rows.length === 0) {
        return rankMap;
      }
      // Skip header row if present
      rows.slice(1).forEach(row => {
        const name = row[0] ? row[0].toString().trim() : '';
        const rank = row[1] ? row[1].toString().trim() : '';
        if (name) {
          rankMap.set(name, rank);
        }
      });
    } catch (error) {
      console.error('Failed to read ranks from Names sheet:', error);
    }
    return rankMap;
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
