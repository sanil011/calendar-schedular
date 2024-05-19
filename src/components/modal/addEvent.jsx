import React,{useState} from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { DateRangePicker } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { formatISO, set } from 'date-fns';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";



const AddEvent = ({ isOpen,newEvent, setNewEvent, handleAddEvent, resources }) => {
    const [selectedResource, setSelectedResources] = useState("");

    function createISODate(year, month, day) {
        // Create a Date object with the provided year, month, and day
        const date = new Date(year, month - 1, day); // month - 1 because months are zero-based in JavaScript

        // Set the time to midnight
        const midnightDate = set(date, { hours: 0, minutes: 0, seconds: 0 });

        // Format the date in ISO format with timezone offset
        const isoDate = formatISO(midnightDate, { extended: true });

        return isoDate;
    }

    const createDate = (value) => {
        let start = createISODate(value.start.year, value.start.month, value.start.day);
        let end = createISODate(value.end.year, value.end.month, value.end.day);
        console.log(start, end);
        setNewEvent((prevState) => ({
            ...prevState,
            start: start,
            end:end
        }));
    }

  return (
      <Modal isOpen={isOpen} >
          <ModalContent>
              {(onClose) => (
                  <>
                      <ModalHeader className="flex flex-col gap-1">Add Event</ModalHeader>
                      <ModalBody>
                          <h2>Name </h2>
                          <Input value={newEvent.name} onChange={(e) => {
                              setNewEvent((prevState) => ({
                                  ...prevState,
                                  title: e.target.value,
                              }));
                          }} />
                          <h2>Event Duration</h2>
                          <DateRangePicker
                              isRequired
                              defaultValue={{
                                  start: parseDate("2024-04-01"),
                                  end: parseDate("2024-04-08"),
                              }}
                              onChange={(value)=>createDate(value)}
                              className="max-w-xs"
                          />
                          <h2>Select Resource</h2>
                          <Dropdown>
                              <DropdownTrigger>
                                  <Input value={selectedResource} />
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Dynamic Actions" items={resources}>
                                  {(item) => (
                                      <DropdownItem
                                          key={item.id}
                                          onClick={(e) => {
                                              setNewEvent((prevState) => ({
                                                  ...prevState,
                                                  resource: item.id,
                                              }));
                                              setSelectedResources(item.name)
                                          }}
                                      >
                                          {item.name}
                                      </DropdownItem>
                                  )}
                              </DropdownMenu>
                          </Dropdown>
                      </ModalBody>
                      <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                              Close
                          </Button>
                          <Button color="primary" onPress={handleAddEvent}>
                              Add
                          </Button>
                      </ModalFooter>
                  </>
              )}
          </ModalContent>
      </Modal>
  )
}

export default AddEvent