/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { RequestClient } from '@vben/request';

import ExcelJs from 'exceljs';
import JSZip from 'jszip';
import { defineStore } from 'pinia';

// Model
import type { Attachment, TableInfo } from '#/types';

const downloader = new RequestClient();

// API
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response!.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.addEventListener('error', reject);
    reader.readAsDataURL(blob);
  });
};

const downloadFileAsBlob = async (url: string): Promise<{ blob: Blob }> => {
  const response = await downloader.get(url, { responseType: 'blob' });
  return new Promise((resolve, reject) => {
    resolve({ blob: response.data });
  });
};

// Store
export const useDownloaderStore = defineStore('downloader', () => {
  async function downloadExcel(info: TableInfo[], filename: string) {
    let startLine: number = 2;

    const workbook = new ExcelJs.Workbook();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('sheet1', {
      views: [{ showGridLines: true }],
    });

    const imageHeight = 100;

    // 插入图像
    const insertImage = async (url: string, row: number, col: number) => {
      const width = imageHeight;
      const height = imageHeight;
      const base64Image = await fetchImageAsBase64(url);
      const imageId = workbook.addImage({
        base64: base64Image,
        extension: 'jpeg',
      });

      worksheet.addImage(imageId, {
        br: { col: col + 1, row: row + 1 },
        // ext: { width: width, height: height },
        editAs: 'onCell',
        tl: { col, row },
      });
    };

    const startCol = 'B';
    const attatchments: Attachment[] = [];

    for (const [i, element] of info.entries()) {
      const item = element!;
      const tableData = item.data;
      const tableName = `Table${i}`;
      worksheet.addTable({
        columns: item.title.map((title, index) => {
          return { filterButton: false, name: title };
        }),
        headerRow: true,
        name: tableName,
        ref: startCol + startLine,
        rows: tableData.map((row, index) => {
          const values: any[] = [];
          let columnIndex = 0;
          for (const key in row) {
            if (
              item.imageColumns &&
              item.imageColumns.some((column) => column.key === key)
            ) {
              values.push('');
              continue;
            }

            if (key === 'attachment') {
              const rowData = row[key];
              const attachmentValues = rowData.map((attachment: any) => {
                const name = `${index}_${attachment.name}`;
                attatchments.push({
                  col: columnIndex,
                  fileName: name,
                  row: startLine + index,
                  url: attachment.path,
                });
                return name;
              });
              values.push(attachmentValues.join('\n'));
            } else {
              const value = row[key];
              if (typeof value === 'string' && value.startsWith('http')) {
                values.push({
                  hyperlink: value,
                  text: value,
                });
              } else {
                values.push(row[key]);
              }
            }
            columnIndex += 1;
          }
          return values;
        }),
        style: {
          showRowStripes: true,
          theme: 'TableStyleMedium1',
        },
      });

      if (item.imageColumns) {
        for (
          let columnIndex = 0;
          columnIndex < item.imageColumns.length;
          columnIndex++
        ) {
          const column = item.imageColumns[columnIndex]!;
          for (const [j, row] of tableData.entries()) {
            await insertImage(
              row[column.key],
              startLine + j,
              startCol.codePointAt(0)! -
                'A'.codePointAt(0)! +
                column.columnIndex,
            );
          }
        }
      }

      startLine += tableData.length + 4;
    }

    const allImageColumns = new Set();
    const allImageRows = new Set();
    worksheet.getImages().forEach((image: any) => {
      allImageColumns.add(Math.floor(image.range.tl.col));
      allImageRows.add(image.range.tl.row);
    });

    const columnWidthList: number[] = [];
    // 自适应列宽
    worksheet.columns.forEach((column: any) => {
      let maxLength = 10;
      column.eachCell!({ includeEmpty: true }, (cell: any) => {
        const cellValue = cell.value as string;

        if (cellValue && cellValue.toString().length > maxLength) {
          maxLength = cellValue.toString().length;
        }
      });
      const columnWidth = Math.min(maxLength + 2, imageHeight);
      columnWidthList.push(columnWidth);
      column.width = columnWidth; // 为了好看，适当增加宽度
    });

    // 自适应行高
    worksheet.eachRow({ includeEmpty: true }, (row: any) => {
      row.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
    });

    // 导出Excel文件
    const excelBuffer = await workbook.xlsx.writeBuffer();

    const zip = new JSZip();
    zip.file(`${filename}.xlsx`, excelBuffer);

    for (const attatchment of attatchments) {
      const url = attatchment!.url;
      const fileName = attatchment!.fileName;

      const fileBlob = await downloadFileAsBlob(url);

      zip.file(fileName, fileBlob.blob);
    }

    zip.generateAsync({ type: 'blob' }).then((zipBlob: any) => {
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.zip`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
  return {
    downloadExcel,
  };
});
