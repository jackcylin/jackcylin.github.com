import React, { useState, useEffect } from "react";
import { BlockStack, Card, IndexTable, Select } from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";

// const SHEET = "夜班值班表";
// const GROUPS = ["PGY", "R1", "R2", "R3"];
// const PGY = ["PGY", "R1"];
// const EXCLUDE_DEPARTMENTS = ["外訓", "特休", "休假"];
// const YEAR = 2025;
// const MONTH = 7; // 1 - 12
// const DAYS = new Date(YEAR, MONTH, 0).getDate();
// const WEEK_DAYS = [...Array(DAYS).keys()]
//   .map((i) => i + 1)
//   .filter((d) => {
//     const day = new Date(YEAR, MONTH - 1, d, 8).getDay();
//     return day === 6 || day === 0 ? false : true;
//   })
//   .reduce((acc, cur) => {
//     acc[cur] = { duty: [] };
//     return acc;
//   }, {});

export function Schedule() {
  const [departments, setDepartments] = useState({});
  const [selected, setSelected] = useState("");
  const [ready, setReady] = useState(false);
  const { workbook, sheet, includes, plans, excludes, columns, days } =
    useGlobal();

  useEffect(() => {
    let startRow = 1;
    const depts = {};
    let pgys = {};
    const missing = [];

    if (workbook) {
      const workSheet = workbook.Sheets[sheet];

      includes.split(",").forEach((group) => {
        let groupingState = null,
          isPGY = false;

        for (let row = startRow; row < 1000; row++) {
          const groupCell = workSheet[`A${row}`];

          if (!groupingState) {
            if (groupCell?.v && groupCell.v.indexOf(group) === 0) {
              groupingState = groupCell.v;
              isPGY = plans.split(",").includes(group);
              row++;
              // console.log(`${groupIndex}: ${groupCell.v}`);
            }
          } else {
            if (!groupCell || !groupCell.v) break;

            let halfDepts = [null, null];

            ["A", "B"].forEach((column, index) => {
              const id = `${column}${row}`;
              const cell = workSheet[id];
              if (!excludes.split(",").includes(cell.v)) {
                halfDepts[index] = cell.v;
                if (!depts[cell.v]) {
                  depts[cell.v] = days
                    .split(",")
                    // .map((i) => ({ [i]: { duty: [] } }))
                    .reduce((acc, cur) => {
                      acc[cur] = { duty: [] };
                      return acc;
                    }, {});
                }
              }
            });

            const workingDays = days.split(",");

            for (let day = 1; day <= columns.length; day++) {
              const column = columns[day - 1];
              const id = `${column}${row}`;
              const cell = workSheet[id];
              const person = workSheet[`C${row}`].v;

              if (!pgys[person] && isPGY) pgys[person] = 0;

              if (workingDays.includes["" + day] === false) {
                console.log(">>>", day);
                continue;
              }

              if (!cell) {
                missing.push(id);
                continue;
              }

              let dept = null;

              if (day <= 15 && depts[halfDepts[0]]) {
                dept = halfDepts[0];
              } else if (day > 15 && depts[halfDepts[1]]) {
                dept = halfDepts[1];
              } else continue;

              if (dept) {
                // if (cell.v) continue;

                const isLeave = cell.s?.fgColor?.rgb === "B4C7E7";

                if (!isLeave) {
                  const duty = depts[dept]["" + day]?.duty;
                  if (duty) {
                    duty.push(person);
                  } else {
                    console.log("======");
                  }
                }
                if (cell.v) {
                  day++;
                  continue;
                }
              }
            }
          }
          startRow = row + 1;
        }
      });

      setDepartments(depts);
      const dept = Object.keys(depts)[0];
      if (!selected) setSelected(dept);
      setReady(true);
    }
  }, [workbook]);

  if (!ready) return null;

  console.log("-------------");

  return (
    <Card>
      <BlockStack gap="300">
        <Select
          label="科別"
          options={Object.keys(departments).map((key) => ({
            label: key,
            value: key,
          }))}
          onChange={(value) => setSelected(value)}
          value={selected}
        />

        <IndexTable
          itemCount={
            departments[selected]
              ? Object.keys(departments[selected])?.length
              : 0
          }
          selectable={false}
          headings={[{ title: "日期" }, { title: "人員" }]}
        >
          {selected &&
            Object.keys(departments[selected]).map((day) => {
              const duty = departments[selected][day].duty;
              return (
                <IndexTable.Row key={day}>
                  <IndexTable.Cell>{day}</IndexTable.Cell>
                  <IndexTable.Cell>
                    {duty.reduce((acc, cur) => `${acc} ${cur}`, "")}
                  </IndexTable.Cell>
                </IndexTable.Row>
              );
            })}
        </IndexTable>
      </BlockStack>
    </Card>
  );
}
