import { toast } from 'vue-sonner'

/**
 * Toast notification composable
 * Provides consistent toast notifications throughout the app
 */
export function useToast() {
  return {
    /**
     * Show success message
     * @param message - Success message to display
     * @param duration - Duration in milliseconds (default: 3000)
     */
    success: (message: string, duration = 3000) => {
      toast.success(message, { duration })
    },

    /**
     * Show error message
     * @param message - Error message to display
     * @param duration - Duration in milliseconds (default: 5000)
     */
    error: (message: string, duration = 5000) => {
      toast.error(message, { duration })
    },

    /**
     * Show info message
     * @param message - Info message to display
     * @param duration - Duration in milliseconds (default: 5000)
     */
    info: (message: string, duration = 5000) => {
      toast.info(message, { duration })
    },

    /**
     * Show warning message
     * @param message - Warning message to display
     * @param duration - Duration in milliseconds (default: 5000)
     */
    warning: (message: string, duration = 5000) => {
      toast.warning(message, { duration })
    },

    /**
     * Show loading toast
     * @param message - Loading message to display
     * @returns Toast ID that can be used to dismiss or update the toast
     */
    loading: (message: string) => {
      return toast.loading(message)
    },

    /**
     * Show confirmation toast with action buttons
     * @param message - Confirmation message
     * @param onConfirm - Callback function when confirmed
     */
    confirm: (message: string, onConfirm: () => void | Promise<void>) => {
      toast(message, {
        duration: Infinity,
        action: {
          label: 'Confirm',
          onClick: async () => {
            await onConfirm()
          }
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {
            // Toast is automatically dismissed
          }
        }
      })
    },

    /**
     * Dismiss a specific toast or all toasts
     * @param toastId - Optional toast ID to dismiss specific toast
     */
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId)
    },

    /**
     * Show promise-based toast (for async operations)
     * @param promise - Promise to track
     * @param messages - Messages for each state
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      return toast.promise(promise, messages)
    }
  }
}
