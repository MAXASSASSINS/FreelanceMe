import { Document } from "mongoose";

export interface IFile {
  publicId: string;
  url: string;
  name: string;
  type: string;
  size: number;
  blurhash?: string;
  height?: number;
  width?: number;
}