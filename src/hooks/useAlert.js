import { useState, useCallback } from 'react';

const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [{ text: 'OK', onPress: () => {} }],
  });

  const showAlert = useCallback((config) => {
    setAlertConfig({
      visible: true,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      buttons: config.buttons || [{ text: 'OK', onPress: () => {} }],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  // Supports: showSuccess(message, callback) OR showSuccess(title, message, callback)
  const showSuccess = useCallback((titleOrMessage, messageOrCallback, onPress) => {
    const isShortForm = typeof messageOrCallback === 'function' || messageOrCallback === undefined;
    showAlert({
      type: 'success',
      title: isShortForm ? 'Success' : titleOrMessage,
      message: isShortForm ? titleOrMessage : messageOrCallback,
      buttons: [{ text: 'OK', onPress: isShortForm ? messageOrCallback : onPress }],
    });
  }, [showAlert]);

  // Supports: showError(message, callback) OR showError(title, message, callback)
  const showError = useCallback((titleOrMessage, messageOrCallback, onPress) => {
    const isShortForm = typeof messageOrCallback === 'function' || messageOrCallback === undefined;
    showAlert({
      type: 'error',
      title: isShortForm ? 'Error' : titleOrMessage,
      message: isShortForm ? titleOrMessage : messageOrCallback,
      buttons: [{ text: 'OK', onPress: isShortForm ? messageOrCallback : onPress }],
    });
  }, [showAlert]);

  // Supports: showWarning(message) OR showWarning(title, message, buttons)
  const showWarning = useCallback((titleOrMessage, messageOrButtons, buttons) => {
    const isShortForm = typeof messageOrButtons !== 'string';
    showAlert({
      type: 'warning',
      title: isShortForm ? 'Warning' : titleOrMessage,
      message: isShortForm ? titleOrMessage : messageOrButtons,
      buttons: (isShortForm ? messageOrButtons : buttons) || [{ text: 'OK' }],
    });
  }, [showAlert]);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    showAlert({
      type: 'warning',
      title,
      message,
      buttons: [
        { text: 'Cancel', onPress: onCancel },
        { text: 'Confirm', onPress: onConfirm },
      ],
    });
  }, [showAlert]);

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
  };
};

export default useAlert;
