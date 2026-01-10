/**
 * Excel Export Hook
 * 
 * Provides functionality to export data to Excel files using exceljs
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { useToast } from '@/context/useToast';

interface ExportColumn<T> {
  key: keyof T | '#';
  header: string;
  width?: number;
}

interface UseExcelExportOptions<T> {
  /** File name prefix (without extension) */
  fileNamePrefix: string;
  /** Column definitions */
  columns: ExportColumn<T>[];
  /** Sheet name */
  sheetName?: string;
}

interface UseExcelExportReturn<T> {
  /** Export data to Excel */
  exportToExcel: (data: T[]) => Promise<void>;
  /** Whether export is in progress */
  exporting: boolean;
}

/**
 * Hook for exporting data to Excel files
 */
export function useExcelExport<T extends object>(
  options: UseExcelExportOptions<T>
): UseExcelExportReturn<T> {
  const { fileNamePrefix, columns, sheetName = 'Sheet1' } = options;
  const [exporting, setExporting] = useState(false);
  const { t } = useTranslation('common');
  const toast = useToast();

  const exportToExcel = useCallback(async (data: T[]) => {
    if (exporting) return;
    
    setExporting(true);
    
    try {
      // Create workbook and worksheet
      const workbook = new Workbook();
      workbook.creator = 'SuperApp';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet(sheetName);

      // Define columns
      worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: String(col.key),
        width: col.width || 20,
      }));

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }, // Light gray background
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

      // Add data rows
      data.forEach((item, index) => {
        const rowData: Record<string, unknown> = {};
        columns.forEach((col) => {
          // Special handling for row number column
          if (col.key === '#') {
            rowData['#'] = index + 1;
            return;
          }
          
          const value = item[col.key];
          // Convert boolean to localized string
          if (typeof value === 'boolean') {
            rowData[String(col.key)] = value ? t('active') : t('inactive');
          } else {
            rowData[String(col.key)] = value;
          }
        });
        worksheet.addRow(rowData);
      });

      // Auto-fit column widths (approximate)
      worksheet.columns.forEach((column) => {
        if (column.width && column.width < 10) {
          column.width = 10;
        }
      });

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
      const fileName = `${fileNamePrefix}_${timestamp}.xlsx`;

      // Generate buffer and save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, fileName);

      toast.success(t('export_success', { defaultValue: 'Export successful!' }));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('export_error', { defaultValue: 'Export failed' }));
    } finally {
      setExporting(false);
    }
  }, [exporting, columns, sheetName, fileNamePrefix, t, toast]);

  return { exportToExcel, exporting };
}
