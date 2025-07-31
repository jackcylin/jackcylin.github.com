import React, { useState, useEffect, useCallback } from "react";
import {
  BlockStack,
  Card,
  IndexTable,
  TextField,
  Icon,
  Button,
  InlineStack,
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
  const [maxAttendee, setMaxAttendee] = useState(1);
  const [maxClinic, setMaxClinic] = useState(1);

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

  useEffect(() => {
    const clone = JSON.parse(JSON.stringify(clinics));
    Object.keys(clone).forEach((item) => {
      clone[item].attendee = [];
    });
    localStorage.setItem("clinics", JSON.stringify(clone));
  }, [clinics]);

  const plan = useCallback(() => {
    if (!pgys || !departments) setError("沒有排班資料");

    createSchedule(departments, pgys, clinics, maxAttendee, maxClinic);
    setClinics(clinics);
    setPgys(pgys);
    setPlanned(true);
  }, [departments, pgys, clinics, maxAttendee, maxClinic]);

  const clear = useCallback(() => {
    for (const clinic of Object.keys(clinics)) clinics[clinic].attendee = [];
    for (const person of Object.keys(pgys)) pgys[person].count = 0;
    setClinics(clinics);
    setPgys(pgys);
    setPlanned(false);
  }, [clinics]);

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
            <BlockStack gap="300">
              <TextField
                label="門診最多可排人數"
                type="number"
                value={maxAttendee}
                onChange={(value) => {
                  setMaxAttendee(value);
                }}
                autoComplete="off"
              />

              <TextField
                label="每人最多可排門診數"
                type="number"
                value={maxClinic}
                onChange={(value) => {
                  setMaxClinic(value);
                }}
                autoComplete="off"
              />

              <InlineStack gap="300">
                <Button variant="primary" onClick={plan}>
                  排班
                </Button>
                <Button onClick={clear}>清除</Button>
              </InlineStack>
              {error && <InlineError message={error} />}
            </BlockStack>
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
                        [newKey]: { day: 1, detail: "", attendee: [] },
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
            headings={[
              { title: "人員" },
              { title: "可排門診日期" },
              { title: "已排門診次數" },
            ]}
          >
            {Object.keys(pgys).map((person) => (
              <IndexTable.Row key={person}>
                <IndexTable.Cell>{person}</IndexTable.Cell>
                <IndexTable.Cell>
                  {pgys[person].available.join(", ")}
                </IndexTable.Cell>
                <IndexTable.Cell>{pgys[person].count}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
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
          onChange={(value) => {
            onChange({ day: parseInt(value) });
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
        <div>{clinic.attendee.join(", ")}</div>
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

function createSchedule(departments, interns, clinics, maxAttendee, maxClinic) {
  // Loop through each clinic to staff it
  for (const clinic of Object.keys(clinics)) {
    // Find interns who are available on this clinic's day AND have less than 2 assignments
    let candidates = Object.keys(interns).filter((intern) => {
      const clinicDay = clinics[clinic].day;

      return (
        interns[intern].available.includes(clinicDay) &&
        interns[intern].count < maxClinic
      );
      // departments[clinics[clinic].day].duty.includes(intern) &&
    });

    // Prioritize fairness: sort candidates by who has fewer assignments
    candidates.sort((a, b) => interns[a].count - interns[b].count);

    // Assign the best candidates until the clinic is full
    while (
      clinics[clinic].attendee.length < maxAttendee &&
      candidates.length > 0
    ) {
      // Take the highest-priority candidate (the first one in the sorted list)
      const internToAssign = candidates.shift();
      // Assign them to the clinic
      clinics[clinic].attendee.push(internToAssign);
      // Update their assignment count
      interns[internToAssign].count++;
    }
  }

  return { clinics, interns };
}
