'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  politicianName: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  politicianName,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete <strong>{politicianName}</strong>?
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="flat"
            onPress={onClose}
            isDisabled={deleting}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleConfirm}
            isLoading={deleting}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
