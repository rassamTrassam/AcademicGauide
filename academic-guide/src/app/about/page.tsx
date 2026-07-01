import { BookOpen, GraduationCap, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "من نحن | الدليل الأكاديمي اليمني",
  description: "تعرف على رؤية ورسالة الدليل الأكاديمي اليمني، المنصة الأولى لتسهيل اختيار التخصص الجامعي في اليمن.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              من نحن
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              الدليل الأكاديمي اليمني هو منصتك الأولى لاكتشاف ومقارنة الجامعات والبرامج الأكاديمية في اليمن بطريقة ذكية وعصرية.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">رؤيتنا</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                نسعى لأن نكون المرجع الأساسي والشامل لكل طالب يمني يبحث عن مستقبله الأكاديمي، من خلال تقديم معلومات دقيقة ومحدثة وشفافة عن كافة المؤسسات التعليمية في اليمن.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">رسالتنا</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                تسهيل عملية البحث والمقارنة والاختيار للتخصصات الجامعية، وتقليص الفجوة بين طموحات الطلاب ومتطلبات سوق العمل من خلال توفير بيانات شاملة وأدوات مقارنة متطورة.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">قيمنا الأساسية</h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">الشفافية والمصداقية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">نستمد بياناتنا من مصادرها الرسمية لضمان الدقة والموثوقية.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">التركيز على الطالب</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تصميم المنصة وأدواتها يتمحور حول تسهيل رحلة الطالب التعليمية.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
