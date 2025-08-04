import React from 'react';
import { toast } from 'react-toastify';

/**
 * Toast utility functions to replace alert() calls with modern toast notifications
 */

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// For confirmation dialogs (since toast doesn't support confirm dialogs)
export const showConfirmation = (message: string, onConfirm: () => void, onCancel?: () => void) => {
  const confirmId = toast(
    ({ closeToast }) => (
      <div>
        <p className="mb-3">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={() => {
              onConfirm();
              closeToast();
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            onClick={() => {
              onCancel?.();
              closeToast();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      closeButton: false,
    }
  );
};
