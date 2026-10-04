import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, FileDown } from "lucide-react";
import { Card, SectionTitle } from "../shared/ui";
import { supabase } from "../../lib/supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = [
  "Sisa bahan penyiapan makanan",
  "Sisa makanan",
  "Kertas/Karton",
  "Plastik",
  "Kaca",
  "Kain",
  "Karet",
  "Residu",
  "B3",
  "Lainnya",
];

function getDefaultDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return {
    start: `${year}-${month}-01`,
    end: now.toISOString().slice(0, 10),
  };
}

export function AdminLaporan() {
  const defaultDates = getDefaultDates();

  const [reportType, setReportType] = useState("pelaku_usaha");

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("all");

  const [bankUnits, setBankUnits] = useState([]);
  const [selectedBankUnit, setSelectedBankUnit] = useState("all");

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  const [records, setRecords] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingBankUnits, setLoadingBankUnits] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedPickupId, setExpandedPickupId] = useState(null);

  useEffect(() => {
    async function loadBusinesses() {
      setLoadingBusinesses(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("pelaku_usaha")
        .select(`
          id,
          nama_usaha,
          jenis_usaha,
          alamat,
          wilayah,
          profile_id
        `)
        .order("nama_usaha");

      if (queryError) {
        console.error(
          "[AdminLaporan] pelaku_usaha query failed:",
          queryError
        );
        setError(queryError.message);
      } else {
        setBusinesses(data || []);
      }

      setLoadingBusinesses(false);
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    async function loadBankUnits() {
      setLoadingBankUnits(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("bank_units")
        .select(`
          id,
          name,
          code,
          kelurahan,
          address,
          status
        `)
        .order("name");

      if (queryError) {
        console.error(
          "[AdminLaporan] bank_units query failed:",
          queryError
        );

        setError(queryError.message);
      } else {
        setBankUnits(data || []);
      }

      setLoadingBankUnits(false);
    }

    loadBankUnits();
  }, []);

  const handleSearch = async () => {
    setError("");
    setHasSearched(true);

    if (!startDate || !endDate) {
      setError("Pilih tanggal awal dan tanggal akhir.");
      return;
    }

    if (startDate > endDate) {
      setError("Tanggal awal tidak boleh melewati tanggal akhir.");
      return;
    }

    setLoadingRecords(true);

    /*
    * PELAKU USAHA
    */
    if (reportType === "pelaku_usaha") {
      let query = supabase
        .from("waste_management_records")
        .select(`
          id,
          tanggal,
          created_at,
          pelaku_usaha_id,
          pelaku_usaha (
            id,
            nama_usaha,
            jenis_usaha,
            alamat,
            wilayah
          ),
          waste_management_details (
            id,
            category,
            handled_kg,
            unhandled_kg
          )
        `)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate)
        .order("tanggal", { ascending: true });

      if (selectedBusiness !== "all") {
        query = query.eq(
          "pelaku_usaha_id",
          selectedBusiness
        );
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error(
          "[AdminLaporan] waste records query failed:",
          queryError
        );

        setError(queryError.message);
        setRecords([]);
        setLoadingRecords(false);
        return;
      }

      setRecords(data || []);
      setLoadingRecords(false);
      return;
    }

    /*
      * INPUT DATA SAMPAH / PICKUP ADMIN
      */
      if (reportType === "pickup") {
        const { data, error: queryError } = await supabase
          .from("pickup_results")
          .select(`
            id,
            berat_actual,
            sumber_sampah,
            completed_at,
            nama_penghasil,
            alamat,
            pickup_compositions (
              id,
              category,
              handled_kg,
              unhandled_kg
            )
          `)
          .gte("completed_at", `${startDate}T00:00:00`)
          .lte("completed_at", `${endDate}T23:59:59`)
          .order("completed_at", { ascending: true });

        if (queryError) {
          console.error(
            "[AdminLaporan] pickup results query failed:",
            queryError
          );

          setError(queryError.message);
          setRecords([]);
          setLoadingRecords(false);
          return;
        }

        setRecords(data || []);
        setLoadingRecords(false);
        return;
      }

        /*
        * BANK SAMPAH
        */
        let query = supabase
          .from("bank_manual_records")
          .select(`
            id,
            bank_unit_id,
            tanggal,
            category,
            weight_kg,
            price,
            deposit_amount,
            withdrawal_amount,
            balance,
            officer,
            created_at,
            bank_units (
              id,
              name,
              code,
              kelurahan,
              address
            )
          `)
          .gte("tanggal", startDate)
          .lte("tanggal", endDate)
          .order("tanggal", { ascending: true })
          .order("created_at", { ascending: true });

        if (selectedBankUnit !== "all") {
          query = query.eq("bank_unit_id", selectedBankUnit);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          console.error(
            "[AdminLaporan] bank manual records query failed:",
            queryError
          );

          setError(queryError.message);
          setRecords([]);
          setLoadingRecords(false);
          return;
        }

        setRecords(data || []);
        setLoadingRecords(false);
      };

  const pickupTotals = useMemo(() => {
    if (reportType !== "pickup") {
      return {
        weight: 0,
        handled: 0,
        unhandled: 0,
      };
    }

    return records.reduce(
      (acc, record) => {
        acc.weight += Number(record.berat_actual || 0);

        (record.pickup_compositions || []).forEach((detail) => {
          acc.handled += Number(detail.handled_kg || 0);
          acc.unhandled += Number(detail.unhandled_kg || 0);
        });

        return acc;
      },
      {
        weight: 0,
        handled: 0,
        unhandled: 0,
      }
    );
  }, [records, reportType]);

  const bankTotals = useMemo(() => {
    if (reportType !== "bank_sampah") {
      return {
        weight: 0,
        deposit: 0,
        withdrawal: 0,
      };
    }

    return records.reduce(
      (acc, record) => {
        acc.weight += Number(record.weight_kg || 0);
        acc.deposit += Number(record.deposit_amount || 0);
        acc.withdrawal += Number(record.withdrawal_amount || 0);

        return acc;
      },
      {
        weight: 0,
        deposit: 0,
        withdrawal: 0,
      }
    );
  }, [records, reportType]);

  const totals = useMemo(() => {
    const result = Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        {
          handled: 0,
          unhandled: 0,
          economic: 0,
        },
      ])
    );

    records.forEach((record) => {
      const details =
        reportType === "bank_sampah"
          ? record.bank_waste_details || []
          : record.waste_management_details || [];

      details.forEach((detail) => {
        if (!result[detail.category]) return;

        result[detail.category].handled += Number(
          detail.handled_kg || 0
        );

        result[detail.category].unhandled += Number(
          detail.unhandled_kg || 0
        );

        if (reportType === "bank_sampah") {
          result[detail.category].economic += Number(
            detail.economic_value || 0
          );
        }
      });
    });

    return result;
  }, [records, reportType]);

  const totalEconomic = useMemo(() => {
    return CATEGORIES.reduce(
      (sum, category) =>
        sum + Number(totals[category]?.economic || 0),
      0
    );
  }, [totals]);

  const grandHandled = Object.values(totals).reduce(
    (total, item) => total + item.handled,
    0
  );

  const grandUnhandled = Object.values(totals).reduce(
    (total, item) => total + item.unhandled,
    0
  );

  const handleExportPDF = () => {
        if (reportType === "bank_sampah") {
          if (!records.length) {
            setError("Tidak ada data Bank Sampah untuk diekspor.");
            return;
          }

          const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });

          const formatRupiah = (value) =>
            `Rp${Number(value || 0).toLocaleString("id-ID")}`;

          const formatDate = (date) =>
            new Date(`${date}T00:00:00`).toLocaleDateString("id-ID");

          const groupedRecords = records.reduce((groups, record) => {
            const unitId = record.bank_unit_id;

            if (!groups[unitId]) {
              groups[unitId] = {
                unit: record.bank_units,
                records: [],
              };
            }

            groups[unitId].records.push(record);

            return groups;
          }, {});

          const groups = Object.values(groupedRecords);

          groups.forEach((group, groupIndex) => {
            if (groupIndex > 0) {
              doc.addPage();
            }

            const unitName =
              group.unit?.name || "Bank Sampah";

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("Lampiran 1. Data Bank Sampah", 14, 16);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            doc.text(`Bank Sampah: ${unitName}`, 14, 23);
            doc.text(
              `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`,
              14,
              29
            );

            const tableBody = group.records.map((record) => [
              formatDate(record.tanggal),

              record.category === "Organik"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              record.category === "Plastik PET"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              record.category === "Kertas"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              record.category === "Botol & kaca"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              record.category === "Logam"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              record.category === "Sampah lainnya"
                ? Number(record.weight_kg || 0).toFixed(2)
                : "",

              Number(record.weight_kg || 0).toFixed(2),

              formatRupiah(record.price),

              formatRupiah(record.deposit_amount),

              formatRupiah(record.withdrawal_amount),

              formatRupiah(record.balance),

              record.officer || "-",
            ]);

            autoTable(doc, {
              startY: 35,

              head: [
                [
                  {
                    content: "Tgl",
                    rowSpan: 2,
                  },
                  {
                    content: "Jenis Sampah",
                    colSpan: 6,
                  },
                  {
                    content: "Berat",
                    rowSpan: 2,
                  },
                  {
                    content: "Harga",
                    rowSpan: 2,
                  },
                  {
                    content: "Transaksi",
                    colSpan: 2,
                  },
                  {
                    content: "Saldo",
                    rowSpan: 2,
                  },
                  {
                    content: "Petugas",
                    rowSpan: 2,
                  },
                ],
                [
                  "Organik",
                  "Plastik PET",
                  "Kertas",
                  "Botol & kaca",
                  "Logam",
                  "Sampah lainnya",
                  "Setor",
                  "Tarik",
                ],
              ],

              body: tableBody,

              theme: "grid",

              styles: {
                font: "helvetica",
                fontSize: 7,
                cellPadding: 1.8,
                halign: "center",
                valign: "middle",
                lineWidth: 0.15,
                lineColor: [0, 0, 0],
                textColor: [0, 0, 0],
              },

              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: "normal",
                lineWidth: 0.15,
                lineColor: [0, 0, 0],
              },

              columnStyles: {
                0: { cellWidth: 19 },
                1: { cellWidth: 17 },
                2: { cellWidth: 17 },
                3: { cellWidth: 17 },
                4: { cellWidth: 21 },
                5: { cellWidth: 17 },
                6: { cellWidth: 24 },
                7: { cellWidth: 17 },
                8: { cellWidth: 24 },
                9: { cellWidth: 24 },
                10: { cellWidth: 24 },
                11: { cellWidth: 24 },
                12: { cellWidth: 25 },
              },

              margin: {
                left: 8,
                right: 8,
              },
            });
          });

          const filename =
            selectedBankUnit === "all"
              ? `Laporan_Semua_Bank_Sampah_${startDate}_${endDate}.pdf`
              : `Laporan_Bank_Sampah_${startDate}_${endDate}.pdf`;

          doc.save(filename);

          return;
        }

    if (reportType === "pickup") {
      if (!records.length) {
        setError("Tidak ada data Input Data Sampah untuk diekspor.");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const formatDate = (date) =>
        new Date(date).toLocaleDateString("id-ID");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN DATA PENGAMBILAN SAMPAH", 14, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        `Periode: ${formatDate(`${startDate}T00:00:00`)} s.d. ${formatDate(
          `${endDate}T00:00:00`
        )}`,
        14,
        23
      );

      doc.setFontSize(9);

      doc.text(
        `Pencatatan: ${records.length}`,
        14,
        30
      );

      doc.text(
        `Total Sampah: ${pickupTotals.weight.toFixed(2)} kg`,
        60,
        30
      );

      doc.text(
        `Tertangani: ${pickupTotals.handled.toFixed(2)} kg`,
        115,
        30
      );

      doc.text(
        `Tidak Tertangani: ${pickupTotals.unhandled.toFixed(2)} kg`,
        165,
        30
      );

      let currentY = 36;

      records.forEach((record, index) => {
        const compositions = (record.pickup_compositions || []).filter(
          (detail) =>
            Number(detail.handled_kg || 0) > 0 ||
            Number(detail.unhandled_kg || 0) > 0
        );

        const handled = compositions.reduce(
          (sum, detail) => sum + Number(detail.handled_kg || 0),
          0
        );

        const unhandled = compositions.reduce(
          (sum, detail) => sum + Number(detail.unhandled_kg || 0),
          0
        );

        // Informasi utama entry
        autoTable(doc, {
          startY: currentY,

          head: [[
            "No",
            "Tanggal",
            "Penghasil Sampah",
            "Alamat",
            "Sumber Sampah",
            "Berat (kg)",
            "Tertangani (kg)",
            "Tidak Tertangani (kg)",
          ]],

          body: [[
            index + 1,
            formatDate(record.completed_at),
            record.nama_penghasil || "-",
            record.alamat || "-",
            record.sumber_sampah || "-",
            Number(record.berat_actual || 0).toFixed(2),
            handled.toFixed(2),
            unhandled.toFixed(2),
          ]],

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2,
            valign: "middle",
            lineWidth: 0.1,
            lineColor: [80, 80, 80],
            textColor: [0, 0, 0],
          },

          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            lineWidth: 0.1,
            lineColor: [50, 50, 50],
          },

          margin: {
            left: 8,
            right: 8,
          },
        });

        // Detail komposisi entry
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 2,

          head: [[
            "Jenis Sampah",
            "Tertangani (kg)",
            "Tidak Tertangani (kg)",
            "Total (kg)",
          ]],

          body: compositions.map((detail) => {
            const detailHandled = Number(detail.handled_kg || 0);
            const detailUnhandled = Number(detail.unhandled_kg || 0);

            return [
              detail.category || "-",
              detailHandled.toFixed(2),
              detailUnhandled.toFixed(2),
              (detailHandled + detailUnhandled).toFixed(2),
            ];
          }),

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2,
            lineWidth: 0.1,
            lineColor: [80, 80, 80],
            textColor: [0, 0, 0],
          },

          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },

          columnStyles: {
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
          },

          margin: {
            left: 8,
            right: 85,
          },
        });

        currentY = doc.lastAutoTable.finalY + 7;
      });

      const categoryTotals = {};

      records.forEach((record) => {
        (record.pickup_compositions || []).forEach((detail) => {
          if (!categoryTotals[detail.category]) {
            categoryTotals[detail.category] = {
              handled: 0,
              unhandled: 0,
            };
          }

          categoryTotals[detail.category].handled += Number(
            detail.handled_kg || 0
          );

          categoryTotals[detail.category].unhandled += Number(
            detail.unhandled_kg || 0
          );
        });
      });

      const categoryBody = Object.entries(categoryTotals).map(
        ([category, values]) => [
          category,
          values.handled.toFixed(2),
          values.unhandled.toFixed(2),
          (values.handled + values.unhandled).toFixed(2),
        ]
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,

        head: [[
          "Jenis Sampah",
          "Tertangani (kg)",
          "Tidak Tertangani (kg)",
          "Total (kg)",
        ]],

        body: [
          ...categoryBody,
          [
            "TOTAL",
            pickupTotals.handled.toFixed(2),
            pickupTotals.unhandled.toFixed(2),
            pickupTotals.weight.toFixed(2),
          ],
        ],

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [80, 80, 80],
          textColor: [0, 0, 0],
        },

        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [50, 50, 50],
        },

        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 35, halign: "right" },
          2: { cellWidth: 40, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },

        margin: {
          left: 8,
          right: 8,
        },
      });

      doc.save(
        `Laporan_Input_Data_Sampah_${startDate}_${endDate}.pdf`
      );

      return;
    }

    if (records.length === 0) {
      setError("Tidak ada data pada periode yang dipilih.");
      return;
    }

    const selectedBusinesses =
      selectedBusiness === "all"
        ? businesses.filter((business) =>
            records.some(
              (record) => record.pelaku_usaha_id === business.id
            )
          )
        : businesses.filter(
            (business) => business.id === selectedBusiness
          );

    if (selectedBusinesses.length === 0) {
      setError("Data Pelaku Usaha tidak ditemukan.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const formatDate = (date) =>
      new Date(`${date}T00:00:00`).toLocaleDateString("id-ID");

    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 10;

    let currentY = 12;

    selectedBusinesses.forEach((business, businessIndex) => {
      const businessRecords = records.filter(
        (record) => record.pelaku_usaha_id === business.id
      );

      const rowsByDate = new Map();

      for (const record of businessRecords) {
        if (!rowsByDate.has(record.tanggal)) {
          rowsByDate.set(
            record.tanggal,
            Object.fromEntries(
              CATEGORIES.map((category) => [
                category,
                {
                  handled: 0,
                  unhandled: 0,
                },
              ])
            )
          );
        }

        const dateRow = rowsByDate.get(record.tanggal);

        for (const detail of record.waste_management_details || []) {
          if (!dateRow[detail.category]) continue;

          dateRow[detail.category].handled += Number(
            detail.handled_kg || 0
          );

          dateRow[detail.category].unhandled += Number(
            detail.unhandled_kg || 0
          );
        }
      }

      const body = [...rowsByDate.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, categories], index) => [
          index + 1,
          formatDate(date),

          ...CATEGORIES.map((category) =>
            categories[category].handled.toFixed(2)
          ),

          ...CATEGORIES.map((category) =>
            categories[category].unhandled.toFixed(2)
          ),
        ]);

      /*
      * Perkiraan ruang yang dibutuhkan:
      * - identitas Pelaku Usaha
      * - header tabel
      * - baris data
      *
      * Kalau tidak cukup, mulai halaman baru.
      */
      const estimatedTableHeight = 24 + body.length * 6;
      const estimatedSectionHeight =
        24 + estimatedTableHeight;

      if (
        businessIndex > 0 &&
        currentY + estimatedSectionHeight >
          pageHeight - bottomMargin
      ) {
        doc.addPage();
        currentY = 12;
      }

      /*
      * HEADER PER PELAKU USAHA
      */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        "LAPORAN DATA PENGELOLAAN SAMPAH",
        14,
        currentY
      );

      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        `Pelaku Usaha : ${business.nama_usaha}`,
        14,
        currentY
      );

      currentY += 4;

      doc.text(
        `Jenis Usaha  : ${business.jenis_usaha}`,
        14,
        currentY
      );

      currentY += 4;

      if (business.alamat) {
        doc.text(
          `Alamat       : ${business.alamat}`,
          14,
          currentY
        );

        currentY += 4;
      }

      doc.text(
        `Periode      : ${formatDate(
          startDate
        )} s.d. ${formatDate(endDate)}`,
        14,
        currentY
      );

      currentY += 5;

      /*
      * TABEL PER PELAKU USAHA
      */
      autoTable(doc, {
        startY: currentY,

        head: [
          [
            {
              content: "No",
              rowSpan: 3,
              styles: { valign: "middle" },
            },
            {
              content: "Tanggal",
              rowSpan: 3,
              styles: { valign: "middle" },
            },
            {
              content: "Sampah Tertangani",
              colSpan: 10,
              styles: { halign: "center" },
            },
            {
              content: "Sampah Tidak Tertangani",
              colSpan: 10,
              styles: { halign: "center" },
            },
          ],

          [
            {
              content: "Organik",
              colSpan: 2,
              styles: { halign: "center" },
            },
            {
              content: "Anorganik",
              colSpan: 8,
              styles: { halign: "center" },
            },
            {
              content: "Organik",
              colSpan: 2,
              styles: { halign: "center" },
            },
            {
              content: "Anorganik",
              colSpan: 8,
              styles: { halign: "center" },
            },
          ],

          [
            "Sisa bahan penyiapan makanan",
            "Sisa makanan",
            "Kertas/Karton",
            "Plastik",
            "Kaca",
            "Kain",
            "Karet",
            "Residu (Styrofoam, bungkus sachetan)",
            "B3",
            "Lainnya",

            "Sisa bahan penyiapan makanan",
            "Sisa makanan",
            "Kertas/Karton",
            "Plastik",
            "Kaca",
            "Kain",
            "Karet",
            "Residu (Styrofoam, bungkus sachetan)",
            "B3",
            "Lainnya",
          ],
        ],

        body,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 5.5,
          cellPadding: 1.2,
          lineWidth: 0.1,
          lineColor: [80, 80, 80],
          halign: "center",
          valign: "middle",
          overflow: "linebreak",
        },

        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [50, 50, 50],
        },

        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 18 },
        },

        margin: {
          left: 7,
          right: 7,
        },
      });

      /*
      * Ambil posisi akhir tabel yang BARU SAJA dibuat.
      * Pelaku Usaha berikutnya mulai setelah tabel ini.
      */
      currentY = doc.lastAutoTable.finalY + 10;
    });

    const fileName =
      selectedBusiness === "all"
        ? `Laporan_Semua_Pelaku_Usaha_${startDate}_${endDate}.pdf`
        : `Laporan_${selectedBusinesses[0].nama_usaha
            .replace(/[\\/:*?"<>|]/g, "")
            .replace(/\s+/g, "_")}_${startDate}_${endDate}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle
          eyebrow="Pelaporan"
          title="Laporan Pengelolaan Sampah"
        />

        <p className="text-sm ink-soft mt-1">
          Rekap data pengelolaan sampah yang dilaporkan oleh Pelaku Usaha.
        </p>
      </div>

      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Jenis Laporan
            </label>

            <div className="flex items-center gap-2 border border-line rounded-xl px-3">
              <FileDown size={16} className="ink-soft shrink-0" />

              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setRecords([]);
                  setHasSearched(false);
                  setError("");
                }}
                className="w-full py-3 text-sm bg-transparent outline-none"
              >
                <option value="pelaku_usaha">
                  Pelaku Usaha
                </option>

                <option value="bank_sampah">
                  Bank Sampah
                </option>

                <option value="pickup">
                  Input Data Sampah
                </option>
              </select>
            </div>
          </div>
          {reportType !== "pickup" && (
            <div>
              <label className="chip ink-soft uppercase block mb-2 font-semibold">
                {reportType === "pelaku_usaha"
                  ? "Pelaku Usaha"
                  : "Bank Sampah"}
              </label>

              <div className="flex items-center gap-2 border border-line rounded-xl px-3">
                <Building2 size={16} className="ink-soft shrink-0" />

                {reportType === "pelaku_usaha" ? (
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    disabled={loadingBusinesses}
                    className="w-full py-3 text-sm bg-transparent outline-none"
                  >
                    <option value="all">
                      {loadingBusinesses
                        ? "Memuat..."
                        : "Semua Pelaku Usaha"}
                    </option>

                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.nama_usaha} · {business.jenis_usaha}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedBankUnit}
                    onChange={(e) => setSelectedBankUnit(e.target.value)}
                    disabled={loadingBankUnits}
                    className="w-full py-3 text-sm bg-transparent outline-none"
                  >
                    <option value="all">
                      {loadingBankUnits
                        ? "Memuat..."
                        : "Semua Bank Sampah"}
                    </option>

                    {bankUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                        {unit.kelurahan ? ` · ${unit.kelurahan}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Tanggal Awal
            </label>

            <div className="flex items-center gap-2 border border-line rounded-xl px-3">
              <CalendarDays size={16} className="ink-soft shrink-0" />

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-3 text-sm bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="chip ink-soft uppercase block mb-2 font-semibold">
              Tanggal Akhir
            </label>

            <div className="flex items-center gap-2 border border-line rounded-xl px-3">
              <CalendarDays size={16} className="ink-soft shrink-0" />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-3 text-sm bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loadingRecords}
          className="tap btn-primary text-white font-semibold rounded-xl px-5 py-3 mt-5 disabled:opacity-60"
        >
          {loadingRecords ? "Memuat…" : "Tampilkan Laporan"}
        </button>
      </Card>

      {error && (
        <div className="bg-clay-tint text-clay rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {hasSearched && !loadingRecords && !error && (
        <>
          {reportType === "pelaku_usaha" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Pencatatan
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    {records.length}
                  </p>
                  <p className="text-sm ink-soft mt-1">
                    data pada periode terpilih
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Tertangani
                  </p>
                  <p className="font-display text-2xl font-bold text-primary mt-2">
                    {grandHandled.toFixed(2)} kg
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Tidak Tertangani
                  </p>
                  <p className="font-display text-2xl font-bold text-clay mt-2">
                    {grandUnhandled.toFixed(2)} kg
                  </p>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-paper">
                        <th className="text-left px-4 py-3 font-semibold">
                          Kategori Sampah
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Tertangani (kg)
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Tidak Tertangani (kg)
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Total (kg)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {CATEGORIES.map((category) => {
                        const item = totals[category];
                        const total = item.handled + item.unhandled;

                        return (
                          <tr
                            key={category}
                            className="border-t border-line"
                          >
                            <td className="px-4 py-3 font-medium">
                              {category}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              {item.handled.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              {item.unhandled.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                              {total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="border-t border-line bg-paper font-semibold">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {grandHandled.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {grandUnhandled.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {(grandHandled + grandUnhandled).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </>
          ) : reportType === "pickup" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Pencatatan
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    {records.length}
                  </p>
                  <p className="text-sm ink-soft mt-1">
                    data pada periode terpilih
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Total Sampah
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    {pickupTotals.weight.toFixed(2)} kg
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Tertangani
                  </p>
                  <p className="font-display text-2xl font-bold text-primary mt-2">
                    {pickupTotals.handled.toFixed(2)} kg
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Tidak Tertangani
                  </p>
                  <p className="font-display text-2xl font-bold text-clay mt-2">
                    {pickupTotals.unhandled.toFixed(2)} kg
                  </p>
                </Card>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-paper">
                        <th className="text-left px-4 py-3 font-semibold">
                          Tanggal
                        </th>
                        <th className="text-left px-4 py-3 font-semibold">
                          Penghasil Sampah
                        </th>
                        <th className="text-left px-4 py-3 font-semibold">
                          Sumber Sampah
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Berat
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Tertangani
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Tidak Tertangani
                        </th>
                        <th className="text-center px-4 py-3 font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record) => {
                        const handled = (record.pickup_compositions || []).reduce(
                          (sum, detail) => sum + Number(detail.handled_kg || 0),
                          0
                        );

                        const unhandled = (record.pickup_compositions || []).reduce(
                          (sum, detail) => sum + Number(detail.unhandled_kg || 0),
                          0
                        );

                        return (
                          <>
                            <tr key={record.id} className="border-t border-line">
                            <td className="px-4 py-3">
                              {new Date(record.completed_at).toLocaleDateString("id-ID")}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {record.nama_penghasil || "-"}
                            </td>

                            <td className="px-4 py-3">
                              {record.sumber_sampah || "-"}
                            </td>

                            <td className="px-4 py-3 text-right font-mono">
                              {Number(record.berat_actual || 0).toFixed(2)} kg
                            </td>

                            <td className="px-4 py-3 text-right font-mono">
                              {handled.toFixed(2)} kg
                            </td>

                            <td className="px-4 py-3 text-right font-mono">
                              {unhandled.toFixed(2)} kg
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedPickupId(
                                    expandedPickupId === record.id ? null : record.id
                                  )
                                }
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {expandedPickupId === record.id ? "Tutup" : "Detail"}
                              </button>
                            </td>
                              </tr>

                              {expandedPickupId === record.id && (
                                <tr className="border-t border-line bg-paper/50">
                                  <td colSpan={7} className="px-6 py-4">
                                    <p className="text-sm font-semibold mb-3">
                                      Detail Komposisi Sampah
                                    </p>

                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr>
                                            <th className="text-left py-2 pr-4">
                                              Jenis Sampah
                                            </th>
                                            <th className="text-right py-2 px-4">
                                              Tertangani
                                            </th>
                                            <th className="text-right py-2 px-4">
                                              Tidak Tertangani
                                            </th>
                                            <th className="text-right py-2 pl-4">
                                              Total
                                            </th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          {(record.pickup_compositions || [])
                                            .filter(
                                              (detail) =>
                                                Number(detail.handled_kg || 0) > 0 ||
                                                Number(detail.unhandled_kg || 0) > 0
                                            )
                                            .map((detail) => {
                                              const total =
                                                Number(detail.handled_kg || 0) +
                                                Number(detail.unhandled_kg || 0);

                                              return (
                                                <tr
                                                  key={detail.id}
                                                  className="border-t border-line"
                                                >
                                                  <td className="py-2 pr-4">
                                                    {detail.category}
                                                  </td>
                                                  <td className="py-2 px-4 text-right font-mono">
                                                    {Number(detail.handled_kg || 0).toFixed(2)} kg
                                                  </td>
                                                  <td className="py-2 px-4 text-right font-mono">
                                                    {Number(detail.unhandled_kg || 0).toFixed(2)} kg
                                                  </td>
                                                  <td className="py-2 pl-4 text-right font-mono font-semibold">
                                                    {total.toFixed(2)} kg
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Pencatatan
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    {records.length}
                  </p>
                  <p className="text-sm ink-soft mt-1">
                    data pada periode terpilih
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Total Berat
                  </p>
                  <p className="font-display text-2xl font-bold text-primary mt-2">
                    {bankTotals.weight.toFixed(2)} kg
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Total Setor
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    Rp{bankTotals.deposit.toLocaleString("id-ID")}
                  </p>
                </Card>

                <Card>
                  <p className="chip ink-soft uppercase font-semibold">
                    Total Tarik
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    Rp{bankTotals.withdrawal.toLocaleString("id-ID")}
                  </p>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-paper">
                        <th className="text-left px-4 py-3 font-semibold">
                          Tanggal
                        </th>
                        <th className="text-left px-4 py-3 font-semibold">
                          Jenis Sampah
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Berat
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Harga
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Setor
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Tarik
                        </th>
                        <th className="text-right px-4 py-3 font-semibold">
                          Saldo
                        </th>
                        <th className="text-left px-4 py-3 font-semibold">
                          Petugas
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record) => (
                        <tr
                          key={record.id}
                          className="border-t border-line"
                        >
                          <td className="px-4 py-3">
                            {new Date(
                              `${record.tanggal}T00:00:00`
                            ).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {record.category}
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            {Number(record.weight_kg || 0).toFixed(2)} kg
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            Rp{Number(record.price || 0).toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            Rp{Number(record.deposit_amount || 0).toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            Rp{Number(record.withdrawal_amount || 0).toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3 text-right font-mono">
                            Rp{Number(record.balance || 0).toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3">
                            {record.officer || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleExportPDF}
              disabled={records.length === 0}
              className={`tap btn-primary text-white rounded-xl px-5 py-3 flex items-center gap-2 font-semibold ${
                records.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title="Ekspor laporan ke PDF"
            >
              <FileDown size={16} />
              Ekspor PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}