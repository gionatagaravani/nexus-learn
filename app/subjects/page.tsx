import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, ArrowRight, Clock, FolderPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { AddSubjectModal } from "@/components/add-subject-modal";

export default function SubjectsPage() {
  const { user, profile, supabase } = useAuth();
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
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated materials.')) {
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
      alert('Failed to delete subject');
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pt-6 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {displayName}&apos;s Subjects
            </h1>
            <p className="text-sm text-neutral-500 mt-1 font-medium">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            New Subject
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-black/[0.08] rounded-xl">
            <FolderPlus className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">No subjects yet</h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Create your first subject to start organizing your learning materials and taking notes.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Create Your First Subject
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
                        title="Delete subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-black mb-4">{subject.name}</h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {subject.materials?.length || 0} files
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
                    Open subject <ArrowRight className="w-4 h-4" />
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
