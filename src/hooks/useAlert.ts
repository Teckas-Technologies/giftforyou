import { useState, useCallback } from 'react';
import type { AlertButton } from '../components/CustomAlert';

export interface AlertConfig {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  buttons: AlertButton[];
  // 'primaryTopLinkBottom': for exactly 3 buttons ([secondary, link,
  // primary]), renders the primary (last) button full-width on top, the
  // first button as a boxed secondary button below it, and the middle
  // button as a plain, unboxed text link at the bottom. Anything else
  // (including omitted) keeps the default stacked/row layout unchanged.
  buttonLayout?: 'stacked' | 'primaryTopLinkBottom';
}

interface ShowAlertConfig {
  type?: AlertConfig['type'];
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  buttonLayout?: AlertConfig['buttonLayout'];
}

const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [{ text: 'OK', onPress: () => {} }],
  });

  const showAlert = useCallback((config: ShowAlertConfig) => {
    setAlertConfig({
      visible: true,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      buttons: config.buttons || [{ text: 'OK', onPress: () => {} }],
      buttonLayout: config.buttonLayout,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods — each supports two call shapes (a "short form" of
  // just a message, or a full title+message), disambiguated at runtime by
  // the type of the second argument. Kept loosely typed on purpose: giving
  // this real overload signatures would be a lot of ceremony for what's
  // still fundamentally a dynamic dispatch.

  /** showSuccess(message, callback) OR showSuccess(title, message, callback) */
  const showSuccess = useCallback(
    (titleOrMessage: string, messageOrCallback?: string | (() => void), onPress?: () => void) => {
      const isShortForm =
        typeof messageOrCallback === 'function' || messageOrCallback === undefined;
      showAlert({
        type: 'success',
        title: isShortForm ? 'Success' : titleOrMessage,
        message: isShortForm ? titleOrMessage : messageOrCallback,
        buttons: [
          {
            text: 'OK',
            onPress: isShortForm ? (messageOrCallback as (() => void) | undefined) : onPress,
          },
        ],
      });
    },
    [showAlert],
  );

  /** showError(message, callback) OR showError(title, message, callback) */
  const showError = useCallback(
    (titleOrMessage: string, messageOrCallback?: string | (() => void), onPress?: () => void) => {
      const isShortForm =
        typeof messageOrCallback === 'function' || messageOrCallback === undefined;
      showAlert({
        type: 'error',
        title: isShortForm ? 'Error' : titleOrMessage,
        message: isShortForm ? titleOrMessage : messageOrCallback,
        buttons: [
          {
            text: 'OK',
            onPress: isShortForm ? (messageOrCallback as (() => void) | undefined) : onPress,
          },
        ],
      });
    },
    [showAlert],
  );

  /** showWarning(message) OR showWarning(title, message, buttons) */
  const showWarning = useCallback(
    (
      titleOrMessage: string,
      messageOrButtons?: string | AlertButton[],
      buttons?: AlertButton[],
    ) => {
      const isShortForm = typeof messageOrButtons !== 'string';
      showAlert({
        type: 'warning',
        title: isShortForm ? 'Warning' : titleOrMessage,
        message: isShortForm ? titleOrMessage : messageOrButtons,
        buttons: (isShortForm ? (messageOrButtons as AlertButton[] | undefined) : buttons) || [
          { text: 'OK' },
        ],
      });
    },
    [showAlert],
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
    ) => {
      showAlert({
        type: 'warning',
        title,
        message,
        buttons: [
          { text: cancelText, onPress: onCancel, style: 'cancel' },
          { text: confirmText, onPress: onConfirm, style: 'destructive' },
        ],
      });
    },
    [showAlert],
  );

  const showOptions = useCallback(
    (
      title: string,
      message: string,
      options: AlertButton[],
      buttonLayout?: AlertConfig['buttonLayout'],
    ) => {
      showAlert({
        type: 'info',
        title,
        message,
        buttons: options,
        buttonLayout,
      });
    },
    [showAlert],
  );

  const showInfo = useCallback(
    (title: string, message: string, onPress?: () => void) => {
      showAlert({
        type: 'info',
        title,
        message,
        buttons: [{ text: 'OK', onPress }],
      });
    },
    [showAlert],
  );

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    showOptions,
    showInfo,
  };
};

export default useAlert;
