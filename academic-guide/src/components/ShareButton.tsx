"use client";

import { Share2 } from "lucide-react";

export default function ShareButton() {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ الرابط بنجاح!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="p-2 backdrop-blur-sm bg-black/20 text-white rounded-lg hover:bg-black/40 transition-colors" 
      title="مشاركة"
    >
      <Share2 size={20} />
    </button>
  );
}
