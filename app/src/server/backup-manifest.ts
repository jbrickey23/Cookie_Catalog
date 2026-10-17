/** Provider-neutral backup manifest. No purchased content or secrets belong in source control. */
export interface BackupObject {
  attachmentId: string;
  key: string;
  byteSize: number;
  sha256: string;
}
export interface BackupManifest {
  format: "cookie-catalog-backup";
  version: 1;
  exportedAt: string;
  schemaVersion: string;
  databaseFile: string;
  objects: BackupObject[];
}
export function validateBackupManifest(value: BackupManifest): void {
  if (value.format !== "cookie-catalog-backup" || value.version !== 1) throw new Error("Unsupported backup manifest");
  if (!value.schemaVersion || !value.databaseFile || !Number.isFinite(Date.parse(value.exportedAt))) throw new Error("Incomplete backup manifest");
  const seen = new Set<string>();
  for (const item of value.objects) {
    if (!item.attachmentId || !/^attachments\/[a-zA-Z0-9_-]{8,128}\/(original|thumbnail)$/.test(item.key)) throw new Error("Invalid backup object");
    if (!Number.isSafeInteger(item.byteSize) || item.byteSize < 0 || !/^[a-fA-F0-9]{64}$/.test(item.sha256)) throw new Error("Invalid backup checksum/size");
    if (seen.has(item.key)) throw new Error("Duplicate backup object");
    seen.add(item.key);
  }
}
