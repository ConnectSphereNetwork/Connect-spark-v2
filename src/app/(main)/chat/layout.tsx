"use client"
import { usePathname } from 'next/navigation';

export default function ChatLayout({ list, details }: { list: React.ReactNode; details: React.ReactNode; }) {
  const pathname = usePathname();
  const isDetailsPage = pathname.split('/').length > 2; // e.g. /chat/some-id

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-full">
      {/* On mobile, only show the list if we are on the base /chat page */}
      <aside className={`border-r bg-muted/20 ${isDetailsPage ? 'hidden md:block' : 'block'}`}>
        {list}
      </aside>
      {/* On mobile, only show the details if we are on a specific chat page */}
      <section className={`${isDetailsPage ? 'block' : 'hidden md:block'}`}>
        {details}
      </section>
    </div>
  );
}