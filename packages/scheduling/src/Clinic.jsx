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

const CALENDER = {
  B6: { monthWeek: 1, weekDay: 1 },
  C6: { monthWeek: 1, weekDay: 2 },
  D6: { monthWeek: 1, weekDay: 3 },
  E6: { monthWeek: 1, weekDay: 4 },
  F6: { monthWeek: 1, weekDay: 5 },
  G6: { monthWeek: 1, weekDay: 6 },
  H6: { monthWeek: 1, weekDay: 7 },
  B8: { monthWeek: 2, weekDay: 1 },
  C8: { monthWeek: 2, weekDay: 2 },
  D8: { monthWeek: 2, weekDay: 3 },
  E8: { monthWeek: 2, weekDay: 4 },
  F8: { monthWeek: 2, weekDay: 5 },
  G8: { monthWeek: 2, weekDay: 6 },
  H8: { monthWeek: 2, weekDay: 7 },
  B10: { monthWeek: 3, weekDay: 1 },
  C10: { monthWeek: 3, weekDay: 2 },
  D10: { monthWeek: 3, weekDay: 3 },
  E10: { monthWeek: 3, weekDay: 4 },
  F10: { monthWeek: 3, weekDay: 5 },
  G10: { monthWeek: 3, weekDay: 6 },
  H10: { monthWeek: 3, weekDay: 7 },
  B12: { monthWeek: 4, weekDay: 1 },
  C12: { monthWeek: 4, weekDay: 2 },
  D12: { monthWeek: 4, weekDay: 3 },
  E12: { monthWeek: 4, weekDay: 4 },
  F12: { monthWeek: 4, weekDay: 5 },
  G12: { monthWeek: 4, weekDay: 6 },
  H12: { monthWeek: 4, weekDay: 7 },
  B14: { monthWeek: 5, weekDay: 1 },
  C14: { monthWeek: 5, weekDay: 2 },
  D14: { monthWeek: 5, weekDay: 3 },
  E14: { monthWeek: 5, weekDay: 4 },
  F14: { monthWeek: 5, weekDay: 5 },
  G14: { monthWeek: 5, weekDay: 6 },
  H14: { monthWeek: 5, weekDay: 7 },
};

export function Clinic() {
  const { year, month, clinics, setClinics, pgys, setPgys, departments } =
    useGlobal();
  const [workbook, setWorkbook] = useState();
  const [error, setError] = useState();
  const [planned, setPlanned] = useState(false);
  const [maxAttendee, setMaxAttendee] = useState(1);
  const [maxClinic, setMaxClinic] = useState(1);

  useEffect(() => {
    if (workbook) {
      setCalendarDetailsForMonth(year, month);

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
              day: CALENDER[i] ? CALENDER[i].monthDay : 0,
              detail: line.split(/\(\s*\)/[1])[0],
              attendee: [],
            };
          });
      });
      setClinics(items);
    }
  }, [workbook, year, month]);

  useEffect(() => {
    const clone = JSON.parse(JSON.stringify(clinics));
    Object.keys(clone).forEach((item) => {
      clone[item].attendee = [];
    });
    localStorage.setItem("clinics", JSON.stringify(clone));
  }, [clinics]);

  const plan = useCallback(() => {
    if (!pgys || !departments) setError("沒有排班資料");

    createSchedule(pgys, clinics, maxAttendee, maxClinic);
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

function createSchedule(interns, clinics, maxAttendee, maxClinic) {
  // console.log(clinics, interns);

  const sortedClinics = Object.keys(clinics).sort((a, b) => {
    const aDetail = clinics[a].detail || "";
    const bDetail = clinics[b].detail || "";

    if (
      (aDetail.includes("下午") && bDetail.includes("下午")) ||
      (aDetail.includes("上午") && bDetail.includes("上午"))
    )
      return a.day - b.day;

    if (aDetail.includes("下午") && !bDetail.includes("下午")) return -1;

    if (!aDetail.includes("下午") && bDetail.includes("下午")) return 1;
  });

  // for (const clinic of sortedClinics)
  //   console.log(clinics[clinic])

  // Loop through each clinic to staff it
  for (const clinic of sortedClinics) {
    // Find interns who are available on this clinic's day AND have less than 2 assignments
    const candidates = Object.keys(interns).filter((intern) => {
      const clinicDay = clinics[clinic].day;

      return (
        interns[intern].available.includes(clinicDay) &&
        interns[intern].count < maxClinic
      );
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

/**
 * Calculates the week number of a given date within its month.
 * (Assumes a week starts on Sunday).
 * @param {Date} date The date to check.
 * @returns {number} The week number of the month (1-6).
 */
function getWeekOfMonth(date) {
  const dayOfMonth = date.getDate();
  const firstDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getDay();
  return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
}

/**
 * Lists every day of a month with its day name, week of month, and week of year.
 * @param {number} year The full year (e.g., 2025).
 * @param {number} month The month (1 for January, 12 for December).
 * @returns {Array<Object>} An array of objects with calendar details for each day.
 */
function setCalendarDetailsForMonth(year, month) {
  console.log(`year ${year}, month ${month}`);
  const date = new Date(year, month - 1, 1);

  while (date.getMonth() === month - 1) {
    const monthDay = date.getDate();
    const weekDay = date.getDay() === 0 ? 7 : date.getDay();
    const monthWeek =
      date.getDay() === 0 ? getWeekOfMonth(date) - 1 : getWeekOfMonth(date);

    Object.keys(CALENDER).find((cell) => {
      if (
        CALENDER[cell].monthWeek === monthWeek &&
        CALENDER[cell].weekDay === weekDay
      ) {
        CALENDER[cell].monthDay = monthDay;
        return true;
      }
      return false;
    });

    date.setDate(date.getDate() + 1);
  }
}
