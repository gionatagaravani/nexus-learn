import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, ArrowRight, PlayCircle, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-black">Welcome back, Jane</h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">Here&apos;s your learning overview for today.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-black/[0.06] pb-8 pt-2">
          <div className="bg-white rounded-[12px] p-5 border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-3 group hover:border-black/[0.15] transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-black font-semibold text-[13px]">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
              Suggested Action
            </div>
            <h3 className="text-[15px] font-semibold text-black leading-snug">Review Machine Learning Mistakes</h3>
            <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">You struggled with SVM kernels in yesterday&apos;s quiz. Let&apos;s do a quick brush-up.</p>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-black group-hover:gap-1.5 transition-all mt-auto pt-4">
              Start review <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="bg-white rounded-[12px] p-5 border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-3 group hover:border-black/[0.15] transition-all cursor-pointer">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
              <PlayCircle className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
              Continue Studying
            </div>
            <h3 className="text-[15px] font-semibold text-black leading-snug">Linear Algebra - Eigenvectors</h3>
            <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed">Pick up exactly where you left off in Chapter 5 notes.</p>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-600 group-hover:text-black group-hover:gap-1.5 transition-all mt-auto pt-4">
              Resume <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-[#FAFAFA] rounded-[12px] border border-black/[0.08] border-dashed flex flex-col items-center justify-center p-5 text-center hover:bg-neutral-100/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center justify-center text-black mb-3">
              <BookOpen className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-semibold text-black">Generate New Quiz</h3>
            <p className="text-[13px] text-neutral-500 mt-1 max-w-[200px]">Test your knowledge on any recent material.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between mt-2">
              <h2 className="text-[15px] font-semibold text-black">Recent Subjects</h2>
              <Link href="/subjects" className="text-[13px] text-neutral-500 hover:text-black font-semibold transition-colors">View all</Link>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: '1', title: 'Machine Learning', date: '2 hours ago', count: 12 },
                { id: '2', title: 'Linear Algebra', date: 'Yesterday', count: 8 },
                { id: '3', title: 'Distributed Systems', date: '3 days ago', count: 24 },
                { id: '4', title: 'Web Development', date: '1 week ago', count: 5 },
              ].map(subject => (
                <Link key={subject.id} href={`/subject/${subject.id}`} className="block group">
                  <div className="bg-white p-5 rounded-[12px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-black/[0.15] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
                    <h3 className="font-semibold text-[15px] text-black mb-5">{subject.title}</h3>
                    <div className="flex items-center justify-between text-[12px] text-neutral-500 font-medium">
                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> {subject.date}</span>
                       <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" strokeWidth={2.5} /> {subject.count} files</span>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
