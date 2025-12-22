import CustomPageHeader from '@/components/global/custom-page-header'
import { paths } from '@/paths'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className=''>
      <CustomPageHeader
        backLink={paths.app.root.getHref()}
        heading='Take a Test' subHeading='Pick an Exam you' />
      <div className=' grid grid-cols-3  py-10 gap-5'>
       {new Array(6).fill(0).map((_, i) =>
          <Link key={i} href={paths.app.tests.exams.getHref()} className=' bg-[#FFF0B333] rounded-3xl  shadow p-5  items-center flex border justify-between'>
          <div  className=' flex items-center  gap-5'>

            <Image src={"/img/note.png"} alt='note' width={1000} height={1000} className='w-14 h-14' />
            <div>
              <h6 className=' text-lg font-semibold'>Jamb</h6>
              <p className=' font-medium text-xs'>6 Subjects</p>
            </div>
          </div>
          <span className=' bg-white  w-10 h-10 flex items-center  justify-center rounded-full  shadow'>

            <ChevronRight className=' text-green-400 ' />
          </span>
        </Link>)}
      </div>
    </div>
  )
}
