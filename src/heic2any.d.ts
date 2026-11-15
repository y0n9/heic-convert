declare module "heic2any" {
  interface Heic2AnyOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: true;
    gifInterval?: number;
  }

  export default function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;
}
