import React,{useState} from 'react'
import Header from './components/section/header'
import CalendarView from './components/section/calendar-view'
import {
  format,
  parse,
  startOfToday,
} from 'date-fns'


const App = () => {

  let today = startOfToday()
  console.log(today)
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  return (
    <>
      <Header firstDayCurrentMonth={firstDayCurrentMonth} setCurrentMonth={setCurrentMonth} />
      <CalendarView firstDayCurrentMonth={firstDayCurrentMonth} currentMonth={currentMonth} />
    </>
  )
}

export default App