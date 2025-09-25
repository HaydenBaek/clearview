
export type Job = {
  id: number;
  service: string;
  customerName: string;
  jobDate: string;   
  price: number;
  notes: string;
  address: string;
  paid: boolean;
  invoiceNumber?: string;
};

export type Customer = {
  id: number;
  name: string;
  address: string;
  phone?: string;
};
