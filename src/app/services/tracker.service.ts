import { Injectable } from '@angular/core';

export interface TrackerEntry {
  id: number;
  timestamp: string; // ISO format
  timeFormatted: string; // e.g., 04:30:15 PM
  dateFormatted: string; // e.g., Oct 6, 2026
  category: 'proposal' | 'letter' | 'coupon' | 'game' | 'input' | 'music' | 'visit';
  action: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private readonly STORAGE_KEY = 'love_activity_tracker_v2';
  private readonly WEBHOOK_STORAGE_KEY = 'love_tracker_gsheet_webhook_v1';

  public readonly googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1tUaj7q9J7yybEGtNE_NtEAolD3dLqZ2u3YyuZuaGyik/edit?usp=sharing';
  public webhookUrl: string = '';
  public isSyncingToSheet: boolean = false;
  public logs: TrackerEntry[] = [];

  constructor() {
    this.loadLogs();
    // Record visit on initial load
    this.logAction('visit', 'Proposal Website Opened 🌟', {
      screen: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent.slice(0, 100),
      referrer: document.referrer || 'Direct Link / WhatsApp'
    });
  }

  private loadLogs(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.logs = JSON.parse(data);
      }
      const savedWebhook = localStorage.getItem(this.WEBHOOK_STORAGE_KEY);
      if (savedWebhook) {
        this.webhookUrl = savedWebhook;
      }
      // Auto-load webhook from URL query param if provided in girlfriend link (?hook= or ?sync=)
      const params = new URLSearchParams(window.location.search);
      const hookParam = params.get('hook') || params.get('sync');
      if (hookParam) {
        this.setWebhookUrl(hookParam);
      }
    } catch (e) {
      console.warn('Tracker failed to load logs:', e);
    }
  }

  public isValidWebhookUrl(url: string): boolean {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('https://script.google.com/') || trimmed.startsWith('https://script.googleusercontent.com/');
  }

  public isSpreadsheetDocUrl(url: string): boolean {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.includes('docs.google.com/spreadsheets');
  }

  public setWebhookUrl(url: string): void {
    this.webhookUrl = (url || '').trim();
    try {
      if (this.webhookUrl) {
        localStorage.setItem(this.WEBHOOK_STORAGE_KEY, this.webhookUrl);
      } else {
        localStorage.removeItem(this.WEBHOOK_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save webhook URL:', e);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Tracker failed to save logs:', e);
    }
  }

  public logAction(
    category: 'proposal' | 'letter' | 'coupon' | 'game' | 'input' | 'music' | 'visit',
    action: string,
    details?: any
  ): void {
    const now = new Date();
    const entry: TrackerEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateFormatted: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      category,
      action,
      details: details !== undefined ? details : null
    };

    // Store up to 250 recent events
    this.logs.unshift(entry);
    if (this.logs.length > 250) {
      this.logs = this.logs.slice(0, 250);
    }
    this.saveLogs();

    // Live Webhook sync to Google Sheet (if configured)
    if (this.webhookUrl) {
      this.sendToWebhook(entry);
    }
  }

  public get proposalStatus(): string {
    const yesLog = this.logs.find(l => l.category === 'proposal' && l.action.includes('YES'));
    if (yesLog) {
      return `Said YES at ${yesLog.timeFormatted} (${yesLog.dateFormatted}) ❤️`;
    }
    return 'Pending / Not Accepted Yet';
  }

  public get noAttemptsCount(): number {
    return this.logs.filter(l => l.category === 'proposal' && l.action.includes('NO')).length;
  }

  public get couponsRedeemedCount(): number {
    return this.logs.filter(l => l.category === 'coupon').length;
  }

  public get lettersOpenedCount(): number {
    const letterLogs = this.logs.filter(l => l.category === 'letter');
    const unique = new Set(letterLogs.map(l => l.details?.letterId || l.action));
    return unique.size;
  }

  public get gamesPlayedCount(): number {
    return this.logs.filter(l => l.category === 'game').length;
  }

  public get inputsCount(): number {
    return this.logs.filter(l => l.category === 'input').length;
  }

  // --- Export File Download: Human-Readable Summary (.txt) ---
  public downloadTextReport(): void {
    let report = `===========================================================\n`;
    report += `          ❤️ LOVE STORY ACTIVITY TRACKER REPORT ❤️          \n`;
    report += `===========================================================\n`;
    report += `Generated At: ${new Date().toLocaleString()}\n`;
    report += `Total Actions Recorded: ${this.logs.length}\n`;
    report += `Proposal Status: ${this.proposalStatus}\n`;
    report += `Times Tried to Click 'NO': ${this.noAttemptsCount}\n`;
    report += `Unique Letters Read: ${this.lettersOpenedCount}\n`;
    report += `Coupons Redeemed: ${this.couponsRedeemedCount}\n\n`;
    report += `===========================================================\n`;
    report += `ACTIVITY LOG TIMELINE (Newest First):\n`;
    report += `===========================================================\n\n`;

    this.logs.forEach((log, index) => {
      report += `[${log.dateFormatted} - ${log.timeFormatted}] #${log.id}\n`;
      report += `Type: [${log.category.toUpperCase()}] | Action: ${log.action}\n`;
      if (log.details) {
        report += `Details: ${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}\n`;
      }
      report += `-----------------------------------------------------------\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-activity-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Export File Download: Structured Data (.json) ---
  public downloadJsonReport(): void {
    const exportData = {
      summary: {
        generatedAt: new Date().toISOString(),
        totalLogs: this.logs.length,
        proposalStatus: this.proposalStatus,
        noAttempts: this.noAttemptsCount,
        lettersRead: this.lettersOpenedCount,
        couponsRedeemed: this.couponsRedeemedCount
      },
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-activity-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Universal Clipboard Copy (Supports modern API + mobile fallback) ---
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // Fallback below
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      return false;
    }
  }

  // --- Copy Summary to Clipboard ---
  public async copyReportText(): Promise<boolean> {
    let report = `❤️ LOVE ACTIVITY SUMMARY:\n`;
    report += `Proposal Status: ${this.proposalStatus}\n`;
    report += `No Button Escapes: ${this.noAttemptsCount} times\n`;
    report += `Letters Read: ${this.lettersOpenedCount}\n`;
    report += `Coupons Redeemed: ${this.couponsRedeemedCount}\n\n`;
    report += `Recent Actions (Last 15):\n`;

    this.logs.slice(0, 15).forEach(l => {
      report += `• [${l.timeFormatted}] ${l.action}\n`;
    });

    return this.copyToClipboard(report);
  }

  // --- Format Tabular TSV String (Headers + All Rows) ---
  public getTabularTsvContent(): string {
    const headers = ['ID', 'Date', 'Time', 'Category', 'Action', 'Details', 'Timestamp'];
    const rows = this.logs.map(log => [
      log.id,
      this.formatTsvField(log.dateFormatted),
      this.formatTsvField(log.timeFormatted),
      this.formatTsvField(log.category.toUpperCase()),
      this.formatTsvField(log.action),
      this.formatTsvField(log.details),
      this.formatTsvField(log.timestamp)
    ].join('\t'));

    return [headers.join('\t'), ...rows].join('\n');
  }

  // --- Copy Tabular TSV for Google Sheets (Direct 1-Click Paste into Cell A1) ---
  public async copySheetsTabularData(): Promise<boolean> {
    const tsvContent = this.getTabularTsvContent();
    return this.copyToClipboard(tsvContent);
  }

  // --- Download CSV Report Formatted for Google Sheets Import ---
  public downloadCsvReport(): void {
    const headers = ['ID', 'Date', 'Time', 'Category', 'Action', 'Details', 'Timestamp'];
    const rows = this.logs.map(log => [
      this.escapeCsvField(log.id),
      this.escapeCsvField(log.dateFormatted),
      this.escapeCsvField(log.timeFormatted),
      this.escapeCsvField(log.category.toUpperCase()),
      this.escapeCsvField(log.action),
      this.escapeCsvField(log.details),
      this.escapeCsvField(log.timestamp)
    ].join(','));

    // UTF-8 BOM (\uFEFF) ensures emojis & special characters display properly in Google Sheets / Excel
    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-tracker-google-sheets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Send single event to Google Apps Script Webhook ---
  public async sendToWebhook(entry: TrackerEntry): Promise<void> {
    if (!this.webhookUrl || !this.isValidWebhookUrl(this.webhookUrl)) return;
    try {
      // Use text/plain with mode: 'no-cors' so browser avoids CORS OPTIONS preflight
      await fetch(this.webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.warn('Webhook sync error:', err);
    }
  }

  // --- Batch Sync all existing logs to Google Apps Script Webhook ---
  public async syncAllToGoogleSheetWebhook(): Promise<{ success: boolean; count: number }> {
    if (!this.webhookUrl) {
      throw new Error('Please enter your Google Apps Script Web App URL first.');
    }
    if (this.isSpreadsheetDocUrl(this.webhookUrl)) {
      throw new Error('The URL entered is the spreadsheet view link, not a Web App URL. Deploy as Web App first!');
    }
    if (!this.isValidWebhookUrl(this.webhookUrl)) {
      throw new Error('Invalid URL. Web App URL should start with https://script.google.com/macros/s/...');
    }

    this.isSyncingToSheet = true;
    try {
      // Send entries in chronological order (oldest to newest)
      const toSync = [...this.logs].reverse();
      for (const entry of toSync) {
        await fetch(this.webhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(entry)
        });
        // Small delay to prevent hitting Apps Script rate limits
        await new Promise(r => setTimeout(r, 60));
      }
      this.isSyncingToSheet = false;
      return { success: true, count: toSync.length };
    } catch (err) {
      this.isSyncingToSheet = false;
      throw err;
    }
  }

  private escapeCsvField(val: any): string {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  private formatTsvField(val: any): string {
    if (val === null || val === undefined) return '';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return str.replace(/[\t\r\n]/g, ' ');
  }

  public clearLogs(): void {
    if (confirm('Are you sure you want to clear all tracked activity history?')) {
      this.logs = [];
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
