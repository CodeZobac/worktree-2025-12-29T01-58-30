import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 3000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Recipe-specific toast messages
export const recipeToasts = {
  created: () => showSuccessToast('Recipe created successfully!'),
  updated: () => showSuccessToast('Recipe updated successfully!'),
  deleted: () => showSuccessToast('Recipe deleted successfully!'),
  createError: () => showErrorToast('Failed to create recipe. Please try again.'),
  updateError: () => showErrorToast('Failed to update recipe. Please try again.'),
  deleteError: () => showErrorToast('Failed to delete recipe. Please try again.'),
  loadError: () => showErrorToast('Failed to load recipes. Please refresh the page.'),
  imageUploadError: () => showErrorToast('Failed to upload image. Please try again.'),
};
