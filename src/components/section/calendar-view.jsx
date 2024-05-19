import { useState, useEffect, useRef, useCallback } from 'react'
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isToday,
    formatISO, parseISO, setHours, setMinutes
} from 'date-fns'
import { cn } from '../../helper/utility';

import { INITIAL_RESOURCE_DATA, INITIAL_EVENT_DATA } from "../../data/initial-data";



function CalendarView({ firstDayCurrentMonth, currentMonth }) {
    const [resources, setResources] = useState(INITIAL_RESOURCE_DATA);
    const [eventsData, setEventsData] = useState(INITIAL_EVENT_DATA);
    const dragPoint = useRef(null);
    const dragElement = useRef(null);
    const parentElement = useRef(null);
    let resizing = false;

    let days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    })



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
                    let el = document.querySelector(`[data-event="${data.title}"]`);
                    if (row.getAttribute('data-resource') == data.resource && !el) {
                        let startTime = +format(data.start, 'H ');
                        let endTime = +format(data.end, 'H ');
                        let left = ((day - 1) * 80) + startTime * 3.33;
                        let width = (((lastDay * 24) - (day * 24) - startTime + endTime) * 3.33)
                        const newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'event')
                        newDiv.style.position = 'absolute';
                        newDiv.style.top = '4px'
                        newDiv.style.left = left + 'px';
                        newDiv.style.width = width + 'px';
                        newDiv.style.cursor = 'pointer';
                        newDiv.setAttribute('data-event', data.title);
                        let color = row.getAttribute("data-color")
                        newDiv.draggable = true;
                        newDiv.addEventListener('mousedown', (e) => mousedown(e, data.title, eventsData))
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

                        newDiv.addEventListener('dragstart', dragStart);
                        newDiv.addEventListener('dragend', dragEnd);

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
                            element[i].removeEventListener('dragstart', dragStart);
                            element[i].removeEventListener('dragend', dragEnd);
                            row?.removeChild(element[i])
                        }
                    }
                }
            }
            )
        }
    }


    let currentResizer;


    function mousedown(e, title, data) {
        let el = document.querySelector(`[data-event="${title}"]`);

        const elData = data.filter((el) => el.title === title);

        currentResizer = e.target;

        let prevX = e.clientX;
        const handleMouseMove = (e) => {
            mousemove(e, title, data); // Adjust arguments as necessary
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", mouseup);

        function mousemove(e) {
            const rect = el.getBoundingClientRect();
            let parent = currentResizer.parentElement.parentElement;

            if (currentResizer.classList.contains("dot-left") && parent.getAttribute('data-event') === title) {
                el.draggable = false;
                let left = rect.left - 160;
                el.style.width = rect.width + (prevX - e.clientX) + "px";
                el.style.left = left - (prevX - e.clientX) + "px";
                let startTime = left % 80;
                let time = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
                let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00') : updateDateTime(elData[0].start, hours, minutes)
            } else if (currentResizer.classList.contains("dot-right") && parent.getAttribute('data-event') === title) {
                console.log(parent)
                el.draggable = false;
                el.style.width = rect.width - (prevX - e.clientX) + "px";
                let endTime = (+rect.left + +rect.width) % 80;
                let time = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
                let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00') : updateDateTime(elData[0].end, hours, minutes)
            }
            prevX = e.clientX;
            el.style.cursor = 'pointer'

            if (currentResizer.classList.contains("dot")) {
                console.log(elData)

            }
        }

        function mouseup() {
            setEventsData((prev) => {
                const newState = prev.map((event) => {
                    if (event.title == title) {
                        return {
                            ...event,
                            end: elData[0].end,
                            start: elData[0].start
                        };
                    } else {
                        return event;
                    }
                })
                console.log('Updating state with', newState);
                return newState;
            })
            el.draggable = true;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", mouseup);
        }
    }

    function updateDateTime(isoDateString, hours, minutes) {
        console.log(isoDateString, hours, minutes)
        let date = parseISO(isoDateString);

        // Set the updated time
        let updatedDate = setHours(date, hours);
        updatedDate = setMinutes(updatedDate, minutes);

        // Format the updated date into ISO string
        let updatedIsoDateString = formatISO(updatedDate);

        return updatedIsoDateString;
    }

    function dragStart(e) {
        console.log(this)
        dragElement.current = this;
        parentElement.current = this.parentElement
        dragPoint.current = e.offsetX;
        console.log(dragPoint)
    }

    function dragEnd() {
        console.log(this)
    }

    function dragOver(e) {
        e.preventDefault();
        // console.log(e.offsetX)
    }

    function dragEnter(e) {
        e.preventDefault();
        // console.log(this)
        // console.log(e.clientX)
    }

    function dragLeave() {
    }

    // function dragDrop(e, data) {
    //     console.log("called dragDrop",e.target,dragElement.current,parentElement.current)
    //     if (!parentElement.current || !dragElement.current) return;
    //     parentElement.current.removeChild(dragElement.current);
    //     let parent = e.target.parentElement

    //     let title = dragElement.current.getAttribute('data-event');
    //     console.log(title);
    //     const elData = data.filter((el) => el.title === title);
    //     let newLeft = e.clientX - 160 - dragPoint.current;
    //     let width = dragElement.current.getBoundingClientRect().width;


    //     let endTime = (newLeft +width) % 80;
    //     let timeEnd = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
    //     let [hours, minutes] = timeEnd ? timeEnd.split(':') : ['00', '00'];
    //     elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00') : updateDateTime(elData[0].end, hours, minutes)

    //     let startTime = newLeft % 80;
    //     let time = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
    //     let [hour, minute] = time ? time.split(':') : ['00', '00'];
    //     elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00') : updateDateTime(elData[0].start, hour, minute)


    //     dragElement.current.style.left = newLeft + 'px'
    //     parent.appendChild(dragElement.current);

    //     setEventsData((prev) => {
    //         return prev.map((event) => {
    //             if (event.title == title) {
    //                 return {
    //                     title: elData[0].title,
    //                     resource: elData[0].resource,
    //                     end: elData[0].end,
    //                     start: elData[0].start
    //                 };
    //             } else {
    //                 return event;
    //             }
    //         })
    //     })
    //     // console.log(elData[0])
    //     // console.log(e.clientX, e.offsetX )
    //     // console.log(dragPoint, e.clientX, parent, dragElement.current, parentElement.current)
    //     parentElement.current = null;
    //     dragElement.current = null;
    //     dragPoint.current = null;
    // }
    function dragDrop(e, data) {
        console.log("called dragDrop", e.target, dragElement.current, parentElement.current);
        if (parentElement.current == null || dragElement.current == null) return;

        // Check if the current parent actually contains the element to be moved
        if (!parentElement.current.contains(dragElement.current)) {
            console.error("The node to be removed is not a child of the parent node.");
            return;
        }

        try {
            let parent = e.target.closest('.row-cont'); // Make sure to drop into a '.row-cont'
            if (!parent) {
                console.error("Drop target is not a row container.");
                return;
            }
            parentElement.current.removeChild(dragElement.current);


            let title = dragElement.current.getAttribute('data-event');
            const elData = data.filter((el) => el.title === title);

            let newLeft = e.clientX - parent.getBoundingClientRect().left - dragPoint.current;
            let width = dragElement.current.getBoundingClientRect().width;

            let endTime = (newLeft + width) % 80;
            let timeEnd = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
            let [hoursEnd, minutesEnd] = timeEnd ? timeEnd.split(':') : ['00', '00'];
            elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00') : updateDateTime(elData[0].end, hoursEnd, minutesEnd);

            let startTime = newLeft % 80;
            let timeStart = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
            let [hoursStart, minutesStart] = timeStart ? timeStart.split(':') : ['00', '00'];
            elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00') : updateDateTime(elData[0].start, hoursStart, minutesStart);

            newLeft = newLeft < 0 ? 0 : newLeft;
            console.log(newLeft)
            dragElement.current.style.left = newLeft + 'px';
            parent.appendChild(dragElement.current);

            setEventsData((prev) => {
                return prev.map((event) => {
                    if (event.title == title) {
                        return {
                            ...event,
                            end: elData[0].end,
                            start: elData[0].start
                        };
                    } else {
                        return event;
                    }
                });
            });

            // Reset references after successful move
            // parentElement.current = null;
            // dragElement.current = null;
            // dragPoint.current = null;
        } catch (error) {
            console.error("Failed to execute drag and drop:", error);
        }
    }

   
    const handleDrop = (e, eventsData) => {
        dragDrop(e, eventsData);
    };

    useEffect(() => {
        firstRender();

        const rowContainer = document.querySelectorAll('.row-cont');
        rowContainer.forEach(row => {
            row.addEventListener('dragover', dragOver);
            row.addEventListener('dragenter', dragEnter);
            row.addEventListener('dragleave', dragLeave);
            row.addEventListener('drop', (e) => handleDrop(e, eventsData));
        });
        return () => {
            rowContainer.forEach(row => {
                row.removeEventListener('dragover', dragOver);
                row.removeEventListener('dragenter', dragEnter);
                row.removeEventListener('dragleave', dragLeave);
                row.removeEventListener('drop', (e) => handleDrop(e, eventsData)); // Modify this to correctly remove the specific handler
            });
        };
    }, [currentMonth, eventsData])


    useEffect(() => {
        console.log("Effect has run because eventsData changed significantly");
    }, [eventsData]);

    return (
        <>
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
                    {resources.map((resource, i) => {
                        return (
                            <div
                                key={resource.id}
                                // onDragOver={dragOver}
                                // onDragEnter={dragEnter}
                                // onDragLeave={dragLeave}
                                // onDrop={dragDrop}
                                id='row-cont'
                                data-date={formatISO(days[1]).substring(0, 10)}
                                data-color={resource.color}
                                data-resource={resource.id}
                                className='row-cont | flex relative w-full h-16 border-t border-gray-400'>
                                {days.map((day, j) => {
                                    return (
                                        <div
                                            key={formatISO(day)}
                                            // data-resource={resource.id}
                                            // data-id={`${resource.id}${j}`}
                                            // data-date={formatISO(day).substring(0, 10)}
                                            // onClick={handleCellClick}
                                            className={cn('cell |relative h-16 w-20 border-r   border-gray-400 flex justify-center items-center')}>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default CalendarView
