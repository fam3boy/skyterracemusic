'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Music, 
  ListMusic, 
  CalendarDays, 
  History, 
  ClipboardList, 
  Settings2, 
  LogOut,
  ChevronRight,
  User,
  Bell,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-hyundai-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hyundai-black"></div>
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '신청곡 관리', href: '/admin/requests', icon: Music },
    { name: '플레이리스트', href: '/admin/playlist', icon: ListMusic },
    { name: '월별 테마', href: '/admin/themes', icon: CalendarDays },
    { name: '발송 로그', href: '/admin/mail-logs', icon: History },
    { name: '활동 로그', href: '/admin/audit-logs', icon: ClipboardList },
    { name: '시스템 설정', href: '/admin/settings', icon: Settings2 },
  ];

  return (
    <div className="flex min-h-screen bg-hyundai-gray-50 font-sans antialiased">
      {/* 1. Lateral Navigation (Operate Sidebar) */}
      <aside className="w-72 bg-hyundai-black text-white shrink-0 flex flex-col border-r border-white/10 z-50">
        <div className="h-24 px-8 flex items-center border-b border-white/5">
          <Link href="/admin/dashboard" className="flex flex-col gap-0.5 group">
             <span className="text-hyundai-gold text-[10px] font-black tracking-[0.4em] uppercase block group-hover:text-white transition-colors">Operate System</span>
             <h2 className="text-xl font-black tracking-tighter text-white">SKYTERRACE MUSIC</h2>
          </Link>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 transition-all text-sm font-bold uppercase tracking-tight",
                  isActive 
                    ? "bg-hyundai-gold text-hyundai-black shadow-lg shadow-hyundai-gold/20" 
                    : "text-hyundai-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-hyundai-black" : "text-current")} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-hyundai-black/40" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           <div className="p-4 bg-white/5 rounded-sm">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-hyundai-gold flex items-center justify-center text-hyundai-black font-black text-xs uppercase">
                 {session.user?.email?.[0] || 'A'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs font-black text-white truncate">{session.user?.email}</p>
                 <p className="text-[10px] font-bold text-hyundai-gray-400 uppercase tracking-widest leading-none mt-1">Administrator</p>
               </div>
             </div>
           </div>
           <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-xs font-black text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Operate Header */}
        <header className="h-24 bg-white border-b border-hyundai-gray-200 shrink-0 px-10 flex items-center justify-between z-40">
           <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-hyundai-black"></div>
              <div>
                <h3 className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-widest mb-0.5">Management Workspace</h3>
                <p className="text-sm font-black text-hyundai-black uppercase">{navItems.find(i => i.href === pathname)?.name || 'Admin Area'}</p>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-hyundai-gray-300">
                <Search className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Cmd + K for Quick Search</span>
              </div>
              <div className="w-px h-6 bg-hyundai-gray-100 hidden md:block"></div>
              <div className="flex items-center gap-6">
                 <button className="relative text-hyundai-gray-400 hover:text-hyundai-black transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-hyundai-gold rounded-full"></span>
                 </button>
                 <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                       <p className="text-[10px] font-black text-hyundai-black leading-none mb-1 capitalize">{session.user?.name || 'Administrator'}</p>
                       <p className="text-[9px] font-bold text-hyundai-gray-400 leading-none">Internal Access</p>
                    </div>
                    <div className="w-10 h-10 bg-hyundai-gray-50 border border-hyundai-gray-100 flex items-center justify-center text-hyundai-gray-400">
                       <User className="w-6 h-6" />
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#F7F8FA]">
           <div className="p-10 min-h-full">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
