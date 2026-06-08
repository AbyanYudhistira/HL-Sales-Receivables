import Link from "next/link";

import { deleteCustomerAction } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIdr } from "@/lib/format-idr";
import * as customerService from "@/lib/services/customers";

export default async function CustomersPage() {
  const customers = await customerService.listCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer</h1>
          <p className="text-sm text-gray-600">Kelola data customer dan diskon</p>
        </div>
        <Link href="/customers/new">
          <Button>+ Customer Baru</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2">Nama</th>
                <th>Diskon LM</th>
                <th>Diskon BR</th>
                <th>Threshold Bonus</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="py-2">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-[var(--primary)]"
                    >
                      {customer.nama}
                    </Link>
                  </td>
                  <td>{JSON.stringify(customer.discountLm)}</td>
                  <td>{JSON.stringify(customer.discountBr)}</td>
                  <td>{formatIdr(Number(customer.bonusThreshold))}</td>
                  <td className="space-x-2 text-right">
                    <Link href={`/customers/${customer.id}/edit`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <form
                      action={deleteCustomerAction.bind(null, customer.id)}
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
