import Link from "next/link";
import { BookOpen, Globe, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen size={24} className="text-brand-600" />
              <span className="font-bold text-xl">دليل الأكاديمي اليمني</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              المنصة الشاملة للطلاب اليمنيين للبحث، المقارنة، والتقديم للبرامج الجامعية والدراسات العليا في جميع الجامعات اليمنية.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link href="/contact" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <MessageCircle size={20} />
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Globe size={20} />
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Mail size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-text-primary">روابط سريعة</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link href="/programs" className="hover:text-brand-600 transition-colors">تصفح البرامج</Link></li>
              <li><Link href="/universities" className="hover:text-brand-600 transition-colors">الجامعات</Link></li>
              <li><Link href="/compare" className="hover:text-brand-600 transition-colors">مقارنة التخصصات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-text-primary">مساعدة</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-brand-600 transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600 transition-colors">تواصل معنا</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-600 transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-text-muted">
          <p>© {new Date().getFullYear()} دليل الأكاديمي اليمني. جميع الحقوق محفوظة.</p>
          <p className="mt-2 md:mt-0">بني بكل 💙 من أجل مستقبل التعليم في اليمن</p>
        </div>
      </div>
    </footer>
  );
}
