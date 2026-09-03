import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LetterItem } from '../App';

export async function exportStyledSARExcel(items: LetterItem[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'الشركة الخطوط الحديدية السعودية (SAR)';
  workbook.lastModifiedBy = 'SAR Correspondence System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================
  // SHEET 1: 📊 لوحة المؤشرات والتحليلات (Dashboard)
  // ==========================================
  const dashSheet = workbook.addWorksheet('📊 لوحة المؤشرات (Dashboard)', {
    views: [{ showGridLines: true, rightToLeft: true }],
  });

  // Title Banner
  dashSheet.mergeCells('B2:H3');
  const titleCell = dashSheet.getCell('B2');
  titleCell.value = 'الخطوط الحديدية السعودية (SAR) — لوحة مؤشرات الأداء وسجل المراسلات';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00707B' }, // SAR Teal
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Subtitle / Date
  dashSheet.mergeCells('B4:H4');
  const subCell = dashSheet.getCell('B4');
  subCell.value = `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')} | إجمالي السجلات النشطة: ${items.length} خطاب`;
  subCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF475569' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // KPI Metrics Calculation
  const totalLetters = items.length;
  const inLetters = items.filter(i => i.direction === 'IN').length;
  const outLetters = items.filter(i => i.direction === 'OUT').length;
  const openLetters = items.filter(i => i.status === 'OPEN').length;
  const closedLetters = items.filter(i => i.status === 'CLOSED').length;
  const reviewLetters = items.filter(i => i.status === 'UNDER_REVIEW').length;
  const reqReplyLetters = items.filter(i => i.requiresReply).length;

  const sarCount = items.filter(i => i.network === 'SAR').length;
  const hhrCount = items.filter(i => i.network === 'HHR').length;
  const mmmpCount = items.filter(i => i.network === 'MMMP').length;

  // Render KPI Card Helper
  const renderKpiCard = (
    startCol: string,
    endCol: string,
    startRow: number,
    title: string,
    value: number | string,
    bgColorHex: string,
    textColorHex: string,
    borderColorHex: string
  ) => {
    // Title row
    dashSheet.mergeCells(`${startCol}${startRow}:${endCol}${startRow}`);
    const cardTitle = dashSheet.getCell(`${startCol}${startRow}`);
    cardTitle.value = title;
    cardTitle.font = { name: 'Arial', size: 10, bold: true, color: { argb: textColorHex } };
    cardTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorHex } };
    cardTitle.alignment = { vertical: 'middle', horizontal: 'center' };

    // Value row
    dashSheet.mergeCells(`${startCol}${startRow + 1}:${endCol}${startRow + 2}`);
    const cardVal = dashSheet.getCell(`${startCol}${startRow + 1}`);
    cardVal.value = value;
    cardVal.font = { name: 'Arial', size: 20, bold: true, color: { argb: textColorHex } };
    cardVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorHex } };
    cardVal.alignment = { vertical: 'middle', horizontal: 'center' };

    // Border around card
    const borderStyle = {
      top: { style: 'thin' as const, color: { argb: borderColorHex } },
      left: { style: 'thin' as const, color: { argb: borderColorHex } },
      bottom: { style: 'thin' as const, color: { argb: borderColorHex } },
      right: { style: 'thin' as const, color: { argb: borderColorHex } },
    };
    cardTitle.border = borderStyle;
    cardVal.border = borderStyle;
  };

  // Row 6-8: KPI Row 1
  renderKpiCard('B', 'C', 6, '📌 إجمالي الخطابات', totalLetters, 'FFF0FDFA', 'FF0F766E', 'FF99F6E4');
  renderKpiCard('D', 'D', 6, '📥 خطابات واردة (IN)', inLetters, 'FFE0F2FE', 'FF0369A1', 'FFBAE6FD');
  renderKpiCard('E', 'E', 6, '📤 خطابات صادرة (OUT)', outLetters, 'FFF5F3FF', 'FF6D28D9', 'FFDDD6FE');
  renderKpiCard('F', 'F', 6, '🔴 خطابات مفتوحة (Open)', openLetters, 'FFFEF2F2', 'FFB91C1C', 'FFFECACA');
  renderKpiCard('G', 'G', 6, '🟢 خطابات مغلقة (Closed)', closedLetters, 'FFECFDF5', 'FF047857', 'FFA7F3D0');
  renderKpiCard('H', 'H', 6, '⚡ تتطلب رداً عاجلاً', reqReplyLetters, 'FFFFFBEB', 'FFB45309', 'FFFDE68A');

  // Breakdown Table 1: حسب الشبكة (By Network)
  dashSheet.mergeCells('B10:D10');
  const netHeader = dashSheet.getCell('B10');
  netHeader.value = '🚆 توزيع الخطابات حسب الشبكة التشغيلية';
  netHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  netHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00707B' } };
  netHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  dashSheet.getCell('B11').value = 'اسم الشبكة';
  dashSheet.getCell('C11').value = 'العدد';
  dashSheet.getCell('D11').value = 'النسبة المئوية';
  ['B11', 'C11', 'D11'].forEach(c => {
    const cell = dashSheet.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const netRows = [
    { name: 'شبكة سار العامة (SAR)', count: sarCount },
    { name: 'قطار الحرمين السريع (HHR)', count: hhrCount },
    { name: 'مشروع قطار المشاعر (MMMP)', count: mmmpCount },
  ];

  netRows.forEach((r, idx) => {
    const rowNum = 12 + idx;
    dashSheet.getCell(`B${rowNum}`).value = r.name;
    dashSheet.getCell(`C${rowNum}`).value = r.count;
    dashSheet.getCell(`D${rowNum}`).value = totalLetters > 0 ? `${Math.round((r.count / totalLetters) * 100)}%` : '0%';

    [`B${rowNum}`, `C${rowNum}`, `D${rowNum}`].forEach(c => {
      const cell = dashSheet.getCell(c);
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Breakdown Table 2: حسب الحالة (By Status)
  dashSheet.mergeCells('F10:H10');
  const statHeader = dashSheet.getCell('F10');
  statHeader.value = '📊 توزيع الخطابات حسب الحالة التشغيلية';
  statHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  statHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00707B' } };
  statHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  dashSheet.getCell('F11').value = 'الحالة';
  dashSheet.getCell('G11').value = 'العدد';
  dashSheet.getCell('H11').value = 'النسبة المئوية';
  ['F11', 'G11', 'H11'].forEach(c => {
    const cell = dashSheet.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const statRows = [
    { name: 'مفتوح (OPEN)', count: openLetters, color: 'FFB91C1C' },
    { name: 'مغلق ومنجز (CLOSED)', count: closedLetters, color: 'FF047857' },
    { name: 'تحت المراجعة (UNDER REVIEW)', count: reviewLetters, color: 'FFB45309' },
  ];

  statRows.forEach((r, idx) => {
    const rowNum = 12 + idx;
    dashSheet.getCell(`F${rowNum}`).value = r.name;
    dashSheet.getCell(`G${rowNum}`).value = r.count;
    dashSheet.getCell(`H${rowNum}`).value = totalLetters > 0 ? `${Math.round((r.count / totalLetters) * 100)}%` : '0%';

    [`F${rowNum}`, `G${rowNum}`, `H${rowNum}`].forEach(c => {
      const cell = dashSheet.getCell(c);
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Set column widths for Dashboard
  dashSheet.columns = [
    { width: 4 },  // A
    { width: 28 }, // B
    { width: 14 }, // C
    { width: 18 }, // D
    { width: 20 }, // E
    { width: 26 }, // F
    { width: 14 }, // G
    { width: 22 }, // H
  ];

  // ==========================================
  // SHEET 2: 📋 سجل المراسلات الرسمي (Letters Log)
  // ==========================================
  const logSheet = workbook.addWorksheet('📋 سجل المراسلات (Letters Log)', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: true, rightToLeft: true }],
  });

  // Title Banner on sheet 2
  logSheet.mergeCells('A1:K2');
  const logTitle = logSheet.getCell('A1');
  logTitle.value = 'الخطوط الحديدية السعودية (SAR) — السجل الرسمي لمراسلات وخطابات المشاريع';
  logTitle.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  logTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00707B' },
  };
  logTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  // Subtitle / Info
  logSheet.mergeCells('A3:K3');
  const logSub = logSheet.getCell('A3');
  logSub.value = `تم التصدير بتاريخ: ${new Date().toLocaleString('ar-SA')} | الفلترة مفعلة تلقائياً لجميع الأعمدة`;
  logSub.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  logSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  logSub.alignment = { vertical: 'middle', horizontal: 'center' };

  // Table Headers (Row 4)
  const headers = [
    '#',
    'رقم المرجع (Ref Number)',
    'التاريخ (Date)',
    'الشبكة (Network)',
    'نوع الخطاب (Direction)',
    'الجهة المرسلة (Sender)',
    'الجهة المستلمة (Recipient)',
    'موضوع الخطاب (Subject)',
    'الحالة التشغيلية (Status)',
    'مطلوب رد؟ (Reply)',
    'مهلة الرد (Deadline)',
    'الملاحظات والتفاصيل (Notes)',
  ];

  logSheet.getRow(4).values = headers;
  logSheet.getRow(4).height = 32;

  const headerRow = logSheet.getRow(4);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00545C' }, // Darker SAR Teal
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF00363B' } },
      bottom: { style: 'medium', color: { argb: 'FF00363B' } },
      left: { style: 'thin', color: { argb: 'FF00707B' } },
      right: { style: 'thin', color: { argb: 'FF00707B' } },
    };
  });

  // Data Rows
  items.forEach((item, index) => {
    const rowNum = 5 + index;
    const isEven = index % 2 === 0;
    const bgRowColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    const row = logSheet.getRow(rowNum);
    row.height = 28;
    row.values = [
      index + 1,
      item.refNumber,
      item.date,
      item.network,
      item.direction === 'IN' ? '📥 وارد (In)' : '📤 صادر (Out)',
      item.sender || '—',
      item.recipient || '—',
      item.subject,
      item.status === 'OPEN' ? '🔴 مفتوح' : item.status === 'CLOSED' ? '🟢 مغلق' : '🟡 تحت المراجعة',
      item.requiresReply ? '⚡ نعم (مطلوب رد)' : 'لا',
      item.replyDeadline || '—',
      item.notes || '—',
    ];

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRowColor } };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 8 || colNum === 12 ? 'right' : 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Custom formatting per column
      if (colNum === 2) {
        // Ref Number
        cell.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colNum === 4) {
        // Network
        const netColor = item.network === 'SAR' ? 'FF00707B' : item.network === 'HHR' ? 'FFD97706' : 'FF2563EB';
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: netColor } };
      } else if (colNum === 9) {
        // Status Column Custom Pill Look
        if (item.status === 'OPEN') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
        } else if (item.status === 'CLOSED') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF047857' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB45309' } };
        }
      } else if (colNum === 10 && item.requiresReply) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFC2410C' } };
      }
    });
  });

  // AutoFilter for all columns
  logSheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + items.length, column: 12 },
  };

  // Explicit Column Widths for Perfect Layout
  logSheet.columns = [
    { width: 6 },  // 1: Index
    { width: 24 }, // 2: Ref Number
    { width: 14 }, // 3: Date
    { width: 14 }, // 4: Network
    { width: 18 }, // 5: Direction
    { width: 26 }, // 6: Sender
    { width: 26 }, // 7: Recipient
    { width: 44 }, // 8: Subject
    { width: 20 }, // 9: Status
    { width: 20 }, // 10: Requires Reply
    { width: 16 }, // 11: Deadline
    { width: 40 }, // 12: Notes
  ];

  // Generate Excel buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `SAR_Correspondence_Executive_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, fileName);
}
