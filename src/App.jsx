import React,{useState, useEffect} from 'react'
import Header from './components/section/header'
import CalendarView from './components/section/calendar-view'
import {
  format,
  parse,
  startOfToday,
} from 'date-fns'
import { INITIAL_RESOURCE_DATA, INITIAL_EVENT_DATA } from "./data/initial-data";


export async function fetchInitialData() {
  const storedData = localStorage.getItem('guestaraResource');
  const storedDataEvents = localStorage.getItem('guestaraEvents');

  if (!storedData ) {
    const initialDataResource = JSON.stringify(INITIAL_RESOURCE_DATA);
    const initialDataEvents = JSON.stringify(INITIAL_EVENT_DATA);
    localStorage.setItem('guestaraResource', initialDataResource);
    localStorage.setItem('guestaraEvents', initialDataEvents);
    return Promise.resolve([INITIAL_RESOURCE_DATA,INITIAL_EVENT_DATA]);
  } else {
    console.log("entered")
    let responseResources = JSON.parse(storedData);
    let responseEvents = JSON.parse(storedDataEvents);
    return Promise.resolve([responseResources,responseEvents]);
  }
}




const App = () => {
  const [resources, setResources] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  let today = startOfToday()
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  useEffect(() => {
    async function fetchData() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const [responseResources,responseEvents] = await fetchInitialData();
          setEventsData(responseEvents);
          setResources(responseResources);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  },[])

  return (
    <>
      <Header firstDayCurrentMonth={firstDayCurrentMonth} setCurrentMonth={setCurrentMonth} />
      <CalendarView
        firstDayCurrentMonth={firstDayCurrentMonth}
        currentMonth={currentMonth}
        resources={resources}
        eventsData={eventsData}
        setResources={setResources}
        setEventsData={setEventsData}
      />
    </>
  )
}

export default App