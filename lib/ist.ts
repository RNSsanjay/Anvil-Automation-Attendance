import { formatInTimeZone } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

export const getISTDate = () => {
  return new Date();
};

export const formatIST = (date: Date, formatStr: string) => {
  return formatInTimeZone(date, IST_TIMEZONE, formatStr);
};

export const getISTToday = () => {
  return formatIST(new Date(), 'yyyy-MM-dd');
};

export const getISTMonth = () => {
  return formatIST(new Date(), 'yyyy-MM');
};

export const getISTTime = () => {
  return formatIST(new Date(), 'hh:mm:ss aa');
};
