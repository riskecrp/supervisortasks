import { SheetsService } from './sheets.service';

/**
 * Utility to inspect and validate the Google Sheets structure
 */
export class SheetsValidationService {
  private sheetsService: SheetsService;

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService;
  }

  /**
   * Validate the Tasks sheet structure and provide detailed feedback
   */
  async validateTasksSheet(): Promise<{
    valid: boolean;
    issues: string[];
    suggestions: string[];
    sheetData: any;
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let sheetData: any = {};

    try {
      // Read the first few rows to inspect structure
      const headerRange = this.sheetsService.buildRange('Tasks', 'A1:Z1');
      const dataRange = this.sheetsService.buildRange('Tasks', 'A2:Z10');

      console.log('Validating Tasks sheet structure...');

      // Read headers
      const headers = await this.sheetsService.readRange(headerRange);
      if (headers.length === 0) {
        issues.push('No headers found in row 1');
        suggestions.push('Add column headers in row 1: Task, Claimed By, Status, Completed Date, Created Date');
        return { valid: false, issues, suggestions, sheetData: {} };
      }

      const headerRow = headers[0];
      sheetData.headers = headerRow;
      console.log('Found headers:', headerRow);

      // Expected headers
      const expectedHeaders = ['Task', 'Claimed By', 'Status', 'Completed Date', 'Created Date'];
      
      // Check if headers match expected structure
      const headersMatch = headerRow.length >= 5 &&
        headerRow[0] === expectedHeaders[0] &&
        headerRow[1] === expectedHeaders[1] &&
        headerRow[2] === expectedHeaders[2] &&
        headerRow[3] === expectedHeaders[3] &&
        headerRow[4] === expectedHeaders[4];

      if (!headersMatch) {
        issues.push('Header row does not match expected structure');
        console.log('Expected headers:', expectedHeaders);
        console.log('Actual headers:', headerRow.slice(0, 5));
        suggestions.push(`Current headers in columns A-E: [${headerRow.slice(0, 5).join(', ')}]`);
        suggestions.push(`Expected headers: [${expectedHeaders.join(', ')}]`);
        suggestions.push('Update row 1 to have the correct headers, or update the code to match your sheet structure');
      }

      // Read sample data
      const dataRows = await this.sheetsService.readRange(dataRange);
      sheetData.sampleRows = dataRows.slice(0, 3);
      console.log(`Found ${dataRows.length} data rows`);

      if (dataRows.length === 0) {
        issues.push('No data rows found (sheet appears empty)');
        suggestions.push('Add task data starting from row 2');
        return { valid: false, issues, suggestions, sheetData };
      }

      // Analyze sample data
      const validStatuses = ['Assigned', 'Claimed', 'Pending Reach Out', 'Pending Meeting', 'Pending Employee Reach Out', 'Pending Discussion', 'Completed'];
      let invalidStatusCount = 0;
      let emptySupervisorCount = 0;

      dataRows.forEach((row, idx) => {
        if (row.length > 0 && row[0]) { // Has task name
          const task = row[0];
          const claimedBy = row[1];
          const status = row[2];

          console.log(`Row ${idx + 2}: Task="${task}", ClaimedBy="${claimedBy}", Status="${status}"`);

          // Check claimed by
          if (!claimedBy || claimedBy.toString().trim() === '') {
            emptySupervisorCount++;
          }

          // Check status
          if (status && !validStatuses.includes(status.toString())) {
            invalidStatusCount++;
            if (idx < 3) { // Only log first few
              issues.push(`Row ${idx + 2}: Invalid status "${status}" (valid options: ${validStatuses.join(', ')})`);
            }
          }
        }
      });

      if (emptySupervisorCount > 0) {
        issues.push(`${emptySupervisorCount} tasks have empty "Claimed By" values`);
        suggestions.push('Fill in the "Claimed By" column (column B) with supervisor names');
      }

      if (invalidStatusCount > 0) {
        issues.push(`${invalidStatusCount} tasks have invalid status values`);
        suggestions.push(`Ensure status values (column C) are one of: ${validStatuses.join(', ')}`);
      }

      const valid = issues.length === 0;
      
      if (valid) {
        console.log('✅ Tasks sheet structure is valid');
      } else {
        console.log('❌ Tasks sheet has validation issues');
      }

      return { valid, issues, suggestions, sheetData };
    } catch (error: any) {
      console.error('Error validating sheet:', error.message);
      issues.push(`Failed to read sheet: ${error.message}`);
      
      if (error.message.includes('Unable to parse range') || error.message.includes('not found')) {
        suggestions.push('The "Tasks" sheet tab may not exist. Check that you have a tab named exactly "Tasks" (case-sensitive)');
      } else if (error.message.includes('permission')) {
        suggestions.push('The service account may not have access to the spreadsheet. Share the sheet with the service account email and give it Editor permissions');
      } else if (error.message.includes('credentials')) {
        suggestions.push('Google Sheets credentials are not configured. Check backend/.env or credentials.json file');
      }

      return { valid: false, issues, suggestions, sheetData: {} };
    }
  }

  /**
   * Get a summary of what data is currently in the Tasks sheet
   */
  async getTasksSummary(): Promise<string> {
    try {
      const validation = await this.validateTasksSheet();
      
      let summary = '=== Tasks Sheet Summary ===\n\n';
      
      if (validation.sheetData.headers) {
        summary += `Headers (Row 1): ${validation.sheetData.headers.slice(0, 10).join(' | ')}\n\n`;
      }
      
      if (validation.sheetData.sampleRows && validation.sheetData.sampleRows.length > 0) {
        summary += 'Sample Data (First 3 rows):\n';
        validation.sheetData.sampleRows.forEach((row: any[], idx: number) => {
          summary += `Row ${idx + 2}: ${row.slice(0, 5).join(' | ')}\n`;
        });
        summary += '\n';
      }
      
      if (validation.issues.length > 0) {
        summary += 'Issues Found:\n';
        validation.issues.forEach(issue => {
          summary += `  ⚠️  ${issue}\n`;
        });
        summary += '\n';
      }
      
      if (validation.suggestions.length > 0) {
        summary += 'Suggestions:\n';
        validation.suggestions.forEach(suggestion => {
          summary += `  💡 ${suggestion}\n`;
        });
      }
      
      if (validation.valid) {
        summary += '\n✅ Sheet structure is valid!\n';
      } else {
        summary += '\n❌ Sheet needs attention before it can be used.\n';
      }
      
      return summary;
    } catch (error: any) {
      return `Error generating summary: ${error.message}`;
    }
  }
}
