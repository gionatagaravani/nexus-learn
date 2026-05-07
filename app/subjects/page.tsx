"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, ArrowRight, Clock, FolderPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { AddSubjectModal } from "@/components/add-subject-modal";
import { useTranslation } from "@/lib/i18n/i18n-context";

export default function SubjectsPage() {
  const { user, profile, supabase } = useAuth();
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('subjects')
        .select('*, materials(count)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user, supabase]);

  const handleSubjectCreated = (newSubject: any) => {
    setSubjects(prev => [{ ...newSubject, materials: [] }, ...prev]);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm(t('subjects.deleteConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert(t('subjects.deleteError'));
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return t('common.justNow');
    if (seconds < 3600) return t('common.minutesAgo', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('common.hoursAgo', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('common.daysAgo', { count: Math.floor(seconds / 86400) });
    return t('common.weeksAgo', { count: Math.floor(seconds / 604800) });
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pt-6 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {t('subjects.title', { name: displayName })}
            </h1>
            <p className="text-sm text-neutral-500 mt-1 font-medium">
              {subjects.length === 1 ? t('subjects.count_one') : t('subjects.count_other', { count: subjects.length })}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {t('subjects.newSubjectBtn')}
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">{t('subjects.loading')}</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-black/[0.08] rounded-xl">
            <FolderPlus className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">{t('subjects.noSubjectsTitle')}</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {t('subjects.noSubjectsDesc')}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t('subjects.createFirstBtn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((subject: any) => (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-black/[0.15] transition-all group"
              >
                <Link
                  href={`/subject/${subject.id}`}
                  className="p-5 block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center text-xl">
                      {subject.icon || <BookOpen className="w-5 h-5 text-black" />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteSubject(subject.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-black mb-4">{subject.name}</h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {t('common.files', { count: subject.materials?.length || 0 })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {formatTimeAgo(subject.created_at)}
                    </span>
                  </div>
                </Link>
                <div className="border-t border-black/[0.06] p-4 pt-3">
                  <Link
                    href={`/subject/${subject.id}`}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors group-hover:text-black"
                  >
                    {t('subjects.openSubject')} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <AddSubjectModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubjectCreated={handleSubjectCreated}
            userId={user.id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
