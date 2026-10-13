import React, { useState, useEffect } from 'react';
import type { WorksheetSchema, WorksheetField, WorksheetTableField, WorksheetData, FieldOption } from '../types/worksheet';
import { Info, Plus, Trash2 } from 'lucide-react';

interface WorksheetEngineProps {
  schema: WorksheetSchema;
  initialData?: WorksheetData;
  onChange?: (data: WorksheetData) => void;
  readOnly?: boolean;
}

const WorksheetEngine: React.FC<WorksheetEngineProps> = ({ schema, initialData = {}, onChange, readOnly = false }) => {
  const [data, setData] = useState<WorksheetData>(initialData);

  useEffect(() => {
    if (onChange) {
      onChange(data);
    }
  }, [data]);

  const handleFieldChange = (fieldId: string, value: any) => {
    if (readOnly) return;
    setData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleTableChange = (tableId: string, rowIndex: number, columnId: string, value: any) => {
    if (readOnly) return;
    setData((prev) => {
      const tableData = prev[tableId] || [];
      const updatedTableData = [...tableData];
      if (!updatedTableData[rowIndex]) {
        updatedTableData[rowIndex] = {};
      }
      updatedTableData[rowIndex][columnId] = value;
      return { ...prev, [tableId]: updatedTableData };
    });
  };

  const addTableRow = (tableId: string) => {
    if (readOnly) return;
    setData((prev) => {
      const tableData = prev[tableId] || [];
      return { ...prev, [tableId]: [...tableData, {}] };
    });
  };

  const removeTableRow = (tableId: string, rowIndex: number) => {
    if (readOnly) return;
    setData((prev) => {
      const tableData = prev[tableId] || [];
      return { ...prev, [tableId]: tableData.filter((_: any, idx: number) => idx !== rowIndex) };
    });
  };

  const renderField = (field: WorksheetField) => {
    const value = data[field.id] !== undefined ? data[field.id] : (field.defaultValue || '');
    
    // Check dependencies
    if (field.dependsOn && !data[field.dependsOn]) {
      return null;
    }

    return (
      <div key={field.id} className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {field.label}
          {field.rules?.some(r => r.type === 'required') && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.helpText && (
          <div className="flex items-start mb-2 text-xs text-gray-500">
            <Info size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            <p>{field.helpText}</p>
          </div>
        )}

        {field.type === 'text' && (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-atlas-blue text-sm disabled:bg-gray-100"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={readOnly || field.disabled}
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-atlas-blue text-sm disabled:bg-gray-100"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value ? Number(e.target.value) : '')}
            disabled={readOnly || field.disabled}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-atlas-blue text-sm disabled:bg-gray-100 min-h-[100px]"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={readOnly || field.disabled}
          />
        )}

        {field.type === 'select' && field.options && (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-atlas-blue text-sm disabled:bg-gray-100 bg-white"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={readOnly || field.disabled}
          >
            <option value="" disabled>Pilih salah satu...</option>
            {field.options.map((opt: FieldOption, i: number) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {field.type === 'radio' && field.options && (
          <div className="flex flex-col space-y-2 mt-2">
            {field.options.map((opt: FieldOption, i: number) => (
              <label key={i} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={String(value) === String(opt.value)}
                  onChange={() => handleFieldChange(field.id, opt.value)}
                  disabled={readOnly || field.disabled}
                  className="text-atlas-blue focus:ring-atlas-blue"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTable = (tableField: WorksheetTableField) => {
    const tableData = data[tableField.id] || [];
    
    return (
      <div key={tableField.id} className="mb-8 overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-bold text-gray-800">{tableField.label}</h4>
            {tableField.helpText && <p className="text-xs text-gray-500 mt-1">{tableField.helpText}</p>}
          </div>
          {!readOnly && tableField.allowAddRows !== false && (
            <button
              onClick={() => addTableRow(tableField.id)}
              className="flex items-center space-x-1 text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <Plus size={14} /> <span>Tambah Baris</span>
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">No</th>
                {tableField.columns.map(col => (
                  <th key={col.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
                {!readOnly && tableField.allowDeleteRows !== false && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={tableField.columns.length + 2} className="px-4 py-8 text-center text-sm text-gray-500 italic">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                tableData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{rowIndex + 1}</td>
                    {tableField.columns.map(col => (
                      <td key={col.id} className="px-4 py-2">
                        {col.type === 'text' ? (
                          <input
                            type="text"
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(tableField.id, rowIndex, col.id, e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue rounded text-sm transition-colors bg-transparent focus:bg-white"
                          />
                        ) : col.type === 'select' && col.options ? (
                          <select
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(tableField.id, rowIndex, col.id, e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-atlas-blue rounded text-sm bg-transparent focus:bg-white"
                          >
                            <option value="">Pilih...</option>
                            {col.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type}
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(tableField.id, rowIndex, col.id, e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-atlas-blue focus:ring-1 focus:ring-atlas-blue rounded text-sm bg-transparent focus:bg-white"
                          />
                        )}
                      </td>
                    ))}
                    {!readOnly && tableField.allowDeleteRows !== false && (
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => removeTableRow(tableField.id, rowIndex)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Instructions Block */}
      {schema.instructions && schema.instructions.length > 0 && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-atlas-blue mb-3 flex items-center">
            <Info size={16} className="mr-2" /> Instruksi Pengisian Kertas Kerja
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-1">
            {schema.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections rendering */}
      {schema.sections.map((section) => (
        <div key={section.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
            {section.description && <p className="text-sm text-gray-500 mt-1">{section.description}</p>}
          </div>
          
          <div className="space-y-6">
            {section.fields.map((field) => {
              if (field.type === 'table') {
                return renderTable(field as WorksheetTableField);
              }
              return renderField(field as WorksheetField);
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorksheetEngine;
