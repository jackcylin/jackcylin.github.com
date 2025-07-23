import React, { useState, useEffect } from "react";
import { BlockStack, Card, IndexTable, Select } from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";
import { ReadFile } from "./ReadFile";

export function Schedule() {
  const [departments, setDepartments] = useState({});
  const [selected, setSelected] = useState("");
  const [ready, setReady] = useState(false);
  const {
    workbook,
    setWorkbook,
    sheet,
    includes,
    plans,
    excludes,
    columns,
    days,
  } = useGlobal();
  const [work, setWork] = useState();

  useEffect(() => {
    if (work) setWorkbook(work);
    else setWorkbook();
  }, [work]);

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
            }
          } else {
            if (!groupCell || !groupCell.v) break;

            let halfDepts = [null, null];

            ["A", "B"].forEach((column, index) => {
              const id = `${column}${row}`;
              const cell = workSheet[id];
              if (!excludes.split(",").includes(cell.v)) {
                halfDepts[index] = cell.v;
                if (cell.v) {
                  cell.v
                    .split(",")
                    .map((i) => i.trim())
                    .forEach((dept) => {
                      if (!depts[dept]) {
                        depts[dept] = days.split(",").reduce((acc, cur) => {
                          acc[cur] = { duty: [] };
                          return acc;
                        }, {});
                      }
                      const workingDays = days.split(",");

                      for (
                        let day = column === "A" ? 1 : 16;
                        day <= column === "A" ? 15 : 31;
                        day++
                      ) {
                        const column = columns.split(",")[day - 1];
                        const id = `${column}${row}`;
                        const cell = workSheet[id];
                        const person = workSheet[`C${row}`].v;

                        if (!pgys[person] && isPGY) pgys[person] = 0;

                        if (workingDays.includes["" + day] === false) {
                          continue;
                        }

                        if (!cell) {
                          missing.push(id);
                          continue;
                        }

                        if (dept) {
                          const isLeave = cell.s?.fgColor?.rgb === "B4C7E7";

                          if (!isLeave) {
                            const duty = depts[dept]["" + day]?.duty;
                            if (duty) {
                              duty.push(person);
                            }
                          }
                          if (cell.v) {
                            day++;
                            continue;
                          }
                        }
                      }
                    });
                }
              }
            });

            /*
            const workingDays = days.split(",");

            for (let day = 1; day <= columns.split(",").length; day++) {
              const column = columns.split(",")[day - 1];
              const id = `${column}${row}`;
              const cell = workSheet[id];
              const person = workSheet[`C${row}`].v;

              if (!pgys[person] && isPGY) pgys[person] = 0;

              if (workingDays.includes["" + day] === false) {
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
                const isLeave = cell.s?.fgColor?.rgb === "B4C7E7";

                if (!isLeave) {
                  const duty = depts[dept]["" + day]?.duty;
                  if (duty) {
                    duty.push(person);
                  }
                }
                if (cell.v) {
                  day++;
                  continue;
                }
              }
            }
            */
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

  console.log(">>>>")
  return (
    <BlockStack gap="300">
      <Card>
        <ReadFile title="讀取班表" setWork={setWork} sheet={sheet} />
      </Card>

      {ready && (
        <Card>
          <Select
            label="值班人力"
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
            headings={[
              { title: "日期" },
              { title: "值班人" },
              { title: "　" },
              { title: "　　" },
              { title: "　　　" },
              { title: "　　　　" },
            ]}
          >
            {selected &&
              Object.keys(departments[selected]).map((day) => {
                const duty = departments[selected][day].duty;
                return (
                  <IndexTable.Row key={day}>
                    <IndexTable.Cell>{day}</IndexTable.Cell>
                    <IndexTable.Cell>{duty[0] || ""}</IndexTable.Cell>
                    <IndexTable.Cell>{duty[1] || ""}</IndexTable.Cell>
                    <IndexTable.Cell>{duty[2] || ""}</IndexTable.Cell>
                    <IndexTable.Cell>{duty[3] || ""}</IndexTable.Cell>
                    <IndexTable.Cell>{duty[4] || ""}</IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
          </IndexTable>
        </Card>
      )}
    </BlockStack>
  );
}
