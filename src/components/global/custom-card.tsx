import type { ReactNode } from 'react'
import { Card } from '../ui/card'
// Image converted to img tag;
import { cn } from '@/lib/utils';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    src: string;
    imgClassName?: string;
}

export default function CustomCard({ children, className, src, imgClassName, ...props }: CardProps) {
    return (
        <div {...props} className={className}>
            <Card className='p-10 shadow-md! border-[#EBEBEB] '>
                <img width={1000} height={1000} alt='subject' src={src} className={cn(' object-cover mx-auto h-24 w-32', imgClassName )} />
            </Card>
            {children}
        </div>
    )
}
