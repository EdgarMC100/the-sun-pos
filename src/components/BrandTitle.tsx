import { pacifico } from '@/app/fonts';
import styles from './BrandTitle.module.css';

interface BrandTitleProps {
  children: string;
  className?: string;
}

export default function BrandTitle({ children, className = '' }: BrandTitleProps) {
  return (
    <h1 className={`${styles.title} ${pacifico.className} ${className}`}>
      {children}
    </h1>
  );
}
