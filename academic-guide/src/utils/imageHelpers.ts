export function getSmartCoverImage(title: string): string {
  if (!title) return "/defaults/default.jpg";
  
  const lowerTitle = title.toLowerCase();

  // Medicine
  if (/طب|صيدلة|تمريض|أسنان|مختبرات/.test(lowerTitle)) {
    return "/defaults/medicine.jpg";
  }
  
  // Tech
  if (/حاسوب|برمجة|تقنية|شبكات|سيبراني|ذكاء/.test(lowerTitle)) {
    return "/defaults/tech.jpg";
  }
  
  // Engineering
  if (/هندسة|مدني|معماري|ميكانيك/.test(lowerTitle)) {
    return "/defaults/engineering.jpg";
  }
  
  // Business
  if (/إدارة|محاسبة|تسويق|أعمال/.test(lowerTitle)) {
    return "/defaults/business.jpg";
  }
  
  return "/defaults/default.jpg";
}
