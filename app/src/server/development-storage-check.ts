/** Only server-generated, disposable fixtures are written by this development check. */
function fixtures() {
  const pixel = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8S8AAAAASUVORK5CYII="), c => c.charCodeAt(0));
  const stl = new TextEncoder().encode("solid demo\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid demo\n");
  return [
    { name: "cutter-photo.png", contentType: "image/png", bytes: pixel },
    { name: "design-image.png", contentType: "image/png", bytes: pixel },
    { name: "sample.stl", contentType: "model/stl", bytes: stl }
  ];
}
export async function checkDevelopmentStorage(bucket: R2Bucket) {
  const prefix = `dev-checks/${crypto.randomUUID()}/`;
  const files = fixtures();
  const keys = files.map(file => prefix + file.name);
  let verified = 0;
  let failure: unknown;
  try {
    for (const [index, file] of files.entries()) {
      await bucket.put(keys[index], file.bytes, {
        httpMetadata: { contentType: file.contentType },
        customMetadata: { purpose: "cookie-catalog-disposable-development-check" },
        storageClass: "Standard"
      });
      const object = await bucket.get(keys[index]);
      if (!object || object.size !== file.bytes.byteLength
          || object.httpMetadata?.contentType !== file.contentType) throw new Error("Fixture metadata mismatch");
      const actual = new Uint8Array(await object.arrayBuffer());
      if (actual.length !== file.bytes.length || actual.some((byte, i) => byte !== file.bytes[i])) {
        throw new Error("Fixture bytes mismatch");
      }
      verified++;
    }
  } catch (error) {
    failure = error;
  } finally {
    // Delete only this request's three disposable keys, including a partially written fixture.
    try {
      await bucket.delete(keys);
      const remaining = await Promise.all(keys.map(key => bucket.head(key)));
      if (remaining.some(object => object !== null)) throw new Error("Fixture cleanup incomplete");
    } catch (error) {
      failure = error;
    }
  }
  if (failure) throw failure;
  return { storageConnected: true, filesVerified: verified, cleanupVerified: true };
}
