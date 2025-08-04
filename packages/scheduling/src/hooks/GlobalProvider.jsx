import React, { useState, useEffect, createContext } from "react";

const KEY = "values";
const DEFAULT = {
  year: 2027,
  month: 7,
  includes: "PGY,R1,R2,R3",
  plans: "PGY,R1",
  excludes: "外訓,特休,休假",
};

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [nightShift] = useState("夜班值班表");
  const [inputs, setInputs] = useState();
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [includes, setIncludes] = useState();
  const [excludes, setExcludes] = useState();
  const [plans, setPlans] = useState();
  const [columns] = useState(() =>
    [...Array(26).keys()]
      .map((i) => String.fromCharCode(i + 65))
      .concat(
        [...Array(13).keys()].map((i) => "A" + String.fromCharCode(i + 65))
      )
      .filter((col) =>
        col.length === 1 && "A" <= col && col <= "G" ? false : true
      )
      .join(",")
  );
  const [pgys, setPgys] = useState({});
  const [departments, setDepartments] = useState();
  const [clinics, setClinics] = useState();

  useEffect(() => {
    const ins = {
      ...DEFAULT,
      ...JSON.parse(localStorage.getItem(KEY) || "{}"),
    };
    setYear(ins.year);
    setMonth(ins.month);
    setIncludes(ins.includes);
    setExcludes(ins.excludes);
    setPlans(ins.plans);
    setInputs(ins);

    setClinics(JSON.parse(localStorage.getItem("clinics") || "{}"));
  }, []);

  const updateStorage = (changes) => {
    const updated = { ...inputs, ...changes };
    localStorage.setItem(KEY, JSON.stringify(updated));
    setInputs(updated);
  };

  return (
    <GlobalContext.Provider
      value={{
        includes, // 納入值班人力群組(PGY,R1,R2,R3)
        setIncludes,
        excludes, // 排除科別(外訓,特休,休假)
        setExcludes,
        plans, // 納入教學門診排班群組(PGY,R1)
        setPlans,
        year,
        setYear,
        month,
        setMonth,
        nightShift, // 表格 "夜班值班表"
        columns,
        updateStorage,
        pgys, // 教學門診排班人員, "姓名": 次數
        setPgys,
        departments,
        setDepartments,
        clinics,
        setClinics,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
