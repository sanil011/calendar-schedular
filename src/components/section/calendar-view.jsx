import { useState, useEffect, useRef } from 'react'
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isToday,
    formatISO
} from 'date-fns'
import { cn, updateDateTime } from '../../helper/utility';
import { Plus } from 'lucide-react';
import { useDisclosure } from "@nextui-org/modal";
import AddEvent from '../modal/addEvent';
import AddResource from '../modal/addResource';

function CalendarView({ firstDayCurrentMonth, currentMonth, resources, setResources, eventsData, setEventsData }) {
   
    const dragPoint = useRef(null);
    const dragElement = useRef(null);
    const parentElement = useRef(null);
    const [newEvent, setNewEvent] = useState({
        start: '',
        end: '',
        title: '',
        resource: 1,
    })
    const [newResource, setNewResource] = useState({
        id: 1,
        name: '',
        color: '',
    });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const addEvent = useDisclosure();


    let days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    })


/**
 * function help to delete the event
 * @param title of event
 * @returns {void}
 */
    const handleDeletEvent = (e, title) => {
        // find higher level div of event like if we click on time that is p tag then we select its parent
        let div = e.target.closest(`[data-event="${title}"]`);

        let resource = div.getAttribute('data-resource');
        // find the row of resource
        let row = document.querySelector(`[data-resource="${resource}"].row-cont`);
         console.log(row,div)

        let update = [...eventsData]
        let rm = update.filter(event => event.title !== title);
        console.log(rm)
        
        setEventsData((prev) => {
            let updatedEvents = prev.filter(event => event.title !== title);
            localStorage.setItem('guestaraEvents', JSON.stringify(updatedEvents));
            return updatedEvents;
        });

        // remove event from a row
        if (row.contains(div)) {
            row.removeChild(div);
        }
        alert(`${title} is deleted`);
    }




/**
 * function help to  add event in the dom
 * @param {nothing}
 * @returns {void}
 */
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

                // Check row date and event date is equal or not
                if (year == rowYear && rowMonth == month) {
                    let el = document.querySelector(`[data-event="${data.title}"]`);

                    if (row.getAttribute('data-resource') == data.resource && !el) {
                        let startTime = +format(data.start, 'H ');
                        let endTime = +format(data.end, 'H ');
                        let left = ((day - 1) * 80) + startTime * 3.33;
                        let width = (((lastDay * 24) - (day * 24) - startTime + endTime) * 3.33)

                        // create a new event div to add in dom
                        const newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'event')
                        newDiv.style.position = 'absolute';
                        newDiv.style.top = '4px'
                        newDiv.style.left = left + 'px';
                        newDiv.style.width = width + 'px';
                        newDiv.style.cursor = 'pointer';
                        newDiv.setAttribute('data-event', data.title);
                        newDiv.setAttribute('data-resource',data.resource)
                        let color = row.getAttribute("data-color")
                        newDiv.style.backgroundColor = color;
                        newDiv.style.borderRadius = '6px';
                        newDiv.draggable = true;
                        newDiv.addEventListener("dblclick", (e) => handleDeletEvent(e, data.title));
                        newDiv.addEventListener('mousedown', (e) => mousedown(e, data.title, eventsData))
                        newDiv.innerHTML = `<div class='px-2  group relative py-[1px]'>
                        <div style="border:1px solid ${color};" class='dot-left dot | cursor-w-resize absolute top-1/2 hidden -translate-y-1/2 -left-1 w-2 h-2 rounded-full bg-white transition-all'></div>
                        <div style="border:1px solid ${color};" class='dot-right dot | cursor-e-resize absolute top-1/2 hidden -translate-y-1/2 -right-1 w-2 h-2 rounded-full bg-white transition-all'></div>
                        <p class='text-xs font-semibold'>${data.title}</p>
                        <p class='flex items-center text-[10px]'><span class='start | mr-1'>${format(data.start, 'h:mm a')}</span> <span class='end'> ${format(data.end, 'h:mm a')}</span> </p>
                        </div>`;

                        // Add event listeners to show points for resize on hover
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
                            // if element is already in dom just update their time and color
                            const endElement = el?.querySelector('.end');
                            const startElement = el?.querySelector('.start');

                            if (row.contains(el)) {
                                el.style.backgroundColor = row.getAttribute('data-color');
                                el.setAttribute('data-resource', row.getAttribute('data-resource'))
                            }
                            endElement.innerHTML = format(data.end, 'h:mm a');
                            startElement.innerHTML = format(data.start, 'h:mm a');
                        }
                    }
                } else {
                    // remove event;
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

    // function help to resize the event and update the time duration according to size and position of event
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

            // Simple logic is that one cube represent 80px so 1 hour represent 3.333px

            // resize on left
            if (currentResizer.classList.contains("dot-left") && parent.getAttribute('data-event') === title) {
                el.draggable = false;
                // 160px is resource width that why we remove 160 
                let left = rect.left - 160;

                let newLeft = left - (prevX - e.clientX);
                newLeft = newLeft < 0 ? 0 : newLeft;

                el.style.width = rect.width + (prevX - e.clientX) + "px";
                el.style.left = newLeft + "px";

                let startTime = newLeft % 80;
                let date = Math.floor(newLeft / 80) + 1;

                let time = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
                let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00',1) : updateDateTime(elData[0].start, hours, minutes,date)
            }
                // resize on right
            else if (currentResizer.classList.contains("dot-right") && parent.getAttribute('data-event') === title) {
                el.draggable = false;
                let left = rect.left - 160;

                let updatedWidth = rect.width - (prevX - e.clientX);
                el.style.width = updatedWidth + "px";
                
                let endTime = (+rect.left + rect.width - (prevX - e.clientX)) % 80;
                let date = Math.floor((updatedWidth + left) / 80) + 1;


                let time = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
                let [hours, minutes] = time ? time.split(':') : ['00', '00'];
                elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00',1) : updateDateTime(elData[0].end, hours, minutes,date)
            }
            prevX = e.clientX;
            el.style.cursor = 'pointer'
        }

        function mouseup() {
            setEventsData((prev) => {
                const newState = prev.map((event) => {
                    if (event.title == title && event.start !== elData[0].start && event.end !== elData[0].end ) {
                        return {
                            ...event,
                            end: elData[0].end,
                            start: elData[0].start
                        };
                    } else {
                        return event;
                    }
                })
                // updating new events data in local storage
                localStorage.setItem('guestaraEvents', JSON.stringify(newState));
                return newState;
            })
            el.draggable = true;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", mouseup);
        }
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


 /**
 * Handles the end of a drag operation.
 * @param {DropResult} result - The result of the drag operation.
 * @returns {void}
 */
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

            

            newLeft = newLeft < 0 ? 0 : newLeft;
            console.log(newLeft)
            dragElement.current.style.left = newLeft + 'px';
            let updatedWidth = parseInt(dragElement.current.style.width, 10)
            let endTime = (newLeft + width) % 80;
            let dateEnd = Math.floor((newLeft + updatedWidth) / 80) + 1;
            console.log(dateEnd,newLeft, width)
            let timeEnd = (endTime / 3.333).toFixed(2).toString().replace('.', ':');
            let [hoursEnd, minutesEnd] = timeEnd ? timeEnd.split(':') : ['00', '00'];
            elData[0].end = endTime == 0 ? updateDateTime(elData[0].end, '00', '00',1) : updateDateTime(elData[0].end, hoursEnd, minutesEnd,dateEnd);

            let startTime = newLeft % 80;
            let timeStart = (startTime / 3.333).toFixed(2).toString().replace('.', ':');
            let [hoursStart, minutesStart] = timeStart ? timeStart.split(':') : ['00', '00'];
            let dateStart = Math.floor(newLeft / 80) + 1;
            elData[0].start = startTime == 0 ? updateDateTime(elData[0].start, '00', '00',1) : updateDateTime(elData[0].start, hoursStart, minutesStart,dateStart);


            parent.appendChild(dragElement.current);
            setEventsData((prev) => {
                const updatedEvents =  prev.map((event) => {
                    if (event.title == title) {
                        return {
                            ...event,
                            resource:parent.getAttribute('data-resource'),
                            end: elData[0].end,
                            start: elData[0].start
                        };
                    } else {
                        return event;
                    }
                });

                localStorage.setItem('guestaraEvents', JSON.stringify(updatedEvents));
                return updatedEvents;
            });

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
    }, [currentMonth, eventsData,resources])


    

    // Add new resources
    const handleAddResource = () => {
        newResource.id = resources.length +1;
        let updateResources = [...resources,newResource];
        setResources(updateResources);
        localStorage.setItem('guestaraResource', JSON.stringify(updateResources));
        setNewResource({
            id: 1,
            name: '',
            color: '',
        })
        onClose()
    }

    // Add new event
    const handleAddEvent = () => {
        let updatedEvents = [...eventsData, newEvent];
        setEventsData([...updatedEvents])
        localStorage.setItem('guestaraEvents', JSON.stringify(updatedEvents));
        setNewEvent({
            start: '',
            end: '',
            title: '',
            resource: 1,
        })
        addEvent.onClose()
    }

    return (
        <>
            <div className="grid-cont w-full h-[calc(100vh-4rem)] relative overflow-scroll">

                <div className="top-left-dummy-box | fixed z-40 w-40 h-8 border flex justify-between px-1 items-center border-gray-400 bg-white">
                    <button onClick={onOpen} className='text-xs flex items-center bg-[#007AFE] text-white rounded-md  p-1 '><Plus size={15}/> Resource</button>
                    <button onClick={addEvent.onOpen} className='text-xs flex items-center bg-[#007AFE] text-white rounded-md  p-1 '><Plus size={15}/> Event</button>
                </div>

                <div style={{ position: "-webkit-sticky" }} className="resource-cont | z-30 w-40 bg-white sticky mt-8 top-8 left-0">
                    {resources.length > 0 && resources.map((resource) => {
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

                    {/* row */}
                    {resources.length > 0 && resources.map((resource, i) => {
                        return (
                            <div
                                key={resource.id}
                                id='row-cont'
                                data-date={formatISO(days[1]).substring(0, 10)}
                                data-color={resource.color}
                                data-resource={resource.id}
                                className='row-cont | flex relative w-full h-16  border-gray-400'>
                                {/* cells */}
                                {days.map((day, j) => {
                                    return (
                                        <div
                                            key={formatISO(day)}
                                            className={cn('cell |relative h-16 w-20 border-r border-t border-gray-400 flex justify-center items-center')}>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>

                <AddEvent isOpen={addEvent.isOpen} handleAddEvent={handleAddEvent}  onClose={addEvent.onClose} newEvent={newEvent} setNewEvent={setNewEvent} resources={resources} />
                <AddResource isOpen={isOpen} handleAddResource={handleAddResource}  onClose={onClose} newResource={newResource} setNewResource={setNewResource} />
            </div>
        </>
    )
}

export default CalendarView
