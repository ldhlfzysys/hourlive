export interface ImageColumn {
  columnIndex: number;
  key: string;
}

export interface TableInfo {
  title: string[];
  data: any[];
  imageColumns?: ImageColumn[];
}

export interface Attachment {
  url: string;
  fileName: string;
  col: number;
  row: number;
}
