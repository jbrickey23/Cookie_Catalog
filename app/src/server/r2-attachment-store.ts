import type { AttachmentInfo, AttachmentStore } from "./attachment-store";

interface R2ObjectLike {
  size: number;
  etag?: string;
  httpMetadata?: { contentType?: string };
}
interface R2BodyLike extends R2ObjectLike { body: ReadableStream }
interface R2BucketLike {
  put(key: string, value: ArrayBuffer | Uint8Array | ReadableStream, options: { httpMetadata: { contentType: string } }): Promise<R2ObjectLike | null>;
  get(key: string): Promise<R2BodyLike | null>;
  head(key: string): Promise<R2ObjectLike | null>;
  delete(key: string): Promise<void>;
}
/** Only call after authenticating and authorizing the request at the API boundary. */
export class R2AttachmentStore implements AttachmentStore {
  constructor(private readonly bucket: R2BucketLike) {}
  async put(key: string, body: ArrayBuffer | Uint8Array | ReadableStream, contentType: string): Promise<AttachmentInfo> {
    validateKey(key);
    const object = await this.bucket.put(key, body, { httpMetadata: { contentType } });
    if (!object) throw new Error("R2 upload did not return an object");
    return { key, size: object.size, etag: object.etag, contentType };
  }
  async get(key: string): Promise<{ body: ReadableStream; contentType: string | undefined } | null> {
    validateKey(key);
    const object = await this.bucket.get(key);
    return object ? { body: object.body, contentType: object.httpMetadata?.contentType } : null;
  }
  async remove(key: string): Promise<void> {
    validateKey(key);
    await this.bucket.delete(key);
  }
  async exists(key: string): Promise<boolean> {
    validateKey(key);
    return (await this.bucket.head(key)) !== null;
  }
}
function validateKey(key: string): void {
  if (!/^attachments\/[a-zA-Z0-9_-]{8,128}\/(original|thumbnail)$/.test(key)) {
    throw new Error("Invalid attachment object key");
  }
}
