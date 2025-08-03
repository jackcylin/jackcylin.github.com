import React from "react";
import { Card, InlineStack, TextField } from "@shopify/polaris";
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
