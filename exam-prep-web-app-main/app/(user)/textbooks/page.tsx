import CustomCard from '@/components/global/custom-card'
import CustomPageHeader from '@/components/global/custom-page-header'
import { paths } from '@/paths'

export default function Page() {
  return (
    <div className=''>
      <CustomPageHeader
        backLink={paths.app.root.getHref()}
        heading='Text Books' filter={true} subHeading='Pick a Subject and year' />
      <div className=' grid grid-cols-5 gap-5 py-10'>
        {new Array(10).fill(0).map((_, index) =>
          <CustomCard key={index} src='/img/algebra.png'>
            <h6 className=' text-lg  font-medium text-center pt-2'>Intro to Algebra</h6></CustomCard>
        )}
      </div>
    </div>
  )
}
