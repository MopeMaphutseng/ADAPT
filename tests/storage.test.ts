import { describe, it, expect } from "vitest";
import { deleteImageObjectByUrl, isR2Configured, putImageObject } from "@/lib/storage";

const configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL,
);

describe.skipIf(!configured)("R2 media storage", () => {
  it("uploads a public object and deletes it", async () => {
    expect(isR2Configured()).toBe(true);
    const key = `media/r2-test-${Date.now()}.txt`;
    const url = await putImageObject(key, Buffer.from("r2-test"), "text/plain");
    expect(url.startsWith(process.env.R2_PUBLIC_BASE_URL!)).toBe(true);

    const head = await fetch(url);
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("r2-test");

    expect(await deleteImageObjectByUrl(url)).toBe(true);
  });
});
