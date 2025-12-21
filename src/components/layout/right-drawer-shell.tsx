 'use client';

 import React, { useCallback, useEffect, useMemo, useState } from 'react';
 import { useRouter } from 'next/navigation';
 import { X } from 'lucide-react';
 import { useSession } from 'next-auth/react';
 import { cn } from '@/lib/utils';

 type DrawerContextValue = {
   close: () => void;
   isDrawer: boolean;
 };

 const DrawerContext = React.createContext<DrawerContextValue | null>(null);

 export function useDrawerClose(parentHref?: string) {
   const ctx = React.useContext(DrawerContext);
   const router = useRouter();

   return useCallback(() => {
     if (ctx?.isDrawer) {
       ctx.close();
       return;
     }
     if (parentHref) {
       router.push(parentHref);
       return;
     }
     router.back();
   }, [ctx, parentHref, router]);
 }

 type RightDrawerShellProps = {
   title?: string;
   parentHref?: string;
   children: React.ReactNode;
 };

 const DEFAULT_WIDTH = 640;
 const MIN_WIDTH = 560;
 const MAX_WIDTH = 720;

 export function RightDrawerShell({
   title,
   parentHref,
   children,
 }: RightDrawerShellProps) {
   const router = useRouter();
   const { data: session } = useSession();
   const [isDesktop, setIsDesktop] = useState(false);
   const [width, setWidth] = useState(DEFAULT_WIDTH);
   const [isResizing, setIsResizing] = useState(false);

   const storageKey = useMemo(() => {
     const identity =
       session?.user?.id || session?.user?.email || 'anon';
     return `sb.drawerWidth.v1.${identity}`;
   }, [session?.user?.id, session?.user?.email]);

   const close = useCallback(() => {
     if (typeof window !== 'undefined' && window.history.length > 1) {
       router.back();
     } else if (parentHref) {
       router.push(parentHref);
     } else {
       router.push('/');
     }
   }, [router, parentHref]);

   useEffect(() => {
     if (typeof window === 'undefined') return;
     const media = window.matchMedia('(min-width: 768px)');
     const handleChange = () => setIsDesktop(media.matches);
     handleChange();
     media.addEventListener('change', handleChange);
     return () => media.removeEventListener('change', handleChange);
   }, []);

   useEffect(() => {
     if (!isDesktop) return;
     const stored = localStorage.getItem(storageKey);
     if (stored) {
       const parsed = Number(stored);
       if (!Number.isNaN(parsed)) {
         setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed)));
       }
     }
   }, [isDesktop, storageKey]);

   useEffect(() => {
     if (!isDesktop) return;
     localStorage.setItem(storageKey, String(width));
   }, [width, isDesktop, storageKey]);

   useEffect(() => {
     if (!isDesktop) return;
     const original = document.body.style.overflow;
     document.body.style.overflow = 'hidden';
     return () => {
       document.body.style.overflow = original;
     };
   }, [isDesktop]);

   useEffect(() => {
     if (!isResizing) return;
     const handleMove = (event: MouseEvent) => {
       const nextWidth = Math.min(
         MAX_WIDTH,
         Math.max(MIN_WIDTH, window.innerWidth - event.clientX)
       );
       setWidth(nextWidth);
     };
     const handleUp = () => setIsResizing(false);
     window.addEventListener('mousemove', handleMove);
     window.addEventListener('mouseup', handleUp);
     return () => {
       window.removeEventListener('mousemove', handleMove);
       window.removeEventListener('mouseup', handleUp);
     };
   }, [isResizing]);

   useEffect(() => {
     if (!isDesktop) return;
     const handleKey = (event: KeyboardEvent) => {
       if (event.key === 'Escape') close();
     };
     window.addEventListener('keydown', handleKey);
     return () => window.removeEventListener('keydown', handleKey);
   }, [close, isDesktop]);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-background">
        {children}
      </div>
    );
  }

   return (
     <DrawerContext.Provider value={{ close, isDrawer: true }}>
       <div className="fixed inset-0 z-50">
         <div
           className="absolute inset-0 bg-black/30"
           onClick={close}
         />
         <div
           className={cn(
             'absolute right-0 top-0 h-full bg-background shadow-xl',
             'flex flex-col'
           )}
           style={{ width }}
           onClick={(event) => event.stopPropagation()}
         >
           <div
             className="absolute left-0 top-0 h-full w-2 cursor-col-resize"
             onMouseDown={() => setIsResizing(true)}
           />
           <div className="flex items-center justify-between border-b px-4 py-3">
             <div className="text-sm font-semibold">{title}</div>
             <button
               type="button"
               onClick={close}
               className="rounded-md p-1 text-muted-foreground hover:text-foreground"
               aria-label="Close"
             >
               <X className="h-4 w-4" />
             </button>
           </div>
           <div className="flex-1 overflow-auto">{children}</div>
         </div>
       </div>
     </DrawerContext.Provider>
   );
 }
