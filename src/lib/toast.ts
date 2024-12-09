const toast = {
  error: (message: string) => {
    console.error(message);
    // You can replace this with a proper toast library like react-toastify
    alert(message);
  },
  info: (message: string, options?: { duration?: number }) => {
    console.info(message);
    // You can replace this with a proper toast library like react-toastify
    alert(message);
  }
};

export default toast;
