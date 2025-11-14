export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};
