export default function HeaderSection() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Quản lý Phiếu giảm giá
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium text-sm">
          Kiểm soát voucher và khuyến mãi của cửa hàng
        </p>
      </div>
    </div>
  );
}
