import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hl/database", "@hl/calculations"],
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/pelanggan", destination: "/customers", permanent: false },
      { source: "/pelanggan/:id", destination: "/customers/:id", permanent: false },
      { source: "/barang", destination: "/products", permanent: false },
      { source: "/penjualan", destination: "/transactions", permanent: false },
      { source: "/penjualan/baru", destination: "/transactions/new", permanent: false },
      { source: "/penjualan/:id", destination: "/transactions/:id", permanent: false },
    ];
  },
};

export default nextConfig;
