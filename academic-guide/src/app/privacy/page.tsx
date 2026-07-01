import { ShieldCheck, Lock, FileText, Database } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | الدليل الأكاديمي اليمني",
  description: "تعرف على كيفية جمع واستخدام وحماية بياناتك في الدليل الأكاديمي اليمني.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">سياسة الخصوصية</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">آخر تحديث: 1 يوليو 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 shadow-sm space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
              <Database size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">1. جمع البيانات</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نقوم في منصة الدليل الأكاديمي اليمني بجمع معلوماتك الأساسية عند التسجيل، والتي قد تشمل: الاسم، البريد الإلكتروني، وغيرها من المعلومات التي تقدمها طواعية. بالإضافة إلى ذلك، نقوم بتخزين تفضيلاتك (البرامج المفضلة) وتقييماتك لتحسين تجربتك الشخصية.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
              <FileText size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">2. استخدام البيانات</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              نستخدم البيانات التي نجمعها للأغراض التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 marker:text-brand-500">
              <li>توفير الخدمات والمميزات المخصصة لك.</li>
              <li>السماح لك بالتواصل المباشر مع الجهات التعليمية.</li>
              <li>تحليل وتحسين أداء المنصة بناءً على التفاعل الفعلي.</li>
              <li>إرسال التحديثات الهامة المتعلقة بحسابك أو بالخدمة.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
              <Lock size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">3. أمان البيانات</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نحن نتخذ كافة التدابير الأمنية المتقدمة والمناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح. نستخدم خدمات آمنة لمعالجة وتخزين البيانات.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
              <ShieldCheck size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">4. مشاركة البيانات</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              لا نقوم ببيع أو تأجير بياناتك الشخصية لأي أطراف خارجية. قد تتم مشاركة معلومات الاتصال الخاصة بك مع المؤسسات التعليمية فقط في حالة قيامك بمراسلتهم بشكل مباشر أو تقديم طلب من خلال المنصة، وذلك لتسهيل تواصلهم معك.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
