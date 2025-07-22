import React, { useState, useEffect, createContext } from "react";

const KEY = "values";
const DEFAULT = {
  year: 2027,
  month: 7,
  includes: "PGY,R1,R2,R3",
  plans: "PGY,R1",
  excludes: "外訓,特休,休假",
  days: "",
};

export const GlobalContext = createContext();

// eslint-disable-next-line react/prop-types
export function GlobalProvider({ children }) {
  const [sheet] = useState("夜班值班表");
  const [inputs, setInputs] = useState();
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [includes, setIncludes] = useState();
  const [excludes, setExcludes] = useState();
  const [plans, setPlans] = useState();
  const [days, setDays] = useState();
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
  const [workbook, setWorkbook] = useState();

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
    setDays(ins.days);
    setInputs(ins);
  }, []);

  const updateStorage = (changes) => {
    const updated = { ...inputs, ...changes };
    localStorage.setItem(KEY, JSON.stringify(updated));
    setInputs(updated);
  };

  return (
    <GlobalContext.Provider
      value={{
        includes,
        setIncludes,
        excludes,
        setExcludes,
        plans,
        setPlans,
        year,
        setYear,
        month,
        setMonth,
        days,
        setDays,
        sheet,
        columns,
        workbook,
        setWorkbook,
        updateStorage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
