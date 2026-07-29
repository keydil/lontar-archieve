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
    ]
  },
}

module.exports = nextConfig
