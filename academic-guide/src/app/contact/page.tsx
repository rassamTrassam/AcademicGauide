import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";
import { createClient } from "@/utils/supabase/server";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let defaultName = "";
  let defaultEmail = "";

  if (user) {
    defaultEmail = user.email || "";
    // try to get from user_profiles
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
      
    const profileData = profile as any;
    defaultName = profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "";
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              تواصل معنا
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              نحن هنا لمساعدتك! إذا كان لديك أي استفسار أو اقتراح، فلا تتردد في التواصل معنا.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm h-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">معلومات التواصل</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">رقم الهاتف</h3>
                    <p className="text-gray-600 dark:text-gray-400" dir="ltr">+967 736 288 846</p>
                    <p className="text-gray-600 dark:text-gray-400" dir="ltr">+967 713 801 592</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">البريد الإلكتروني</p>
                    <p className="text-gray-600 dark:text-gray-400">academic.guide.yemen@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">الموقع</h3>
                    <p className="text-gray-600 dark:text-gray-400">اليمن - تعز</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <ContactForm defaultName={defaultName} defaultEmail={defaultEmail} />
          </div>

        </div>
      </div>
    </div>
  );
}
