import Link from "next/link";

import { deleteProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIdr } from "@/lib/format-idr";
import * as productService from "@/lib/services/products";

export default async function ProductsPage() {
  const products = await productService.listProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-sm text-gray-600">Kelola katalog produk LM dan BR</p>
        </div>
        <Link href="/products/new">
          <Button>+ Produk Baru</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Nama</th>
                <th>Tipe</th>
                <th>Harga Base</th>
                <th>Harga Modal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-2 font-medium">{product.nama}</td>
                  <td>{product.tipe}</td>
                  <td>{formatIdr(Number(product.hargaBase))}</td>
                  <td>{formatIdr(Number(product.hargaModal))}</td>
                  <td className="space-x-2 text-right">
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <form
                      action={deleteProductAction.bind(null, product.id)}
                      className="inline"
                    >
                      <Button type="submit" variant="danger">
                        Hapus
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
