import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "لا توجد نتائج مطابقة",
  message = "حاول تعديل خيارات البحث أو تقليل الفلاتر للحصول على نتائج أكثر.",
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-3xl bg-bg-surface border border-border border-dashed my-8">
      <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 text-brand-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <SearchX size={40} />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary px-8">
          {actionText}
        </button>
      )}
    </div>
  );
}
