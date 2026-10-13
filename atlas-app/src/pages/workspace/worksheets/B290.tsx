import React, { useState } from 'react';
import WorksheetContainer from '../../../components/WorksheetContainer';
import WorksheetEngine from '../../../components/WorksheetEngine';
import type { WorksheetSchema, WorksheetData } from '../../../types/worksheet';

const B290: React.FC = () => {
  const [worksheetStatus, setWorksheetStatus] = useState<'In Progress' | 'Completed' | 'Pending Review'>('In Progress');
  const [data, setData] = useState<WorksheetData>({});

  const b290Schema: WorksheetSchema = {
    code: 'B.290',
    title: 'Informasi Segmen',
    version: '1.0',
    instructions: [
      'Kertas kerja ini muncul khusus untuk standar SAK Umum Konvergensi IFRS.',
      'Informasi segmen dapat diisi secara manual pada kolom yang disediakan dan/atau dilampirkan.'
    ],
    sections: [
      {
        id: 'sec-1',
        title: '1. Pengisian Manual Informasi Segmen',
        fields: [
          {
            id: 'segment_info',
            label: 'Deskripsi Informasi Segmen',
            type: 'textarea',
            placeholder: 'Ketik atau salin informasi segmen secara manual di sini...',
          }
        ]
      },
      {
        id: 'sec-2',
        title: '2. Lampiran Informasi Segmen',
        fields: [
          {
            id: 'segment_attachment',
            label: 'Unggah Lampiran',
            type: 'file',
            helpText: 'Unggah file PDF atau Excel yang berisi rincian informasi segmen.'
          }
        ]
      },
      {
        id: 'sec-3',
        title: '3. Kesimpulan Auditor',
        fields: [
          {
            id: 'conclusion',
            label: 'Kesimpulan atas Informasi Segmen',
            type: 'textarea',
            placeholder: 'Tuliskan kesimpulan auditor...',
          }
        ]
      }
    ]
  };

  return (
    <WorksheetContainer
      worksheetCode="B.290"
      worksheetName="Informasi Segmen"
      status={worksheetStatus}
      onStatusChange={setWorksheetStatus}
      validateCompletion={() => true}
    >
      <WorksheetEngine 
        schema={b290Schema} 
        initialData={data} 
        onChange={setData} 
        readOnly={worksheetStatus === 'Completed'}
      />
    </WorksheetContainer>
  );
};

export default B290;
