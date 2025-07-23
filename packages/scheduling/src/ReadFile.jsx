import React, { useState, useCallback } from "react";
import "@shopify/polaris/build/esm/styles.css";
import { DropZone, BlockStack, InlineError } from "@shopify/polaris";
import XLSX from "xlsx-js-style";

export function ReadFile({ title, setWork, sheet }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState();

  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles) => {
    setFiles(() => {
      const xls = acceptedFiles[0];

      const reader = new FileReader();
      reader.readAsArrayBuffer(xls);
      reader.onload = () => {
        try {
          const wb = XLSX.read(reader.result, {
            cellStyles: true,
          });
          if (wb.Sheets[sheet]) {
            setWork(wb);
            setError();
          } else {
            setError(`檔案沒有${sheet}`);
          }
        } catch (err) {
          console.error(err);
          setError("不是 Excel 檔案");
        }
      };

      return [xls];
    });
  }, []);

  const fileUpload = !files.length && <DropZone.FileUpload />;

  const uploadedFiles = files.length > 0 && (
    <BlockStack inlineAlign="center">
      {`${files[0].name} (${new Intl.NumberFormat().format(files[0].size)} bytes)`}{" "}
    </BlockStack>
  );

  return (
    <BlockStack gap="300">
      <div style={{ width: 250 }}>
        <DropZone
          label={title}
          onDrop={handleDropZoneDrop}
          allowMultiple={false}
        >
          {uploadedFiles}
          {fileUpload}
        </DropZone>
      </div>

      {error ? <InlineError message={error} /> : null}
    </BlockStack>
  );
}
