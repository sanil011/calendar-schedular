import { useState, useEffect } from 'react'
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    startOfToday,
    getTime,
    constructFrom,
    formatISO, parseISO, setHours, setMinutes
} from 'date-fns'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from '../../helper/utility';

import { INITIAL_RESOURCE_DATA, INITIAL_EVENT_DATA } from "../../data/initial-data";



function CalendarView({ firstDayCurrentMonth, currentMonth }) {
    const [resources, setResources] = useState(INITIAL_RESOURCE_DATA);
    const [eventsData, setEventsData] = useState(INITIAL_EVENT_DATA);

    let days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    })

    const handleCellClick = (e) => {
        console.log(e.target)
    }

    const firstRender = () => {
        const rowContainer = document.querySelectorAll('.row-cont');
        for (let i = 0; i < rowContainer.length; i++) {
            eventsData.map((data, idx) => {
                let row = rowContainer[i]
                let rowDate = row.getAttribute("data-date");
                let rowMonth = +format(rowDate, 'M ');
                let rowYear = +format(rowDate, 'y ');

                let month = +format(data.start, 'M ');
                let year = +format(data.start, 'y ');
                let day = +format(data.start, 'd ');
                let lastDay = +format(data.end, 'd ');;

                if (year == rowYear && rowMonth == month) {
                    let cell = row.querySelector(`[data-date="${data.start.substring(0, 10)}"][data-resource="${data.resource}"]`);
                    let el = document.querySelector(`[data-event="${data.title}"]`);
                    if (cell && !el) {
                        let startTime = +format(data.start, 'H ');
                        let endTime = +format(data.end, 'H ');
                        let left = ((day - 1) * 80) + startTime * 3.33;
                        let width = (((lastDay * 24) - (day * 24) - startTime + endTime) * 3.33)
                        const newDiv = document.createElement('div');
                        newDiv.setAttribute('class','event')
                        newDiv.style.position = 'absolute';
                        newDiv.style.top = '4px'
                        newDiv.style.left = left + 'px';
                        newDiv.style.width = width + 'px';
                        newDiv.style.cursor = 'pointer';
                        newDiv.setAttribute('data-event',data.title)
                        let color = row.getAttribute("data-color")
                        // newDiv.draggable = true; 
                        newDiv.addEventListener('mousedown',(e)=>mousedown(e,data.title,eventsData))
                        newDiv.innerHTML = `<div style="background-color:${color};" class='px-2 group relative py-[1px] rounded-md'>
                        <div style="border:1px solid ${color};" class='dot-left dot | cursor-w-resize absolute top-1/2 hidden -translate-y-1/2 -left-1 w-2 h-2 rounded-full bg-white transition-all'></div>
                        <div style="border:1px solid ${color};" class='dot-right dot | cursor-e-resize absolute top-1/2 hidden -translate-y-1/2 -right-1 w-2 h-2 rounded-full bg-white transition-all'></div>
        <p class='text-xs font-semibold'>${data.title}</p>
            <p class='flex items-center text-[10px]'><span class='start | mr-1'>${format(data.start, 'h:mm a')}</span> <span class='end'> ${format(data.end, 'h:mm a')}</span> </p>
    </div>`;
                        // Add event listeners to show child divs on hover
                        newDiv.addEventListener('mouseenter', () => {
                            newDiv.querySelectorAll('.dot').forEach(childDiv => {
                                childDiv.style.display = 'block';
                            });
                        });

                        newDiv.addEventListener('mouseleave', () => {
                            newDiv.querySelectorAll('.dot').forEach(childDiv => {
                                childDiv.style.display = 'none';
                            });
                        });


                        let currentResizer;
                        let isResizing;


                        function mousedown(e,title,data) {
                            let el = document.querySelector(`[data-event="${title}"]`);
                            // const firstChildElement = el.firstElementChild;
                            const elData = data.filter((el) => el.title === title);
                            console.log(elData);
                            
                            currentResizer = e.target;
                            isResizing = true;

                            let prevX = e.clientX;
                            // let prevY = e.clientY;

                            window.addEventListener("mousemove", mousemove);
                            window.addEventListener("mouseup", mouseup);

                            function mousemove(e) {
                                const rect = el.getBoundingClientRect();

                                if (currentResizer.classList.contains("dot-left")) {
                                    // el.style.cursor = 'w-resize'
                                    let left = rect.left - 160;
                                    el.style.width = rect.width + (prevX - e.clientX) + "px";
                                    el.style.left = left - (prevX - e.clientX) + "px";
                                    let startTime = left  % 80;
                                    let time = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
                                    let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                                    elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00') : updateDateTime(elData[0].start, hours, minutes)
                                } else if (currentResizer.classList.contains("dot-right")) {
                                    el.style.width = rect.width - (prevX - e.clientX) + "px";
                                    let endTime = (+rect.left + +rect.width) % 80;
                                    let time = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
                                    let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                                    elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00') : updateDateTime(elData[0].end,hours,minutes )
                                } 

                                prevX = e.clientX;
                                // prevY = e.clientY;
                                el.style.cursor = 'pointer'
                                setEventsData((prev) => {
                                    return prev.map((event) => {
                                        if (event.title == title) {
                                            return {
                                                title: elData[0].title,
                                                resource: elData[0].resource,
                                                end: elData[0].end,
                                                start: elData[0].start
                                            };
                                        } else {
                                            return event;
                                        }
                                    })
                                })
                            }

                            function mouseup() {
                                window.removeEventListener("mousemove", mousemove);
                                window.removeEventListener("mouseup", mouseup);
                                isResizing = false;
                            }
                        }
                        row.appendChild(newDiv);
                    } else {
                        if (el) {
                            const endElement = el?.querySelector('.end');
                            const startElement = el?.querySelector('.start');
                            endElement.innerHTML = format(data.end, 'h:mm a');
                            startElement.innerHTML = format(data.start, 'h:mm a');
                        }
                    }
                } else {
                    const element = row.querySelectorAll('.event');
                    if (element.length > 0) {
                        for (let i = 0; i < element.length; i++) {
                            row?.removeChild(element[i])
                        }
                    }
                }
            }
            )
        }
    }

    function updateDateTime(isoDateString, hours, minutes) {
        console.log(isoDateString,hours,minutes)
        let date = parseISO(isoDateString);


        // Set the updated time
        let updatedDate = setHours(date, hours);
        updatedDate = setMinutes(updatedDate, minutes);

        // Format the updated date into ISO string
        let updatedIsoDateString = formatISO(updatedDate);

        return updatedIsoDateString;
    }




    useEffect(() => {
        firstRender()
    }, [currentMonth,eventsData])


    // console.log(constructFrom('2024-05-05T00:00:00+05:30','14'))
    const onDragEnd = () => {
        
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid-cont w-full h-[calc(100vh-4rem)] relative overflow-scroll">

                    <div className="top-left-dummy-box | fixed z-40 w-40 h-8 border border-gray-400 bg-white"></div>

                    <div style={{ position: "-webkit-sticky" }} className="resource-cont | z-30 w-40 bg-white sticky mt-8 top-8 left-0">
                        {INITIAL_RESOURCE_DATA.map((resource) => {
                            return (
                                <div key={resource.id} className='h-16 w-40 pl-2 pt-2 border border-b-0 border-gray-400'>
                                    <p className='font-semibold'>{resource.name}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="cells-cont |  absolute z-20 top-0 left-40 ">
                        {/* Days */}
                        <div style={{ position: "-webkit-sticky" }} className="day-cont |  flex sticky top-0 bg-white z-30  left-8">
                            {days.map((day) => {
                                return (
                                    <div key={formatISO(day)} className={cn('flex justify-center items-center border border-gray-400 border-l-0  w-20 h-8')}>
                                        <p className={cn("text-sm", isToday(day) && 'bg-[#007AFE] text-white px-1.5 py-[2px] rounded-full')}>{format(day, 'd EEE')}</p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Cells */}

                        {/* <div className='absolute z-30 top-8 left-0 '> */}
                        {resources.map((resource, i) => {
                            return (
                                <Droppable key={ind} droppableId={`${resource.id}`}>
                                <div
                                    key={resource.id}
                                    id='row-cont'
                                    data-date={formatISO(days[1]).substring(0, 10)}
                                    data-color={resource.color} 
                                    className='row-cont | flex relative'>
                                    {days.map((day, j) => {
                                        return (
                                            <>
                                                <div key={formatISO(day)} data-resource={resource.id} data-id={`${resource.id}${j}`} data-date={formatISO(day).substring(0, 10)} onClick={handleCellClick}
                                                    className={cn('cell |relative h-16 w-20 border-r border-t  border-gray-400 flex justify-center items-center')}>
                                            </div>
                                            </>
                                        )
                                    })}
                                </div>
                                </Droppable>
                            )
                        })}
                        {/* </div> */}


                    </div>
                </div>
            </DragDropContext>
        </>
    )
}

export default CalendarView
