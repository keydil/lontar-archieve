/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Panel admin pindah dari ?tab= query param ke folder routes.
    // Redirect link/bookmark lama biar ga nyasar/404.
    return [
      {
        source: '/admin',
        has: [{ type: 'query', key: 'tab', value: 'naskah' }],
        destination: '/admin/arsip',
        permanent: true,
      },
      {
        source: '/admin',
        has: [{ type: 'query', key: 'tab', value: 'koleksi' }],
        destination: '/admin/koleksi-3d',
        permanent: true,
      },
      {
        source: '/admin',
        has: [{ type: 'query', key: 'tab', value: 'data' }],
        destination: '/admin/backup',
        permanent: true,
      },
      // Situs ini sekarang cuma satu section (Koleksi + Arsip Naskah) dari
      // museumtalagamanggung.com (Laravel), bukan "rumah" sendiri lagi —
      // homepage lama (hero/splash) di src/app/page.tsx jadi vestigial.
      // Dibiarkan ada (bukan dihapus) tapi gak lagi jadi tujuan navigasi;
      // siapapun yang mendarat di "/" langsung (bookmark lama, link
      // dibagikan, dsb.) diarahkan ke rumah yang sebenarnya.
      {
        source: '/',
        destination: 'https://museumtalagamanggung.com',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
