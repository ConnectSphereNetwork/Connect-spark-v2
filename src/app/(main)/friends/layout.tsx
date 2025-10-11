"use client"
import { usePathname } from 'next/navigation';

export default function FriendsLayout({ list, details }: { list: React.ReactNode; details: React.ReactNode; }) {
  const pathname = usePathname();
  const isDetailsPage = pathname.split('/').length > 2; // e.g. /friends/some-user

  return (
    <div className="grid md:grid-cols-[350px_1fr] h-full">
       <aside className={`border-r bg-muted/20 ${isDetailsPage ? 'hidden md:block' : 'block'}`}>
        {list}
      </aside>
      <section className={`${isDetailsPage ? 'block' : 'hidden md:block'}`}>
        {details}
      </section>
    </div>
  );
}