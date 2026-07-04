"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { updateUserAvatar } from "@/app/actions/settings";

interface ProfileAvatarClientProps {
  currentAvatarUrl: string | null;
  userName: string;
}

export default function ProfileAvatarClient({ currentAvatarUrl, userName }: ProfileAvatarClientProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة صالحة");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميغابايت");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const result = await updateUserAvatar(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم تحديث الصورة الشخصية بنجاح!");
    }
    
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
      <div className="relative group">
        <div 
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-500/20 relative cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {currentAvatarUrl ? (
            <Image
              src={currentAvatarUrl}
              alt="الصورة الشخصية"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-4xl font-bold">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity duration-200 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-xs font-semibold text-center leading-tight">تغيير<br/>الصورة</span>
              </>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{userName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تحديث صورتك الشخصية يساعد الآخرين في التعرف عليك.</p>
      </div>
    </div>
  );
}
