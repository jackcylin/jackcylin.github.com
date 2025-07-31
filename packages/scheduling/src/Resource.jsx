import React, { useState, useEffect } from "react";
import { BlockStack, Card, IndexTable, Select } from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";
import { ReadFile } from "./ReadFile";

export function Resource() {
  const [selectDept, setSelectDept] = useState("");

  const {
    nightShift,
    includes,
    plans,
    excludes,
    columns,
    days,
    pgys,
    setPgys,
    departments,
    setDepartments,
  } = useGlobal();
  const [workbook, setWorkbook] = useState();

  useEffect(() => {
    if (workbook) {
      let startRow = 1;
      const depts = {};
      let personnel = {};
      const missing = [];

      const workSheet = workbook.Sheets[nightShift];

      console.log("parsing ...");

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

            let skipNightShift = 0;

            ["A", "B"].forEach((deptColumn, index) => {
              const id = `${deptColumn}${row}`;
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

                      let startDay = 1,
                        endDay = 15;

                      if (deptColumn === "B") {
                        startDay = 16 + skipNightShift;
                        endDay = 31;
                        skipNightShift = 0;
                      }

                      for (let day = startDay; day <= endDay; day++) {
                        if (!workingDays.includes("" + day)) continue;

                        const column = columns.split(",")[day - 1];
                        const id = `${column}${row}`;
                        const cell = workSheet[id];
                        const person = workSheet[`C${row}`].v;

                        if (!personnel[person] && isPGY)
                          personnel[person] = { count: 0, available: [] };

                        if (!cell) {
                          missing.push(id);
                          continue;
                        }

                        const isLeave = cell.s?.fgColor?.rgb === "B4C7E7";

                        if (!isLeave) {
                          depts[dept][day].duty.push(person);
                          if (personnel[person])
                            personnel[person].available.push(day);
                        }

                        if (cell.v) {
                          day++;

                          if (endDay === 15) skipNightShift = 1;
                          continue;
                        }
                      }
                    });
                }
              }
            });
          }
          startRow = row + 1;
        }
      });

      setDepartments(depts);
      const dept = Object.keys(depts)[0];
      if (!selectDept) setSelectDept(dept);

      // deduct only one on duty
      Object.keys(depts).forEach((d) =>
        Object.keys(depts[d]).forEach((day) => {
          if (depts[d][day].duty.length === 1) {
            const onDuty = depts[d][day].duty[0];
            const nDay = parseInt(day);

            if (
              personnel[onDuty] &&
              personnel[onDuty].available &&
              personnel[onDuty].available.indexOf(nDay) >= 0
            ) {
              personnel[onDuty].available = personnel[onDuty].available.filter(
                (i) => i !== nDay
              );
            }
          }
        })
      );

      //   (dept) =>
      //     departments[dept][clinicDay] &&
      //     departments[dept][clinicDay].duty.includes(intern) &&
      //     departments[dept][clinicDay].duty.length > 1
      // );

      setPgys(personnel);
    }
  }, [workbook]);

  useEffect(() => {
    if (departments && !selectDept) setSelectDept(Object.keys(departments)[0]);
  }, [departments]);

  // console.log(pgys, departments);

  return (
    <BlockStack gap="300">
      <Card>
        <ReadFile
          title="讀取班表"
          setWorkbook={setWorkbook}
          sheet={nightShift}
        />
      </Card>

      {Object.keys(pgys).length ? (
        <Card>
          <IndexTable
            itemCount={Object.keys(pgys).length}
            selectable={false}
            headings={[{ title: "姓名" }, { title: "可值班日期" }]}
          >
            {Object.keys(pgys).map((person) => (
              <IndexTable.Row key={person}>
                <IndexTable.Cell>{person}</IndexTable.Cell>
                <IndexTable.Cell>
                  {pgys[person].available.join(", ")}
                </IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>
      ) : null}

      {departments && (
        <Card>
          <Select
            label="各科值班人力（扣除前一天值夜）"
            options={Object.keys(departments).map((key) => ({
              label: key,
              value: key,
            }))}
            onChange={(value) => setSelectDept(value)}
            value={selectDept}
          />

          <IndexTable
            itemCount={
              departments[selectDept]
                ? Object.keys(departments[selectDept])?.length
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
            {selectDept &&
              Object.keys(departments[selectDept]).map((day) => {
                const duty = departments[selectDept][day].duty;
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
