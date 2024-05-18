import React from 'react'
import {
    add,
    format,
} from 'date-fns'
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const Header = ({ firstDayCurrentMonth , setCurrentMonth}) => {
    function previousMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }

    function nextMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }
    
  return (
    <div className='h-16 flex justify-between px-4 items-center'>
          <h1 className='text-[#007AFE] text-2xl'>{format(firstDayCurrentMonth, 'MMMM yyyy')}</h1>
          <div className='flex text-[#007AFE] items-center gap-2'>
              <ChevronLeft onClick={previousMonth} className='cursor-pointer hover:opacity-60' />
              <h1 className='text-base'>Today</h1>
              <ChevronRight onClick={nextMonth} className='cursor-pointer hover:opacity-60'/>
          </div>
   </div>
  )
}

export default Header