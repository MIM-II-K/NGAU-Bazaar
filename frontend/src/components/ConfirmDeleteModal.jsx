import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion"; // Add framer-motion

const ConfirmDeleteModal = ({
  show,
  title = "Confirm Deletion",
  message = "Are you sure? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Keep it",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <Modal
          show={show}
          onHide={onCancel}
          centered
          backdrop="static"
          contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
          {/* Framer Motion Wrapper for the interior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          >
            <Modal.Header className="border-0 pb-0 pt-4 px-4 d-flex justify-content-center">
              <div 
                className="bg-danger bg-opacity-10 p-3 rounded-circle mb-2"
                style={{ width: 'fit-content' }}
              >
                <i className="bi bi-trash3-fill text-danger fs-3"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="text-center px-4 pb-3">
              <h5 className="fw-bold text-dark mb-2">{title}</h5>
              <p className="text-muted mb-0">{message}</p>
            </Modal.Body>

            <Modal.Footer className="border-0 p-4 pt-2 d-flex gap-2">
              <Button
                variant="light"
                className="flex-grow-1 py-2 fw-semibold text-secondary border-0"
                onClick={onCancel}
                disabled={loading}
                style={{ backgroundColor: '#f3f4f6' }}
              >
                {cancelText}
              </Button>

              <Button
                variant="danger"
                className="flex-grow-1 py-2 fw-semibold shadow-sm"
                onClick={onConfirm}
                disabled={loading}
                style={{ 
                    background: 'linear-gradient(45deg, #dc3545, #ff4d5a)',
                    border: 'none'
                }}
              >
                {loading ? (
                  <Spinner size="sm" animation="border" role="status" />
                ) : (
                  confirmText
                )}
              </Button>
            </Modal.Footer>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;