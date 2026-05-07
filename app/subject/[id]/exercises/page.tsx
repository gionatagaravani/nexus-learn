"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExercisesTab } from "../exercises-tab";
import { useAuth } from "@/components/auth-provider";

export default function ExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const subjectId = params.id as string;

  return (
    <div className="flex-1 flex flex-col min-h-0 pt-4">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-black/[0.05] transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-black">Esercizi & Quiz</h2>
      </div>
      <div className="flex-1 min-h-0">
        <ExercisesTab subjectId={subjectId} userId={user?.id} isScrolled={false} />
      </div>
    </div>
  );
}
