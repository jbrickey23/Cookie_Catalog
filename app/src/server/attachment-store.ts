/** Private object storage boundary. Never expose object keys as public URLs. */
export interface AttachmentInfo {
  key: string;
  size: number;
  etag?: string;
  contentType?: string;
}
export interface AttachmentStore {
  put(key: string, body: ArrayBuffer | Uint8Array | ReadableStream, contentType: string): Promise<AttachmentInfo>;
  get(key: string): Promise<{ body: ReadableStream; contentType: string | undefined } | null>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
export function makeObjectKey(attachmentId: string, kind: "original" | "thumbnail"): string {
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(attachmentId)) throw new Error("Invalid attachment ID");
  return `attachments/${attachmentId}/${kind}`;
}
