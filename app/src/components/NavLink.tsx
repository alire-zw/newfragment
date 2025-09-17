'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

const NavLink = memo(({ href, children, className = '', activeClassName = '' }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={`${className} ${isActive ? activeClassName : ''}`}
      prefetch={true}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export default NavLink;
