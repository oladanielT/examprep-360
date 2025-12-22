import CustomPageHeader from '@/components/global/custom-page-header';
import { paths } from '@/paths';
import Subjects from '@/feature/tests/components/exams/subjects';


export default function Page() {
  return (
    <div className=''>
      <CustomPageHeader
        backLink={paths.app.tests.getHref()}
        filter={true}
        heading='Take a Test' subHeading='Pick a subject and year' />
      <Subjects />
    </div>
  )
}
