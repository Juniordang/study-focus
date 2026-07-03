const padDatePart = (value: number) => String(value).padStart(2, "0");
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const toLocalDateKey = (value: Date | string | number = new Date()) => {
  if (typeof value === "string" && dateKeyPattern.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
};

export const localDateTimeToISOString = (dateKey: string, time: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0).toISOString();
};
