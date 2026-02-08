import { google } from 'googleapis';
import * as fs from 'fs';

export class SheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
    
    let auth;
    
    // Try credentials file first
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      // Use environment variables
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {
      throw new Error('Google credentials not configured. Set either GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY');
    }

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async readRange(range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });
      return response.data.values || [];
    } catch (error: any) {
      console.error(`Error reading range ${range}:`, error.message);
      throw new Error(`Failed to read from Google Sheets: ${error.message}`);
    }
  }

  async writeRange(range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error: any) {
      console.error(`Error writing to range ${range}:`, error.message);
      throw new Error(`Failed to write to Google Sheets: ${error.message}`);
    }
  }

  async appendRange(range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values,
        },
      });
    } catch (error: any) {
      console.error(`Error appending to range ${range}:`, error.message);
      throw new Error(`Failed to append to Google Sheets: ${error.message}`);
    }
  }

  async clearRange(range: string): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range,
      });
    } catch (error: any) {
      console.error(`Error clearing range ${range}:`, error.message);
      throw new Error(`Failed to clear Google Sheets range: ${error.message}`);
    }
  }

  async batchUpdate(requests: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests,
        },
      });
    } catch (error: any) {
      console.error('Error in batch update:', error.message);
      throw new Error(`Failed to batch update Google Sheets: ${error.message}`);
    }
  }

  async getSheetMetadata() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting sheet metadata:', error.message);
      throw new Error(`Failed to get sheet metadata: ${error.message}`);
    }
  }
}
