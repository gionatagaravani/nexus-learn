"use client";

import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  BrainCircuit,
  PlusCircle,
  FileText,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { AddSubjectModal } from "./add-subject-modal";

const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Exercises", href: "/exercises", icon: BookOpen },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isDesktopCollapsed?: boolean;
  setIsDesktopCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ 
  isMobileOpen = false, 
  setIsMobileOpen, 
  isDesktopCollapsed = false, 
  setIsDesktopCollapsed 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, supabase } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) {
      setSubjects(data.map(s => ({ ...s, open: false, items: [] })));
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user, supabase]);

  const handleSubjectCreated = (newSubject: any) => {
    setSubjects(prev => [{ ...newSubject, open: false, items: [] }, ...prev]);
  };

  const toggleSubject = (id: string) => {
    if (isDesktopCollapsed && setIsDesktopCollapsed) {
      setIsDesktopCollapsed(false); // Expand on interaction if needed
    }
    setSubjects(subjects.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return 'JD';
  };

  const isCollapsed = isDesktopCollapsed;

  return (
    <>
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#FAFAFA] flex flex-col border-r border-black/[0.06]
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
          md:relative md:translate-x-0 md:flex ${isCollapsed ? 'md:w-[68px]' : 'md:w-64'}
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-black/[0.06] shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity text-black overflow-hidden">
            <BrainCircuit className="w-5 h-5 text-black shrink-0" />
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Nexus</span>
          </Link>
          
          {/* Mobile close button */}
          <button 
            className="md:hidden text-neutral-500 hover:text-black"
            onClick={() => setIsMobileOpen?.(false)}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button 
            className={`hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-black/[0.04] text-neutral-400 hover:text-black transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            onClick={() => setIsDesktopCollapsed?.(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6">
          <nav className="flex flex-col gap-1 px-3">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-black/[0.04] text-black"
                      : "text-neutral-500 hover:text-black hover:bg-black/[0.03]"
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  onClick={() => setIsMobileOpen?.(false)}
                >
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="px-3">
            <div className={`flex items-center mb-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && (
                <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest px-3">
                  My Subjects
                </h4>
              )}
              <button
                onClick={() => {
                  if (isCollapsed && setIsDesktopCollapsed) setIsDesktopCollapsed(false);
                  setIsAddModalOpen(true);
                }}
                className="text-neutral-400 hover:text-black transition-colors p-1 rounded hover:bg-black/[0.04]"
                title="Add new subject"
              >
                <PlusCircle className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex flex-col gap-0.5">
              {subjects.length === 0 ? (
                !isCollapsed && (
                  <p className="px-3 py-2 text-xs text-neutral-400">
                    No subjects yet. Create your first one!
                  </p>
                )
              ) : (
                subjects.map((subject) => (
                  <div key={subject.id} className="flex flex-col">
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      title={isCollapsed ? subject.name : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-500 hover:text-black hover:bg-black/[0.03] transition-colors ${isCollapsed ? 'justify-center' : 'text-left'}`}
                    >
                      <FolderOpen className={`w-4 h-4 shrink-0 ${subject.open && !isCollapsed ? 'text-black' : 'text-neutral-400'}`} strokeWidth={subject.open && !isCollapsed ? 2.5 : 2} />
                      {!isCollapsed && <span className="flex-1 truncate">{subject.name}</span>}
                    </button>
                    {subject.open && !isCollapsed && (
                      <div className="ml-5 mt-1 mb-1 pl-3 border-l border-black/[0.06] flex flex-col gap-1">
                        <Link 
                          href={`/subject/${subject.id}`} 
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-medium text-neutral-500 hover:text-black hover:bg-black/[0.03] transition-colors"
                          onClick={() => setIsMobileOpen?.(false)}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          Materials & Notes
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-black/[0.06] shrink-0">
          <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'gap-3'}`}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-xs shadow-sm shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-black leading-tight truncate">
                  {profile?.full_name || profile?.email || 'User'}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium truncate">
                  {profile?.email || 'student@nexus.learn'}
                </span>
              </div>
            )}
            
            <button
              onClick={handleSignOut}
              className="text-neutral-400 hover:text-black hover:bg-black/[0.04] p-1.5 rounded-md transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
    </>
  );
}
