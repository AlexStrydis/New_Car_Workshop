// frontend/src/components/FormModal.jsx

import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function FormModal({ isOpen, onRequestClose, title, children, onSave }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white p-6 max-w-lg mx-auto mt-20 rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-xl mb-4">{title}</h2>
      {children}
      <div className="mt-4 text-right">
        <button
          onClick={onRequestClose}
          className="mr-2 px-4 py-2 rounded bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
