import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from '@nextui-org/react';
import { cn } from '../../helper/utility';

const AddResource = ({isOpen,newResource,setNewResource,handleAddResource}) => {
  return (
      <Modal isOpen={isOpen} >
          <ModalContent>
              {(onClose) => (
                  <>
                      <ModalHeader className="flex flex-col gap-1">Add Resource</ModalHeader>
                      <ModalBody>
                          <h2>Name </h2>
                          <Input value={newResource.name} onChange={(e) => {
                              setNewResource((prevState) => ({
                                  ...prevState,
                                  name: e.target.value,
                              }));
                          }} />
                          <h2>Choose Color</h2>
                          <div
                              className={cn("w-7 h-7 rounded-md border relative border-gray-400 p-0 multicolor")}
                          >
                              <input
                                  type="color"
                                  value={newResource.color}
                                  onChange={(e) => {
                                      setNewResource((prevState) => ({
                                          ...prevState,
                                          color: e.target.value,
                                      }));
                                  }}
                                  className="opacity-0 absolute left-0 top-0 w-full cursor-pointer"
                              />
                          </div>
                      </ModalBody>
                      <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                              Close
                          </Button>
                          <Button color="primary" onPress={handleAddResource}>
                              Add
                          </Button>
                      </ModalFooter>
                  </>
              )}
          </ModalContent>
      </Modal>
  )
}

export default AddResource