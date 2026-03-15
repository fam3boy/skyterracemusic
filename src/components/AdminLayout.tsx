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
  Search,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-hyundai-black text-white shrink-0 flex flex-col border-r border-white/10 z-[100] transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-24 px-8 flex items-center justify-between border-b border-white/5">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
             <div className="relative h-10 flex items-center">
               <img 
                 src="/logo.png" 
                 alt="THE HYUNDAI" 
                 className="h-full w-auto object-contain hidden"
                 onError={(e) => (e.currentTarget.style.display = 'none')}
                 onLoad={(e) => (e.currentTarget.style.display = 'block')}
               />
               <div className="flex flex-col gap-0.5">
                 <span className="text-hyundai-gold text-[12px] font-bold tracking-normal uppercase block group-hover:text-white transition-colors">운영 시스템</span>
                 <h2 className="text-xl font-bold tracking-tighter text-white">SKYTERRACE</h2>
               </div>
             </div>
          </Link>
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} 
                className={cn(
                  "flex items-center gap-4 px-4 py-4 transition-all text-[16px] font-bold uppercase tracking-tight",
                  isActive 
                    ? "bg-hyundai-gold text-hyundai-black shadow-lg shadow-hyundai-gold/20" 
                    : "text-hyundai-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-hyundai-black" : "text-current")} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-hyundai-black/40" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           <div className="p-4 bg-white/5 rounded-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-hyundai-gold flex items-center justify-center text-hyundai-black font-bold text-sm uppercase">
                 {session.user?.email?.[0] || 'A'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{session.user?.email}</p>
                  <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-normal leading-none mt-1">시스템 관리자</p>
               </div>
             </div>
           </div>
           <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-4 px-4 py-4 text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-normal"
          >
             <LogOut className="w-5 h-5" />
             로그아웃
           </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Operate Header */}
        <header className="h-24 bg-white border-b border-hyundai-gray-200 shrink-0 px-6 lg:px-10 flex items-center justify-between z-40">
           <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-hyundai-black hover:bg-hyundai-gray-50 rounded-lg mr-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-1.5 h-8 bg-hyundai-black hidden sm:block"></div>
               <div>
                 <h3 className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mb-0.5">운영 워크스페이스</h3>
                 <p className="text-lg font-bold text-hyundai-black uppercase">{navItems.find(i => i.href === pathname)?.name || '관리자 영역'}</p>
               </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-hyundai-gray-300">
                <Search className="w-5 h-5" />
                 <span className="text-[11px] font-bold uppercase tracking-normal hidden xl:block">Cmd + K로 빠른 메뉴 검색</span>
              </div>
              <div className="w-px h-8 bg-hyundai-gray-100 hidden md:block"></div>
              <div className="flex items-center gap-6">
                 <button className="relative text-hyundai-gray-400 hover:text-hyundai-black transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-hyundai-gold rounded-full"></span>
                 </button>
                 <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[12px] font-bold text-hyundai-black leading-none mb-1 capitalize">{session.user?.name || '관리자'}</p>
                        <p className="text-[10px] font-bold text-hyundai-gray-400 leading-none">내부 보안 접속 중</p>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-hyundai-gray-50 border border-hyundai-gray-100 flex items-center justify-center text-hyundai-gray-400">
                       <User className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#F7F8FA]">
           <div className="p-6 lg:p-10 min-h-full">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
