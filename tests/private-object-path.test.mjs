import assert from "node:assert/strict";
import test from "node:test";
import {
  extractOwnedPrivateObjectPath,
  extractPrivateObjectPath,
  resolvePrivatePhotoUrl,
} from "../src/lib/storage/private-object.ts";

test("signed URL lama dikonversi kembali menjadi object path private", () => {
  const legacy = "https://project.supabase.co/storage/v1/object/sign/dokumen/user-id/foto_helper/profile.jpg?token=expired";
  assert.equal(extractPrivateObjectPath(legacy, "dokumen"), "user-id/foto_helper/profile.jpg");
});

test("path lokal publik tetap dipakai tanpa signer", async () => {
  let signerCalled = false;
  const result = await resolvePrivatePhotoUrl("/images/helpers/orang1.jpeg", async () => {
    signerCalled = true;
    return "unused";
  });

  assert.equal(result, "/images/helpers/orang1.jpeg");
  assert.equal(signerCalled, false);
});

test("object path dan signed URL lama di-sign ulang untuk response", async () => {
  const calls = [];
  const signer = async (path, expiresIn) => {
    calls.push({ path, expiresIn });
    return `https://signed.example/${path}`;
  };

  const direct = await resolvePrivatePhotoUrl("user-id/foto_helper/profile.jpg", signer);
  const legacy = await resolvePrivatePhotoUrl(
    "https://project.supabase.co/storage/v1/object/sign/dokumen/user-id/foto_helper/legacy.jpg?token=expired",
    signer,
  );

  assert.equal(direct, "https://signed.example/user-id/foto_helper/profile.jpg");
  assert.equal(legacy, "https://signed.example/user-id/foto_helper/legacy.jpg");
  assert.deepEqual(calls, [
    { path: "user-id/foto_helper/profile.jpg", expiresIn: 300 },
    { path: "user-id/foto_helper/legacy.jpg", expiresIn: 300 },
  ]);
});

test("URL eksternal yang bukan object storage tidak diteruskan", async () => {
  const result = await resolvePrivatePhotoUrl("https://example.com/profile.jpg", async () => "unused");
  assert.equal(result, null);
});

test("object path upload harus berada di folder user dan tipe dokumen yang benar", () => {
  const userId = "11111111-1111-4111-8111-111111111111";
  const ownPath = `${userId}/foto_helper/profile.jpg`;

  assert.equal(extractOwnedPrivateObjectPath(ownPath, userId, "foto_helper"), ownPath);
  assert.equal(
    extractOwnedPrivateObjectPath("22222222-2222-4222-8222-222222222222/foto_helper/profile.jpg", userId, "foto_helper"),
    null,
  );
  assert.equal(extractOwnedPrivateObjectPath(`${userId}/ktp/profile.jpg`, userId, "foto_helper"), null);
});
