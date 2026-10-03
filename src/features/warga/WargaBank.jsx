import { Wallet } from "lucide-react";
import { Card, IconBadge } from "../shared/ui";

export function WargaBank() {
  return (
    <div className="space-y-6">
      <Card className="text-center py-12">
        <IconBadge icon={Wallet} tone="primary" size={48} iconSize={22} className="mx-auto" />
        <p className="font-semibold mt-4">Saldo pribadi belum tersedia</p>
        <p className="text-sm ink-soft mt-1.5 max-w-sm mx-auto">
          Pencatatan setoran saat ini dikelola per unit Bank Sampah, bukan per warga.
          Untuk info saldo atau riwayat setoran Anda, silakan hubungi petugas Bank
          Sampah di wilayah Anda langsung.
        </p>
      </Card>
    </div>
  );
}
