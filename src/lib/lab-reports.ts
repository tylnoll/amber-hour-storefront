export type LabReport = {
  batchNumber: string;
  productName: string;
  thcPercent: string;
  testedOn: string;
  pdfUrl: string;
};

export const labReports: LabReport[] = [
  {
    batchNumber: "N/A",
    productName: "First harvest batch",
    thcPercent: "N/A",
    testedOn: "N/A",
    pdfUrl: "#",
  },
];
