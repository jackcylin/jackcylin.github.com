import React from "react";
import { Card, InlineStack, TextField, Button } from "@shopify/polaris";
import { useGlobal } from "./hooks/useGlobal";

export function Inputs() {
  const {
    includes,
    setIncludes,
    plans,
    setPlans,
    excludes,
    setExcludes,
    year,
    setYear,
    month,
    setMonth,
    days,
    setDays,
    columns,
    updateStorage,
  } = useGlobal();

  return (
    <Card>
      <InlineStack gap="300" align="start" wrap={false}>
        <TextField
          label="西元年"
          type="number"
          value={year}
          placeholder="2025"
          onChange={(value) => {
            setYear(value);
            updateStorage({ year: value });
          }}
          autoComplete="off"
        />

        <TextField
          label="月"
          type="number"
          value={month}
          placeholder="1 ~ 12"
          onChange={(value) => {
            setMonth(value);
            updateStorage({ month: value });
          }}
          autoComplete="off"
        />
      </InlineStack>

      <InlineStack gap="300" align="space-between" wrap={false}>
        <div style={{ width: "100%" }}>
          <TextField
            label="工作日(英文逗號,間隔)"
            type="string"
            value={days}
            onChange={(value) => {
              const trimmed = (value || "")
                .split(",")
                .map((i) => i.trim())
                .join(",");
              setDays(trimmed);
              updateStorage({ days: trimmed });
            }}
            autoComplete="off"
          />
        </div>

        <Button
          onClick={() => {
            const DAYS = new Date(year, month, 0).getDate();
            const WEEK_DAYS = [...Array(DAYS).keys()]
              .map((i) => i + 1)
              .filter((d) => {
                const day = new Date(year, month - 1, d, 8).getDay();
                return day === 6 || day === 0 ? false : true;
              })
              .join(",");
            setDays(WEEK_DAYS);
            // .reduce((acc, cur) => {
            //   acc[cur] = { duty: [] };
            //   return acc;
            // }, {});
            // return WEEK_DAYS.join(",")
          }}
        >
          依日曆計算工作日
        </Button>
      </InlineStack>

      <TextField
        label="Sheet"
        type="string"
        value={"夜班值班表"}
        disabled
        readonly
      />
      <TextField label="範圍" type="string" value={columns} disabled readonly />

      <InlineStack gap="300" align="start" wrap={false}>
        <TextField
          label="納入值班人力群組(英文逗號,間隔)"
          type="string"
          value={includes}
          onChange={(value) => {
            const trimmed = (value || "")
              .split(",")
              .map((i) => i.trim())
              .join(",");
            setIncludes(trimmed);
            updateStorage({ includes: trimmed });
          }}
          autoComplete="off"
        />
        <TextField
          label="納入教學門診排班群組(英文逗號,間隔)"
          type="string"
          value={plans}
          onChange={(value) => {
            const trimmed = (value || "")
              .split(",")
              .map((i) => i.trim())
              .join(",");
            setPlans(trimmed);
            updateStorage({ plans: trimmed });
          }}
          autoComplete="off"
        />
      </InlineStack>

      <TextField
        label="排除科別(英文逗號,間隔)"
        type="string"
        value={excludes}
        onChange={(value) => {
          const trimmed = (value || "")
            .split(",")
            .map((i) => i.trim())
            .join(",");
          setExcludes(trimmed);
          updateStorage({ excludes: trimmed });
        }}
        autoComplete="off"
      />
    </Card>
  );
}
