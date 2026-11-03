export type ProductSummary = {
  id: string;
  title: string;
  status: string;
};

export type UserError = {
  field: string[] | null;
  message: string;
};
