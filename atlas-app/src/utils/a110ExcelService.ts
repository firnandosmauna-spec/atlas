import * as XLSX from 'xlsx';
import type { Engagement, WorksheetA110 } from '../store/engagementStore';

export interface A110ExportData {
  industry: string;
  boardOfDirectors: string;
  usagePurpose: string;
  evaluations: Record<string, 'low' | 'high' | ''>;
  overallRisk: 'low' | 'medium' | 'high' | null;
  anomalyExplanation: string;
  decision: 'Accept' | 'Reject' | null;
  decisionReason: string;
  status: string;
  preparedBy?: string;
  reviewedBy?: string;
  auditPeriod?: string;
  accountingStandard?: string;
}

/**
 * Generate and trigger download of professional A.110 Excel (.xlsx) file
 */
export const exportA110ToExcel = (engagement: Engagement, wsData: A110ExportData) => {
  const wb = XLSX.utils.book_new();

  // Evaluasi label helper
  const getRiskLabel = (val?: string) => {
    if (val === 'low') return 'Risiko Rendah (Low)';
    if (val === 'high') return 'Risiko Tinggi (High)';
    if (val === 'medium') return 'Risiko Sedang (Medium)';
    return 'Belum Ditentukan';
  };

  const getDecisionLabel = (val?: string | null) => {
    if (val === 'Accept') return 'DITERIMA (ACCEPT)';
    if (val === 'Reject') return 'DITOLAK (REJECT)';
    return 'Belum Diputuskan';
  };

  // Sheet 1: Kertas Kerja Utama A.110
  const mainSheetData: (string | number)[][] = [
    ['KERTAS KERJA AUDIT (KKP) — ATLAS AUDIT FLOW'],
    ['KAP FRIDOLINUS PENO & REKAN'],
    [''],
    ['Indeks KKP:', 'A.110', 'Standar Audit:', 'SA 210, SA 220, SPM 1'],
    ['Nama Klien:', engagement.clientName, 'Tahun Buku / Periode:', engagement.auditPeriod || engagement.fiscalYear || '2025'],
    ['Jenis Perikatan:', engagement.engagementType === 'First Year' ? 'Perikatan Tahun Pertama' : 'Perikatan Berkelanjutan (Recurring)', 'Mata Uang:', `${engagement.currency} (${engagement.presentationUnit})`],
    ['Standar Akuntansi:', engagement.accountingStandard || 'SAK EP', 'Status KKP:', wsData.status || 'In Progress'],
    [''],
    ['========================================================================================'],
    ['SEKSI 1: INFORMASI CALON KLIEN & MANAJEMEN'],
    ['========================================================================================'],
    ['Field / Parameter', 'Uraian / Nilai Data', 'Keterangan'],
    ['Nama Entitas', engagement.clientName, 'Terverifikasi sesuai akta'],
    ['Bidang Usaha / Industri', wsData.industry || engagement.clientIndustry || '-', 'Sektor bisnis utama'],
    ['Susunan Dewan Komisaris & Direksi', wsData.boardOfDirectors || '-', 'Eksekutif kunci dan tata kelola'],
    ['Jenis Perikatan', engagement.engagementType, 'Karakteristik penugasan'],
    ['Standar Akuntansi Digunakan', engagement.accountingStandard || 'SAK EP', 'Kerangka pelaporan keuangan'],
    ['Tujuan Penggunaan Laporan Keuangan', wsData.usagePurpose || '-', 'Pihak pengguna laporan audit'],
    [''],
    ['========================================================================================'],
    ['SEKSI 2: KONTROL ISIAN KERTAS KERJA PENDUKUNG (EVALUASI RISIKO)'],
    ['========================================================================================'],
    ['Indeks', 'Nama Kertas Kerja Pendukung', 'Tingkat Risiko Hasil Evaluasi', 'Status Pengisian'],
    ['A.1101', 'Isu Pelaporan Keuangan Terdahulu', getRiskLabel(wsData.evaluations['A.1101']), wsData.evaluations['A.1101'] ? 'Selesai' : 'Belum'],
    ['A.1102', 'Integritas Manajemen Calon Klien', getRiskLabel(wsData.evaluations['A.1102']), wsData.evaluations['A.1102'] ? 'Selesai' : 'Belum'],
    ['A.1103', 'Kompetensi, Waktu, & Independensi Personel KAP', getRiskLabel(wsData.evaluations['A.1103']), wsData.evaluations['A.1103'] ? 'Selesai' : 'Belum'],
    ['A.1104', 'Komunikasi dengan Auditor Pendahulu', engagement.engagementType === 'First Year' ? getRiskLabel(wsData.evaluations['A.1104']) : 'N/A (Bukan Tahun Pertama)', engagement.engagementType === 'First Year' ? (wsData.evaluations['A.1104'] ? 'Selesai' : 'Belum') : 'N/A'],
    [''],
    ['Simpulan Risiko Keseluruhan (Overall Risk):', getRiskLabel(wsData.overallRisk || 'low')],
    ['Penjelasan Jawaban Anomali / Catatan Khusus:', wsData.anomalyExplanation || 'Tidak terdapat anomali signifikan.'],
    [''],
    ['========================================================================================'],
    ['SEKSI 3: KEPUTUSAN PENERIMAAN KLIEN & MITIGASI'],
    ['========================================================================================'],
    ['Parameter', 'Keputusan / Catatan Auditor'],
    ['Keputusan Akhir', getDecisionLabel(wsData.decision)],
    ['Alasan Keputusan & Rencana Mitigasi', wsData.decisionReason || '-'],
    [''],
    ['========================================================================================'],
    ['SEKSI 4: TANDA TANGAN & PENGESAHAN (SIGN-OFF)'],
    ['========================================================================================'],
    ['Peran', 'Nama Auditor / Reviewer', 'Tanggal', 'Tanda Tangan / Status'],
    ['Disiapkan Oleh (Senior Auditor)', wsData.preparedBy || engagement.auditorName || 'Auditor', new Date().toISOString().split('T')[0], 'TERVERIFIKASI'],
    ['Direview Oleh (Manager)', wsData.reviewedBy || engagement.managerName || 'Manager', new Date().toISOString().split('T')[0], wsData.status === 'Approved' ? 'APPROVED' : 'MENUNGGU'],
    ['Disetujui Oleh (Audit Partner)', engagement.partnerName || 'Partner', new Date().toISOString().split('T')[0], wsData.status === 'Approved' ? 'APPROVED' : 'MENUNGGU']
  ];

  const ws = XLSX.utils.aoa_to_sheet(mainSheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 32 },
    { wch: 45 },
    { wch: 30 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'A110_Analisis_Penerimaan');

  // Sheet 2: Format Data untuk Kemudahan Re-import (Key-Value)
  const templateData: (string | number)[][] = [
    ['KODE_FIELD', 'NAMA_FIELD', 'NILAI_DATA', 'PETUNJUK_PENGISIAN'],
    ['industry', 'Bidang Usaha / Industri', wsData.industry || engagement.clientIndustry || '', 'Pilih nama sektor atau ketik manual industri klien'],
    ['boardOfDirectors', 'Susunan Dewan Komisaris & Direksi Utama', wsData.boardOfDirectors || '', 'Tuliskan nama Direktur Utama, Direksi, dan Komisaris'],
    ['usagePurpose', 'Tujuan Penggunaan Laporan Keuangan', wsData.usagePurpose || '', 'Contoh: RUPS Pemegang Saham, Pengajuan Kredit Bank, Tender, dll'],
    ['eval_A1101', 'Evaluasi A.1101 (Isu Pelaporan)', wsData.evaluations['A.1101'] || 'low', 'Isi: low (Rendah) atau high (Tinggi)'],
    ['eval_A1102', 'Evaluasi A.1102 (Integritas Manajemen)', wsData.evaluations['A.1102'] || 'low', 'Isi: low (Rendah) atau high (Tinggi)'],
    ['eval_A1103', 'Evaluasi A.1103 (Kompetensi & Independensi)', wsData.evaluations['A.1103'] || 'low', 'Isi: low (Rendah) atau high (Tinggi)'],
    ['eval_A1104', 'Evaluasi A.1104 (Auditor Pendahulu)', wsData.evaluations['A.1104'] || '', 'Isi: low atau high (khusus perikatan tahun pertama)'],
    ['overallRisk', 'Tingkat Risiko Keseluruhan', wsData.overallRisk || 'low', 'Isi: low atau high'],
    ['anomalyExplanation', 'Penjelasan Anomali', wsData.anomalyExplanation || '', 'Wajib diisi jika terdapat risiko tinggi atau catatan anomali'],
    ['decision', 'Keputusan Penerimaan', wsData.decision || 'Accept', 'Isi: Accept (Terima) atau Reject (Tolak)'],
    ['decisionReason', 'Alasan Keputusan & Mitigasi', wsData.decisionReason || '', 'Uraikan pertimbangan dan mitigasi risiko auditor']
  ];

  const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);
  wsTemplate['!cols'] = [
    { wch: 22 },
    { wch: 38 },
    { wch: 45 },
    { wch: 50 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'DATA_IMPORT_A110');

  // Trigger download
  const cleanClientName = (engagement.clientName || 'Klien').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `ATLAS_A110_${cleanClientName}_${engagement.fiscalYear || '2025'}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Generate blank Excel template for A.110 import
 */
export const downloadA110ExcelTemplate = (clientName = 'PT Contoh Klien', fiscalYear = '2025') => {
  const wb = XLSX.utils.book_new();

  const templateData: (string | number)[][] = [
    ['KODE_FIELD', 'NAMA_FIELD', 'NILAI_DATA', 'PETUNJUK_PENGISIAN'],
    ['industry', 'Bidang Usaha / Industri', 'Industri Pengolahan / Manufaktur', 'Pilih nama sektor atau ketik manual industri klien'],
    ['boardOfDirectors', 'Susunan Dewan Komisaris & Direksi Utama', 'Direktur Utama: Bpk. Hendra\nKomisaris: Ibu Sarah', 'Tuliskan nama Direktur Utama, Direksi, dan Komisaris'],
    ['usagePurpose', 'Tujuan Penggunaan Laporan Keuangan', 'Pertanggungjawaban RUPS dan Evaluasi Pembiayaan Perbankan', 'Tujuan audit, misal: RUPS, perbankan, tender'],
    ['eval_A1101', 'Evaluasi A.1101 (Isu Pelaporan)', 'low', 'Isi: low (Risiko Rendah) atau high (Risiko Tinggi)'],
    ['eval_A1102', 'Evaluasi A.1102 (Integritas Manajemen)', 'low', 'Isi: low (Risiko Rendah) atau high (Risiko Tinggi)'],
    ['eval_A1103', 'Evaluasi A.1103 (Kompetensi & Independensi)', 'low', 'Isi: low (Risiko Rendah) atau high (Risiko Tinggi)'],
    ['eval_A1104', 'Evaluasi A.1104 (Auditor Pendahulu)', 'low', 'Isi: low atau high (khusus perikatan tahun pertama)'],
    ['overallRisk', 'Tingkat Risiko Keseluruhan', 'low', 'Isi: low atau high'],
    ['anomalyExplanation', 'Penjelasan Anomali', 'Seluruh pengujian menunjukkan kepatuhan tanpa anomali material.', 'Wajib jika terdapat risiko tinggi'],
    ['decision', 'Keputusan Penerimaan', 'Accept', 'Isi: Accept (Terima) atau Reject (Tolak)'],
    ['decisionReason', 'Alasan Keputusan & Mitigasi', 'Klien memiliki rekam jejak tata kelola yang baik dan KAP memiliki kompetensi yang cukup.', 'Uraian pertimbangan dan mitigasi']
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 38 },
    { wch: 45 },
    { wch: 50 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'DATA_IMPORT_A110');

  const cleanClientName = clientName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Template_Import_A110_${cleanClientName}_${fiscalYear}.xlsx`);
};

/**
 * Generate blank CSV template for A.110 import
 */
export const downloadA110CSVTemplate = () => {
  const csvContent = 
`KODE_FIELD,NAMA_FIELD,NILAI_DATA,PETUNJUK_PENGISIAN
industry,Bidang Usaha / Industri,"Industri Pengolahan / Manufaktur","Pilih nama sektor atau ketik manual industri klien"
boardOfDirectors,Susunan Dewan Komisaris & Direksi Utama,"Direktur Utama: Bpk. Hendra; Komisaris: Ibu Sarah","Tuliskan nama Direksi & Komisaris"
usagePurpose,Tujuan Penggunaan Laporan Keuangan,"Pertanggungjawaban RUPS dan Evaluasi Perbankan","Tujuan audit"
eval_A1101,Evaluasi A.1101 (Isu Pelaporan),low,"low atau high"
eval_A1102,Evaluasi A.1102 (Integritas Manajemen),low,"low atau high"
eval_A1103,Evaluasi A.1103 (Kompetensi & Independensi),low,"low atau high"
eval_A1104,Evaluasi A.1104 (Auditor Pendahulu),low,"low atau high"
overallRisk,Tingkat Risiko Keseluruhan,low,"low atau high"
anomalyExplanation,Penjelasan Anomali,"Tidak terdapat anomali material.","Catatan jika ada risiko tinggi"
decision,Keputusan Penerimaan,Accept,"Accept atau Reject"
decisionReason,Alasan Keputusan & Mitigasi,"Klien memiliki reputasi baik dan risiko terkendali.","Alasan penerimaan"
`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Import_A110.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export A.110 to JSON
 */
export const exportA110ToJSON = (engagement: Engagement, wsData: A110ExportData) => {
  const payload = {
    app: 'ATLAS AUDIT FLOW',
    version: '2.0',
    exportDate: new Date().toISOString(),
    worksheet: 'A.110',
    title: 'Analisis Penerimaan dan Keberlanjutan Hubungan dengan Klien',
    engagement: {
      id: engagement.id,
      clientName: engagement.clientName,
      fiscalYear: engagement.fiscalYear || engagement.auditPeriod,
      engagementType: engagement.engagementType,
      accountingStandard: engagement.accountingStandard
    },
    worksheetData: {
      industry: wsData.industry,
      boardOfDirectors: wsData.boardOfDirectors,
      usagePurpose: wsData.usagePurpose,
      evaluations: wsData.evaluations,
      overallRisk: wsData.overallRisk,
      anomalyExplanation: wsData.anomalyExplanation,
      decision: wsData.decision,
      decisionReason: wsData.decisionReason,
      status: wsData.status
    }
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const cleanClientName = (engagement.clientName || 'Klien').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadAnchor.setAttribute('download', `A110_${cleanClientName}_${engagement.fiscalYear || '2025'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

/**
 * Parse uploaded Excel or CSV file for A.110
 */
export const parseA110File = async (file: File): Promise<Partial<WorksheetA110>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Check if JSON
    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.worksheetData) {
            resolve(parsed.worksheetData);
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error('Format file JSON tidak valid.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file JSON.'));
      reader.readAsText(file);
      return;
    }

    // Read binary Excel or CSV
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Prefer sheet named 'DATA_IMPORT_A110' if available, otherwise first sheet
        let sheetName = workbook.SheetNames.find(s => s.toUpperCase().includes('IMPORT')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error('Lembar kerja (sheet) tidak ditemukan dalam file.');
        }

        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rawRows.length === 0) {
          throw new Error('File Excel kosong.');
        }

        const result: Partial<WorksheetA110> = {
          evaluations: { 'A.1101': '', 'A.1102': '', 'A.1103': '', 'A.1104': '' }
        };

        // Strategy A: Key-Value rows with KODE_FIELD (e.g. from template)
        let foundKeyValue = false;
        for (const row of rawRows) {
          if (!row || row.length < 2) continue;
          const key = String(row[0] || '').trim().toLowerCase();
          const val = row[2] !== undefined ? String(row[2]).trim() : String(row[1] || '').trim();

          if (key === 'industry') {
            result.industry = val;
            foundKeyValue = true;
          } else if (key === 'boardofdirectors') {
            result.boardOfDirectors = val;
            foundKeyValue = true;
          } else if (key === 'usagepurpose') {
            result.usagePurpose = val;
            foundKeyValue = true;
          } else if (key === 'eval_a1101') {
            const clean = val.toLowerCase().includes('high') || val.toLowerCase().includes('tinggi') ? 'high' : 'low';
            if (result.evaluations) result.evaluations['A.1101'] = clean;
            foundKeyValue = true;
          } else if (key === 'eval_a1102') {
            const clean = val.toLowerCase().includes('high') || val.toLowerCase().includes('tinggi') ? 'high' : 'low';
            if (result.evaluations) result.evaluations['A.1102'] = clean;
            foundKeyValue = true;
          } else if (key === 'eval_a1103') {
            const clean = val.toLowerCase().includes('high') || val.toLowerCase().includes('tinggi') ? 'high' : 'low';
            if (result.evaluations) result.evaluations['A.1103'] = clean;
            foundKeyValue = true;
          } else if (key === 'eval_a1104') {
            const clean = val.toLowerCase().includes('high') || val.toLowerCase().includes('tinggi') ? 'high' : 'low';
            if (result.evaluations) result.evaluations['A.1104'] = clean;
            foundKeyValue = true;
          } else if (key === 'overallrisk') {
            result.overallRisk = val.toLowerCase().includes('high') || val.toLowerCase().includes('tinggi') ? 'high' : 'low';
            foundKeyValue = true;
          } else if (key === 'anomalyexplanation') {
            result.anomalyExplanation = val;
            foundKeyValue = true;
          } else if (key === 'decision') {
            result.decision = val.toLowerCase().includes('reject') || val.toLowerCase().includes('tolak') ? 'Reject' : 'Accept';
            foundKeyValue = true;
          } else if (key === 'decisionreason') {
            result.decisionReason = val;
            foundKeyValue = true;
          }
        }

        // Strategy B: Natural text search in formatted sheet (A110_Analisis_Penerimaan)
        if (!foundKeyValue) {
          for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row || row.length === 0) continue;
            const firstCell = String(row[0] || '').trim().toLowerCase();

            if (firstCell.includes('bidang usaha') && row[1]) {
              result.industry = String(row[1]).trim();
            } else if (firstCell.includes('dewan komisaris') && row[1]) {
              result.boardOfDirectors = String(row[1]).trim();
            } else if (firstCell.includes('tujuan penggunaan') && row[1]) {
              result.usagePurpose = String(row[1]).trim();
            } else if (firstCell === 'a.1101' && row[2]) {
              const v = String(row[2]).toLowerCase();
              if (result.evaluations) result.evaluations['A.1101'] = v.includes('tinggi') || v.includes('high') ? 'high' : 'low';
            } else if (firstCell === 'a.1102' && row[2]) {
              const v = String(row[2]).toLowerCase();
              if (result.evaluations) result.evaluations['A.1102'] = v.includes('tinggi') || v.includes('high') ? 'high' : 'low';
            } else if (firstCell === 'a.1103' && row[2]) {
              const v = String(row[2]).toLowerCase();
              if (result.evaluations) result.evaluations['A.1103'] = v.includes('tinggi') || v.includes('high') ? 'high' : 'low';
            } else if (firstCell === 'a.1104' && row[2]) {
              const v = String(row[2]).toLowerCase();
              if (result.evaluations) result.evaluations['A.1104'] = v.includes('tinggi') || v.includes('high') ? 'high' : 'low';
            } else if (firstCell.includes('simpulan risiko') && row[1]) {
              const v = String(row[1]).toLowerCase();
              result.overallRisk = v.includes('tinggi') || v.includes('high') ? 'high' : 'low';
            } else if (firstCell.includes('penjelasan jawaban anomali') && row[1]) {
              result.anomalyExplanation = String(row[1]).trim();
            } else if (firstCell.includes('keputusan akhir') && row[1]) {
              const v = String(row[1]).toLowerCase();
              result.decision = v.includes('tolak') || v.includes('reject') ? 'Reject' : 'Accept';
            } else if (firstCell.includes('alasan keputusan') && row[1]) {
              result.decisionReason = String(row[1]).trim();
            }
          }
        }

        resolve(result);
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal memproses file Excel.'));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari sistem.'));
    reader.readAsArrayBuffer(file);
  });
};
