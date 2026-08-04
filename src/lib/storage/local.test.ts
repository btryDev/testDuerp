import { afterEach, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { LocalFileStorage } from "./local";

async function tmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "duerp-storage-"));
}

describe("LocalFileStorage", () => {
  const dirs: string[] = [];
  afterEach(async () => {
    while (dirs.length) {
      const d = dirs.pop();
      if (d) await fs.rm(d, { recursive: true, force: true });
    }
  });

  it("écrit puis relit un fichier sous une sous-clé", async () => {
    const root = await tmpDir();
    dirs.push(root);
    const s = new LocalFileStorage(root);

    const cle = "rapports/etab-1/rap-1-test.pdf";
    const data = Buffer.from("contenu de test");
    await s.put(cle, data, "application/pdf");

    expect(await s.exists(cle)).toBe(true);
    const relu = await s.get(cle);
    expect(relu.toString()).toBe("contenu de test");
  });

  it("supprime un fichier existant et reste OK si absent", async () => {
    const root = await tmpDir();
    dirs.push(root);
    const s = new LocalFileStorage(root);
    const cle = "rapports/x/abc.pdf";
    await s.put(cle, Buffer.from("x"), "application/pdf");
    await s.delete(cle);
    expect(await s.exists(cle)).toBe(false);
    // delete à nouveau = no-op
    await expect(s.delete(cle)).resolves.toBeUndefined();
  });

  it("refuse une clé contenant '..' (path traversal)", async () => {
    const root = await tmpDir();
    dirs.push(root);
    const s = new LocalFileStorage(root);
    await expect(
      s.put("../evade.pdf", Buffer.from("nope"), "application/pdf"),
    ).rejects.toThrow(/invalide/);
  });

  it("refuse une clé absolue", async () => {
    const root = await tmpDir();
    dirs.push(root);
    const s = new LocalFileStorage(root);
    await expect(
      s.put("/etc/passwd", Buffer.from("x"), "application/pdf"),
    ).rejects.toThrow(/invalide/);
  });
});
