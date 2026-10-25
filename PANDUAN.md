# Panduan edit portofolio

Buka folder `portofolio2` di VS Code. Jalankan `index.html` dengan Live Server, atau buka langsung di browser. Tidak perlu npm atau build.

## 1. Menamai dan menyimpan gambar

Pakai huruf kecil, angka, dan tanda hubung. Hindari spasi. Ekstensi di kode harus sama dengan file aslinya, termasuk huruf besar/kecil saat sudah di-hosting.

Contoh struktur yang disarankan:

```text
portofolio2/
  index.html
  content.js
  assets/
    cbt-cover.webp
    cbt-dashboard.webp
    cbt-ujian.webp
    rajawali-home.webp
    cert-ai-bootcamp.jpg
    adullam-cover.webp
    adullam-home.webp
    adullam-events.webp
```

JPG, PNG, dan WebP bisa dipakai. Mengganti nama `.png` menjadi `.webp` tidak mengubah format gambar; ekspor atau konversi sungguhan jika ingin memakai WebP. Untuk screenshot antarmuka, gunakan sumber yang tajam, idealnya lebar sekitar 1600–2000 px. Usahakan ukuran file di bawah 1 MB bila kualitasnya masih jelas.

Semua path seperti `assets/cbt-dashboard.webp` dihitung dari folder yang berisi `index.html`. Jangan masukkan path komputer seperti `C:\Users\...`.

## 2. Mengganti foto hero dan portrait

Foto hero saat ini memakai:

- `assets/1.webp`: foto kiri atas.
- `assets/2.webp`: foto kanan atas.
- `assets/3.webp`: foto kiri bawah.

Cara termudah: timpa gambar tersebut dengan file baru yang nama dan formatnya sama. Jika nama atau format baru berbeda, cari nama file lama di `index.html`, lalu ganti atribut `src`. Sesuaikan juga `alt` supaya mendeskripsikan fotonya.

Portrait Introduction memakai `about-1.webp` sampai `about-4.webp`. Pertahankan ukuran kanvas dan posisi tubuh yang serupa supaya pergantian pose tidak terasa melompat. Background transparan akan mempertahankan tampilan cutout.

## 3. Mengganti cover dan menambahkan screenshot proyek

Buka `content.js`, lalu cari judul proyek dalam array `projects`.

`image` adalah cover polaroid di langit. `gallery` adalah kumpulan gambar dalam popup. Keduanya diatur terpisah, jadi mengubah `image` saja tidak otomatis mengganti gambar popup.

Contoh mengganti cover dan galeri CBT:

```js
image: "assets/cbt-cover.webp",
gallery: [
  {
    src: "assets/cbt-dashboard.webp",
    alt: "Dashboard mahasiswa pada platform CBT",
    caption: "Student dashboard",
  },
  {
    src: "assets/cbt-ujian.webp",
    alt: "Halaman pengerjaan ujian CBT",
    caption: "Exam experience",
  },
],
```

Simpan gambar terlebih dahulu ke `assets/`, lalu isi path yang benar. Satu objek `{ ... }` berarti satu slide. Urutan objek menjadi urutan slide; tombol panah, thumbnail, swipe, dan penghitung menyesuaikan otomatis. Kalau baru satu gambar, tombol panah memang dinonaktifkan.

Untuk menghapus slide, hapus satu objek lengkap. Jangan menghapus penutup `]` milik `gallery`.

## 4. Memasukkan gambar sertifikat

Di bagian `certificates` dalam `content.js`, setiap sertifikat memiliki properti `image` yang sementara kosong:

```js
{
  name: "AI Engineer Bootcamp",
  issuer: "FullStack Bangalore",
  image: "assets/cert-ai-bootcamp.jpg",
  date: "FEB 2026",
},
```

Letakkan `cert-ai-bootcamp.jpg` ke folder `assets/`, lalu isi `image` seperti contoh. Tidak perlu mengedit HTML atau kode popup.

Jika `image: ""`, popup menampilkan gambar kosong. Jika path salah atau gambar gagal dibuka, popup kembali ke placeholder. Jika sertifikat berbentuk PDF, ekspor halamannya menjadi JPG/PNG/WebP terlebih dahulu karena viewer ini menampilkan gambar.

Untuk menambah sertifikat, salin satu objek lengkap di dalam array `certificates`, lalu ubah nama, penyelenggara, tanggal, dan gambar.

## 5. Menambah proyek baru

1. Simpan cover dan screenshot asli ke `assets/`.
2. Buka `content.js` dan cari `projects: [`.
3. Temukan akhir objek proyek terakhir, tepat sebelum penutup `],` yang diikuti `certificates`.
4. Tambahkan objek baru setelah objek terakhir. Setiap objek dipisahkan koma.
5. Sesuaikan deskripsi, kontribusi pribadi, teknologi, tanggal, dan URL dengan proyek aslinya.

Contoh objek lengkap yang bisa ditempel **di dalam array `projects`**. Nama file berikut adalah contoh; file tersebut belum disertakan:

```js
{
  title: "Nama Proyek Baru",
  category: "WEB APPLICATION · PERSONAL PROJECT",
  date: "October 2026",
  color: "orange",
  cover: "05",
  image: "assets/proyek-baru-cover.webp",
  gallery: [
    {
      src: "assets/proyek-baru-home.webp",
      alt: "Halaman utama proyek baru",
      caption: "Home page",
    },
    {
      src: "assets/proyek-baru-detail.webp",
      alt: "Halaman detail proyek baru",
      caption: "Detail page",
    },
  ],
  tags: ["Frontend", "Backend", "UI design"],
  intro: "Satu kalimat singkat tentang tujuan proyek ini.",
  description:
    "Jelaskan masalah yang diselesaikan, pengguna yang dituju, dan fungsi utama proyek.",
  contributions: [
    "Jelaskan kontribusi pertama yang benar-benar kamu kerjakan.",
    "Jelaskan kontribusi kedua.",
  ],
  tools: "React · Express · PostgreSQL",
  demo: "",
  repository: "",
},
```

`color`, `cover`, dan `tags` dipertahankan dari skema awal. Nomor polaroid dan tombol navigasi versi ini dihitung otomatis dari urutan array. Isi `demo` atau `repository` dengan URL `https://...` agar tombolnya muncul. Biarkan kosong jika belum tersedia.

**Tidak perlu menambah kartu di HTML.** Polaroid, popup, tombol nomor, dan panjang perjalanan scroll menyesuaikan jumlah proyek. Empat proyek memakai panjang awal 620svh di desktop; tiap proyek tambahan menambah sekitar satu tinggi layar. Di HP, tombol nomor bisa digeser horizontal jika jumlahnya banyak.

Untuk mengubah urutan proyek, pindahkan objek lengkap ke posisi yang diinginkan dalam array. Untuk menghapus proyek, hapus objek lengkapnya. Sisakan minimal satu proyek.

## 6. Kalau perubahan belum terlihat

- Simpan file di VS Code, lalu refresh browser. Gunakan `Ctrl + Shift + R` jika versi lama masih terlihat.
- Pastikan file yang diedit adalah folder versi yang sedang dibuka, bukan `portofolio1` atau versi sebelumnya.
- Jika gambar kosong, cocokkan nama, ekstensi, dan kapitalisasi dengan isi `assets/`.
- Jika seluruh galeri hilang, cek koma, tanda kutip, serta kurung `{ }` dan `[ ]` di `content.js`. Buka DevTools (`F12`) → Console untuk melihat lokasi kesalahan.
- Saat upload ulang, sertakan `index.html`, `content.js`, `base.css`, `style.css`, seluruh folder `js/`, dan seluruh folder `assets/`.

## Struktur kode

- `index.html`: teks halaman, foto hero, serta susunan section.
- `content.js`: proyek, galeri screenshot, sertifikat, dan tech stack.
- `style.css`: desain terbaru; perubahan Revisi 2 ada di bagian akhir.
- `base.css`: fondasi desain awal.
- `js/main.js`: navigasi, drag foto, animasi portrait, dan scroll.
- `js/flight.js`: kamera galeri, polaroid, dan panjang scroll otomatis.
- `js/gallery.js`: popup proyek dan carousel gambar.
- `js/details.js`: popup sertifikat serta kedua typewriter.

Wave sekarang berada di dalam section proyek sebagai lapisan foreground. Langit dan lingkarannya berada di satu sticky scene di belakangnya, sehingga dekorasi tidak berhenti pada sambungan dua blok berbeda. Jangan memindahkan `.sky-entry` dan `.sky-exit` keluar dari `#work` jika ingin mempertahankan transisi ini.
