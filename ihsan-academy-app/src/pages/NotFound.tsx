import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-12 text-center sm:px-6">
      <div>
        <div className="mb-3 font-display text-7xl text-gold-300">٤٠٤</div>
        <h1 className="font-display text-3xl text-sand-50">لم نجد ما تبحث عنه</h1>
        <p className="mt-2 text-sand-100/60">الصفحة التي تطلبها غير موجودة في الأكاديمية.</p>
        <Link to="/" className="btn btn-primary mt-6">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
