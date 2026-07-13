export type LabReport = {
  batchNumber: string;
  productName: string;
  thcPercent: string;
  testedOn: string;
  pdfUrl: string;
};

export const labReports: LabReport[] = [
  {
    batchNumber: "AH-TEA-2407",
    productName: "Wind Down Tea",
    thcPercent: "0.09%",
    testedOn: "2026-06-14",
    pdfUrl: "/coas/AH-TEA-2407.pdf",
  },
  {
    batchNumber: "AH-CND-2412",
    productName: "Two-Way Candle",
    thcPercent: "0.19%",
    testedOn: "2026-06-21",
    pdfUrl: "/coas/AH-CND-2412.pdf",
  },
  {
    batchNumber: "AH-RLB-2409",
    productName: "Roll-On Balm",
    thcPercent: "0.08%",
    testedOn: "2026-06-10",
    pdfUrl: "/coas/AH-RLB-2409.pdf",
  },
  {
    batchNumber: "AH-HNY-2411",
    productName: "Raw CBD Honey",
    thcPercent: "0.12%",
    testedOn: "2026-06-18",
    pdfUrl: "/coas/AH-HNY-2411.pdf",
  },
  {
    batchNumber: "AH-BND-2413",
    productName: "Evening Ritual Set",
    thcPercent: "0.22%",
    testedOn: "2026-06-25",
    pdfUrl: "/coas/AH-BND-2413.pdf",
  },
];
