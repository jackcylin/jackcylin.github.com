import React, { useState, useCallback } from "react";
import "@shopify/polaris/build/esm/styles.css";
import { DropZone, BlockStack } from "@shopify/polaris";
import XLSX from "xlsx-js-style";
import { useGlobal } from "./hooks/useGlobal";

export function Upload() {
  const [files, setFiles] = useState([]);
  const { setWorkbook } = useGlobal();

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles) => {
      setFiles(() => {
        const xls = acceptedFiles[0];

        const reader = new FileReader();
        reader.readAsArrayBuffer(xls);
        reader.onload = () => {
          const wb = XLSX.read(reader.result, {
            cellStyles: true,
          });
          setWorkbook(wb);
        };

        return [xls];
      });
    },
    [setWorkbook]
  );

  const fileUpload = !files.length && <DropZone.FileUpload />;

  const uploadedFiles = files.length > 0 && (
    <BlockStack inlineAlign="center">
      {`${files[0].name} (${new Intl.NumberFormat().format(files[0].size)} bytes)`}{" "}
    </BlockStack>
  );

  return (
    <BlockStack gap="300">
      <DropZone
        label={"讀取班表（內含 sheet 夜班值班表）"}
        onDrop={handleDropZoneDrop}
        allowMultiple={false}
      >
        {uploadedFiles}
        {fileUpload}
      </DropZone>
    </BlockStack>
  );
}
