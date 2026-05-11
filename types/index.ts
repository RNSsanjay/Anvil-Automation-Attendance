export interface Location {
  lat: number;
  lng: number;
}

export interface Admin {
  _id: string;
  companyId: string;
  companyName: string;
  email: string;
  location: Location;
  verified: boolean;
  createdAt: Date;
}

export interface Employee {
  _id: string;
  companyId: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface Attendance {
  _id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  date: string;
  month: string;
  checkInTime: Date;
  createdAt: Date;
}
