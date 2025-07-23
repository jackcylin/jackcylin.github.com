import React, { useState, useEffect } from "react";
import { BlockStack, Card, IndexTable, TextField } from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";
import { ReadFile } from "./ReadFile";

const MONTHS = {
  1: "一月",
  2: "二月",
  3: "三月",
  4: "四月",
  5: "五月",
  6: "六月",
  7: "七月",
  8: "八月",
  9: "九月",
  10: "十月",
  11: "十一月",
  12: "十二月",
};

export function Clinic() {
  const [ready, setReady] = useState(false);
  const { clinic, setClinic, month } = useGlobal();
  const [workbook, setWorkbook] = useState();
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    if (workbook) setClinic(workbook);
    else {
      setClinic();
      setReady(false);
    }
  }, [workbook]);

  useEffect(() => {
    if (clinic) {
      const sheet = clinic.Sheets[MONTHS[month]];
      const res = sort(
        Object.keys(sheet).filter(
          (i) =>
            /(\D+)(\d+)/.test(i) && sheet[i].v && /\(\s*\)/.test(sheet[i].v)
        )
      );
      const items = [];
      res.forEach((i) => {
        const lines = sheet[i].v.split(/\r?\n/);
        lines
          .filter((line) => /\(\s*\)/.test(line))
          .forEach((line) => {
            items.push(line.split(/\(\s*\)/[1])[0]);
          });
      });
      setClinics(items);
    }
  }, [clinic]);

  return (
    <BlockStack gap="300">
      <Card>
        <ReadFile
          title="讀取教學門診"
          setWorkbook={setWorkbook}
          sheet={MONTHS[month]}
        />
      </Card>

      <Card>
        <IndexTable
          itemCount={clinics.length}
          selectable={false}
          headings={[{ title: "日期" }, { title: "門診" }]}
        >
          {clinics.map((item, index) => {
            return (
              <IndexTable.Row key={index}>
                <IndexTable.Cell>
                  <div style={{ width: 16 }}>
                    <TextField type="number" value={0} placeholder="1 ~ 31" />
                  </div>
                </IndexTable.Cell>
                <IndexTable.Cell>{item}</IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      </Card>
    </BlockStack>
  );
}

function sort(source) {
  const filtered = source.filter((i) => /(\D+)(\d+)/.test(i));
  return filtered.sort((a, b) => {
    const as = a.match(/(\D+)(\d+)/);
    const at = as[1];
    const ai = parseInt(as[2]);

    const bs = b.match(/(\D+)(\d+)/);
    const bt = bs[1];
    const bi = parseInt(bs[2]);

    if (ai > bi) return 1;
    if (ai < bi) return -1;

    if (at > bt) return 1;
    if (at < bt) return -1;
    return 0;
  });
}
