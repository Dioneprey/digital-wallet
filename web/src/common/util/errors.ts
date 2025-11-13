export const getErrorMessage = (response: any) => {
  console.log(response);

  if (response.message) {
    if (Array.isArray(response.message)) {
      return formatErrorMessage(response.message[0], response.statusCode);
    }
    return formatErrorMessage(response.message, response.statusCode);
  }

  return { message: "Unknown error occured.", status: response.statusCode };
};

const formatErrorMessage = (message: string, status: number) => {
  return {
    message: message.charAt(0).toUpperCase() + message.slice(1),
    status: status,
  };
};
