import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDevelopmentStorage } from "../src/server/development-storage-check";

function fakeBucket(mode = "ok") {
  const objects = new Map<string, { bytes: Uint8Array; contentType: string }>();
  let puts = 0;
  const bucket = {
    async put(key: string, bytes: Uint8Array, options: { httpMetadata: { contentType: string } }) {
      assert.match(key, /^dev-checks\/[a-f0-9-]+\/(cutter-photo\.png|design-image\.png|sample\.stl)$/);
      assert.ok(bytes.length < 1024);
      objects.set(key, { bytes: bytes.slice(), contentType: options.httpMetadata.contentType });
      puts++;
      if (mode === "partial-write") throw new Error("write uncertain");
      return {};
    },
    async get(key: string) {
      if (mode === "missing") return null;
      const object = objects.get(key)!;
      const bytes = mode === "corrupt" ? Uint8Array.from(object.bytes, b => b ^ 1) : object.bytes;
      return { size: bytes.length, httpMetadata: { contentType: object.contentType },
        arrayBuffer: async () => bytes.slice().buffer };
    },
    async delete(keys: string[]) {
      if (mode !== "cleanup-failure") keys.forEach(key => objects.delete(key));
    },
    async head(key: string) { return objects.get(key) ?? null; }
  } as unknown as R2Bucket;
  return { bucket, objects, puts: () => puts };
}
test("three fixed files round-trip and only disposable keys are cleaned", async () => {
  const fake = fakeBucket();
  fake.objects.set("real-original.stl", { bytes: new Uint8Array([1]), contentType: "model/stl" });
  assert.deepEqual(await checkDevelopmentStorage(fake.bucket), {
    storageConnected: true, filesVerified: 3, cleanupVerified: true
  });
  assert.equal(fake.puts(), 3);
  assert.deepEqual([...fake.objects.keys()], ["real-original.stl"]);
});
test("missing objects, byte corruption and partial writes fail and clean test files", async () => {
  for (const mode of ["missing", "corrupt", "partial-write"]) {
    const fake = fakeBucket(mode);
    await assert.rejects(checkDevelopmentStorage(fake.bucket));
    assert.equal(fake.objects.size, 0);
  }
});
test("incomplete cleanup is never reported as success", async () => {
  await assert.rejects(checkDevelopmentStorage(fakeBucket("cleanup-failure").bucket));
});
