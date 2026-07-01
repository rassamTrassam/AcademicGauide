"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProgram } from "@/app/actions/programs";

export function DeleteProgramButton({ programId, programTitle }: { programId: string, programTitle: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`هل أنت متأكد من حذف البرنامج "${programTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      startTransition(async () => {
        const result = await deleteProgram(programId);
        if (result.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      title="حذف البرنامج"
      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}
