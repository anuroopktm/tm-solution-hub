import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { BaseViewerRendererProps } from "../types/viewer.types";
import { Spinner } from "@/components/ui/spinner";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";

export function SpreadsheetViewer({
  asset,
  setControls,
  onError,
}: BaseViewerRendererProps) {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [rawData, setRawData] = useState<string[][]>([]);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;
  const loading = loadedUrl !== asset.file_url;

  // Load and parse file
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const response = await fetch(asset.file_url);
        if (!response.ok) {
          throw new Error(
            `HTTP Error ${response.status}: Failed to fetch file`,
          );
        }

        const format = (asset.format || "").toLowerCase();
        const url = asset.file_url.toLowerCase();
        const isCsv =
          format === "csv" ||
          format === "tsv" ||
          url.endsWith(".csv") ||
          url.endsWith(".tsv");

        if (isCsv) {
          const text = await response.text();
          if (cancelled) return;
          const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
          setSheets(["Sheet1"]);
          setActiveSheet("Sheet1");
          setRawData(parsed.data || []);
        } else {
          const buffer = await response.arrayBuffer();
          if (cancelled) return;
          const wb = XLSX.read(buffer, { type: "array" });
          setWorkbook(wb);
          setSheets(wb.SheetNames || []);
          if (wb.SheetNames?.length) {
            const firstSheet = wb.SheetNames[0];
            setActiveSheet(firstSheet);
            const sheetData = XLSX.utils.sheet_to_json<string[]>(
              wb.Sheets[firstSheet],
              { header: 1 },
            );
            setRawData(sheetData);
          }
        }
        if (!cancelled) {
          setLoadedUrl(asset.file_url);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to parse spreadsheet";
          onError?.(msg);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [asset.file_url, asset.format, onError]);

  // Handle Sheet Selection for XLSX
  const handleSelectSheet = useCallback(
    (sheetName: string) => {
      if (!workbook || !workbook.Sheets[sheetName]) return;
      setActiveSheet(sheetName);
      const sheetData = XLSX.utils.sheet_to_json<string[]>(
        workbook.Sheets[sheetName],
        { header: 1 },
      );
      setRawData(sheetData);
      setCurrentPage(1);
    },
    [workbook],
  );

  // Filter rows based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return rawData;
    const q = searchQuery.toLowerCase();
    const [header, ...rows] = rawData;
    const matched = rows.filter((row) =>
      row.some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
    return header ? [header, ...matched] : matched;
  }, [rawData, searchQuery]);

  const headerRow = filteredData[0] || [];
  const bodyRows = filteredData.slice(1);
  const totalPages = Math.ceil(bodyRows.length / pageSize) || 1;
  const paginatedRows = bodyRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Expose controls to the bottom-center toolbar
  useEffect(() => {
    setControls({
      spreadsheet: {
        sheets,
        activeSheet,
        onSelectSheet: handleSelectSheet,
        searchQuery,
        onSearchChange: setSearchQuery,
        rowCount: bodyRows.length,
      },
    });

    return () => setControls(null);
  }, [
    sheets,
    activeSheet,
    handleSelectSheet,
    searchQuery,
    bodyRows.length,
    setControls,
  ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="mt-3 text-xs text-muted-foreground">
          Parsing spreadsheet data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-card/90 backdrop-blur-md p-3 rounded-xl border border-border shadow-xs shrink-0">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spreadsheet rows..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Sheet Tabs for multi-sheet workbooks */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
            {sheets.map((sheet) => (
              <button
                key={sheet}
                type="button"
                onClick={() => handleSelectSheet(sheet)}
                className={`px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap font-medium ${
                  activeSheet === sheet
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        )}

        {/* Pagination Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {bodyRows.length} rows · Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="size-7"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="size-7"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm mb-16">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10 border-b border-border shadow-xs">
            <tr>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground w-12 text-center border-r border-border/50">
                #
              </th>
              {headerRow.map((col, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2.5 font-semibold text-foreground border-r border-border/50 whitespace-nowrap"
                >
                  {String(col ?? `Col ${idx + 1}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={headerRow.length + 1 || 1}
                  className="p-8 text-center text-muted-foreground"
                >
                  No rows found matching search criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rowIdx) => {
                const absRowIndex = (currentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground text-center border-r border-border/40 bg-muted/20">
                      {absRowIndex}
                    </td>
                    {headerRow.map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-3 py-2 text-foreground border-r border-border/30 whitespace-nowrap max-w-xs truncate"
                      >
                        {String(row[colIdx] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
