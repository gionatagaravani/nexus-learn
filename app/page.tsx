"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, ArrowRight, PlayCircle, Clock, Sparkles, FolderPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { AddSubjectModal } from "@/components/add-subject-modal";
import { useTranslation } from "@/lib/i18n/i18n-context";

export default function Home() {
  const { user, profile, supabase } = useAuth();
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    let mounted = true;
    if (user) {
      fetchSubjects().then(() => {
        if (!mounted) return;
      });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [user, supabase]);

  const handleSubjectCreated = (newSubject: any) => {
    setSubjects(prev => [{ ...newSubject, materials: [] }, ...prev]);
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
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            {t('home.welcome', { name: displayName })}
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">
            {t('home.overview')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-black/[0.06] pb-8 pt-2">
          <div className="bg-white rounded-[12px] p-5 border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-3 group hover:border-black/[0.15] transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-black font-semibold text-[13px]">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
              {t('home.suggestedAction')}
            </div>
            <h3 className="text-[15px] font-semibold text-black leading-snug">
              {subjects.length > 0 ? t('home.reviewSubject', { name: subjects[0].name }) : t('home.createFirstSubject')}
            </h3>
            <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">
              {subjects.length > 0
                ? t('home.startStudying', { name: subjects[0].name })
                : t('home.addFirstSubject')}
            </p>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-black group-hover:gap-1.5 transition-all mt-auto pt-4">
              {subjects.length > 0 ? (
                <>
                  {t('home.startReview')} <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {t('home.createSubject')} <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[12px] p-5 border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-3 group hover:border-black/[0.15] transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
              <PlayCircle className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
              {t('home.continueStudying')}
            </div>
            {subjects.length > 0 ? (
              <>
                <h3 className="text-[15px] font-semibold text-black leading-snug">
                  {subjects[0].name}
                </h3>
                <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {t('home.filesUploaded', { count: subjects[0].materials?.length || 0 })}
                </p>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-600 group-hover:text-black group-hover:gap-1.5 transition-all mt-auto">
                  {t('home.open')} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-[15px] font-semibold text-black leading-snug">{t('home.noSubjectsYet')}</h3>
                <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {t('home.createFirstSubjectDesc')}
                </p>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-600 group-hover:text-black group-hover:gap-1.5 transition-all mt-auto">
                  {t('home.getStarted')} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FAFAFA] rounded-[12px] border border-black/[0.08] border-dashed flex flex-col items-center justify-center p-5 text-center hover:bg-neutral-100/50 hover:border-black/[0.15] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center justify-center text-black mb-3">
              <BookOpen className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-semibold text-black">{t('home.createNewSubject')}</h3>
            <p className="text-[13px] text-neutral-500 mt-1 max-w-[200px]">
              {t('home.createNewSubjectDesc')}
            </p>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-[15px] font-semibold text-black">
              {t('home.recentSubjects')}
            </h2>
            <Link
              href="/subjects"
              className="text-[13px] text-neutral-500 hover:text-black font-semibold transition-colors"
            >
              {t('common.viewAll')}
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-neutral-500">{t('home.loadingSubjects')}</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-black/[0.08] rounded-xl">
              <FolderPlus className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">{t('home.noSubjectsYet')}</h3>
              <p className="text-sm text-neutral-500 mb-4 max-w-md mx-auto">
                {t('home.noSubjectsDesc')}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                {t('home.createSubjectBtn')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject: any) => (
                <Link
                  key={subject.id}
                  href={`/subject/${subject.id}`}
                  className="block group"
                >
                  <div className="bg-white p-5 rounded-[12px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-black/[0.15] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
                    <h3 className="font-semibold text-[15px] text-black mb-5 flex items-center gap-2">
                      {subject.icon && <span className="text-lg leading-none">{subject.icon}</span>}
                      <span className="truncate">{subject.name}</span>
                    </h3>
                    <div className="flex items-center justify-between text-[12px] text-neutral-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {formatTimeAgo(subject.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {t('common.files', { count: subject.materials?.length || 0 })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {user && (
        <AddSubjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubjectCreated={handleSubjectCreated}
          userId={user.id}
        />
      )}
    </DashboardLayout>
  );
}
