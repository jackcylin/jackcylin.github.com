import React, { useState, useEffect, useCallback } from "react";
import {
  BlockStack,
  Card,
  IndexTable,
  TextField,
  Icon,
  Button,
  InlineError,
} from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";
import { ReadFile } from "./ReadFile";
import { XIcon, PlusIcon } from "@shopify/polaris-icons";

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
  const { month, clinics, setClinics, pgys, setPgys, departments } =
    useGlobal();
  const [workbook, setWorkbook] = useState();
  const [error, setError] = useState();
  const [planned, setPlanned] = useState(false);

  useEffect(() => {
    if (workbook) {
      const sheet = workbook.Sheets[MONTHS[month]];
      const res = sort(
        Object.keys(sheet).filter(
          (i) =>
            /(\D+)(\d+)/.test(i) && sheet[i].v && /\(\s*\)/.test(sheet[i].v)
        )
      );
      const items = {};
      res.forEach((i) => {
        const lines = sheet[i].v.split(/\r?\n/);
        lines
          .filter((line) => /\(\s*\)/.test(line))
          .forEach((line) => {
            items[Object.keys(items).length + 1] = {
              day: Object.keys(items).length + 1,
              detail: line.split(/\(\s*\)/[1])[0],
              attendee: [],
            };
          });
      });
      setClinics(items);
    }
  }, [workbook]);

  const plan = useCallback(() => {
    if (!pgys || !departments) setError("沒有排班資料");

    const allClinics = { ...clinics };

    console.log("planning ...");

    for (const person of Object.keys(pgys))
      pgys[person] = { count: 0, available: [] };

    for (const clinic of Object.keys(allClinics))
      allClinics[clinic].attendee = [];

    for (const person of Object.keys(pgys)) {
      if (pgys[person].count > 0) continue;

      for (const clinic of Object.keys(allClinics)) {
        const item = allClinics[clinic];
        const day = item.day;

        for (const department of Object.keys(departments)) {
          const dept = departments[department];
          if (
            dept[day]?.duty?.length > 1 &&
            dept[day].duty.includes(person) &&
            !item.attendee.includes[person] &&
            item.attendee.length < 1
          ) {
            item.attendee.push(person);
            pgys[person].count++;
            break;
          }
        }
        if (pgys[person] > 0) break;
      }
    }
    setClinics(allClinics);
    setPgys(pgys);
    setPlanned(true);
  }, [departments, pgys, clinics]);

  return (
    <BlockStack gap="300">
      <Card>
        <ReadFile
          title="讀取教學門診"
          setWorkbook={setWorkbook}
          sheet={MONTHS[month]}
        />
      </Card>

      {Object.keys(clinics).length > 0 ? (
        <>
          <Card>
            <Button variant="primary" onClick={plan}>
              排班
            </Button>
            {error && <InlineError message={error} />}
          </Card>

          <Card>
            <IndexTable
              itemCount={Object.keys(clinics).length}
              selectable={false}
              headings={[{ title: "日期" }, { title: "門診" }]}
            >
              {Object.keys(clinics).map((key) => (
                <Row
                  key={key}
                  id={key}
                  clinic={clinics[key]}
                  onChange={(changes) => {
                    const clone = {
                      ...clinics,
                      [key]: { ...clinics[key], ...changes },
                    };
                    setClinics(clone);
                  }}
                  onDelete={(deleteKey) => {
                    const clone = { ...clinics };
                    delete clone[deleteKey];
                    setClinics(clone);
                  }}
                />
              ))}
              <IndexTable.Row>
                <IndexTable.Cell>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const newKey = Object.keys(clinics)
                        .map((key) => parseInt(key))
                        .reduce((acc, cur) => (acc = cur + 1), 1);
                      setClinics({
                        ...clinics,
                        [newKey]: { day: 1, detail: "" },
                      });
                    }}
                  >
                    <Icon source={PlusIcon} tone="base" />
                  </div>
                </IndexTable.Cell>
              </IndexTable.Row>
            </IndexTable>
          </Card>
        </>
      ) : null}

      {planned ? (
        <Card>
          <IndexTable
            itemCount={Object.keys(pgys).length}
            selectable={false}
            headings={[{ title: "人員" }, { title: "排班數" }]}
          >
            {Object.keys(pgys).map((person) => (
              <IndexTable.Row key={person}>
                <IndexTable.Cell>{person}</IndexTable.Cell>
                <IndexTable.Cell>{pgys[person].count}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
            <IndexTable.Row>
              <IndexTable.Cell>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const newKey = Object.keys(clinics)
                      .map((key) => parseInt(key))
                      .reduce((acc, cur) => (acc = cur + 1), 1);
                    setClinics({
                      ...clinics,
                      [newKey]: { day: 1, detail: "" },
                    });
                  }}
                >
                  <Icon source={PlusIcon} tone="base" />
                </div>
              </IndexTable.Cell>
            </IndexTable.Row>
          </IndexTable>
        </Card>
      ) : null}
    </BlockStack>
  );
}

function Row({ id, clinic, onChange, onDelete }) {
  return (
    <IndexTable.Row>
      <IndexTable.Cell>
        <TextField
          type="number"
          value={clinic.day}
          placeholder="1 ~ 12"
          onChange={(value) => {
            let target = value > 31 ? 31 : value < 1 ? 1 : value;
            onChange({ day: target });
          }}
          autoComplete="off"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={clinic.detail}
          onChange={(value) => {
            onChange({ detail: value });
          }}
          autoComplete="off"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div>{clinic.attendee.reduce((acc, cur) => acc + cur, "")}</div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div style={{ cursor: "pointer" }} onClick={() => onDelete(id)}>
          <Icon source={XIcon} tone="base" />
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
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
