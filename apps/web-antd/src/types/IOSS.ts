export interface OSSFile {
  name: string;
  path: string;
}

export interface OSSFileUpload {
  product_id: number;
  fileData: FormData;
}

export interface OSSFileDelete {
  name: string;
  product_id: number;
}
