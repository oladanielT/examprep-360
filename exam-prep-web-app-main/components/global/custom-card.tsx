import React, { ReactNode } from 'react'
import { Card } from '../ui/card'
import Image from 'next/image';
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
                <Image width={1000} height={1000} alt='subject' src={src} className={cn(' object-cover mx-auto h-24 w-32', imgClassName )} />
            </Card>
            {children}
        </div>
    )
}
