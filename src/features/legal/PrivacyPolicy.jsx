export function PrivacyPolicy() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        lineHeight: 1.7,
        color: "#12201A",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Kebijakan Privasi BERSERI
      </h1>
      <p style={{ color: "#57685C", marginBottom: 32 }}>
        Terakhir diperbarui: 3 Oktober 2026
      </p>

      <p>
        BERSERI ("Bersih Sampah Setiap Hari") adalah platform pengelolaan
        sampah yang digunakan oleh Dinas Lingkungan Hidup, warga, petugas
        lapangan, unit Bank Sampah, dan pelaku usaha. Kebijakan ini
        menjelaskan data apa saja yang kami kumpulkan dan bagaimana data
        tersebut digunakan.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32 }}>
        Data yang kami kumpulkan
      </h2>
      <ul>
        <li>Nama lengkap, alamat email, nomor HP, dan alamat tempat tinggal</li>
        <li>
          Data terkait peran akun Anda — misalnya data usaha untuk akun
          Pelaku Usaha, atau unit Bank Sampah untuk akun Bank Sampah
        </li>
        <li>
          Data transaksi pengelolaan sampah (kategori, berat, nilai) yang
          dicatat oleh petugas atau unit Bank Sampah
        </li>
        <li>Foto yang diunggah sebagai bukti/dokumentasi pengambilan sampah</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32 }}>
        Bagaimana data digunakan
      </h2>
      <p>
        Data digunakan semata-mata untuk mengoperasikan layanan BERSERI:
        menjadwalkan dan mencatat pengelolaan sampah, menyusun laporan untuk
        Dinas Lingkungan Hidup, dan menampilkan riwayat/rekap kepada
        masing-masing akun sesuai perannya. Kami tidak menjual atau
        membagikan data Anda kepada pihak ketiga untuk tujuan iklan.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32 }}>
        Layanan pihak ketiga yang kami gunakan
      </h2>
      <p>
        Untuk menjalankan BERSERI, kami menggunakan:
      </p>
      <ul>
        <li>
          <strong>Clerk</strong> — untuk autentikasi akun, termasuk opsi masuk
          dengan Google
        </li>
        <li>
          <strong>Supabase</strong> — untuk penyimpanan data aplikasi secara
          aman
        </li>
        <li>
          <strong>Google Sign-In</strong> — jika Anda memilih masuk dengan
          akun Google, kami hanya menerima nama, email, dan foto profil dasar
          dari akun tersebut
        </li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32 }}>
        Hak Anda
      </h2>
      <p>
        Anda dapat meminta untuk melihat, memperbarui, atau menghapus data
        akun Anda kapan saja dengan menghubungi kami melalui kontak di bawah.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32 }}>
        Kontak
      </h2>
      <p>
        Pertanyaan seputar privasi atau data Anda dapat disampaikan ke{" "}
        <a href="mailto:hanifmulyazam2@gmail.com">
          hanifmulyazam2@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
