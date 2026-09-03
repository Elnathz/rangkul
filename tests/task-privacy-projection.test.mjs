import assert from "node:assert/strict";
import test from "node:test";

import { projectHelperTaskPrivacy } from "../src/lib/helper/task-privacy.ts";

const task = {
  helper_id: null,
  catatan: "Kode pagar ada di bawah pot bunga.",
  lansia: {
    nama: "Mbah Privat",
    alamat: "Jl. Privat No. 10",
    kelurahan: "Pleburan",
    kecamatan: "Semarang Selatan",
    kabupaten_kota: "Kota Semarang",
    foto_url: "private/photo.jpg",
    catatan_kondisi: "Catatan kondisi privat.",
    lat: -7.005,
    lng: 110.438,
  },
};

test("task marketplace tidak membuka identitas, alamat, catatan, foto, atau koordinat lansia", () => {
  assert.deepEqual(projectHelperTaskPrivacy(task, "helper-a"), {
    assigned: false,
    lansia_nama: "Penerima layanan",
    lansia_alamat: "Pleburan, Semarang Selatan, Kota Semarang",
    lansia_foto_url: null,
    catatan_kondisi: null,
    catatan_tugas: null,
    lat: null,
    lng: null,
  });
});

test("Helper assigned menerima detail yang diperlukan untuk menjalankan task", () => {
  const assignedTask = { ...task, helper_id: "helper-a" };
  assert.deepEqual(projectHelperTaskPrivacy(assignedTask, "helper-a"), {
    assigned: true,
    lansia_nama: "Mbah Privat",
    lansia_alamat: "Jl. Privat No. 10",
    lansia_foto_url: "private/photo.jpg",
    catatan_kondisi: "Catatan kondisi privat.",
    catatan_tugas: "Kode pagar ada di bawah pot bunga.",
    lat: -7.005,
    lng: 110.438,
  });
});
