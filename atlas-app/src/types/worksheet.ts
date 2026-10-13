export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'table';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface WorksheetField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  rules?: FieldRule[];
  defaultValue?: any;
  dependsOn?: string; // ID of another field that must be true/have value
  disabled?: boolean;
  helpText?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  type: FieldType;
  options?: FieldOption[];
}

export interface WorksheetTableField extends WorksheetField {
  type: 'table';
  columns: TableColumn[];
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
}

export interface WorksheetSection {
  id: string;
  title: string;
  description?: string;
  fields: (WorksheetField | WorksheetTableField)[];
  collapsible?: boolean;
}

export interface WorksheetCalculation {
  id: string;
  label: string;
  formula: string; // E.g., "(fieldA + fieldB) * 100" - to be parsed by engine
  dependencies: string[]; // Field IDs needed for this calculation
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export interface WorksheetSchema {
  code: string; // e.g., 'A.110'
  title: string;
  version: string;
  instructions: string[];
  sections: WorksheetSection[];
  calculations?: WorksheetCalculation[];
}

export interface WorksheetData {
  [fieldId: string]: any;
}
