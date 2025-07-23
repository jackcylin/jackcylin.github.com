import React, { useState, useCallback } from "react";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider, Page, Tabs } from "@shopify/polaris";
import { GlobalProvider } from "./hooks/GlobalProvider";
import { createRoot } from "react-dom/client";
import { Inputs } from "./Inputs";
import { Schedule } from "./Schedule";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

function App() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );

  const tabs = [
    {
      id: "1",
      content: "參數",
      accessibilityLabel: "參數",
      component: Inputs,
    },
    {
      id: "2",
      content: "班表",
      accessibilityLabel: "班表",
      component: Schedule,
    },
    {
      id: "3",
      content: "教學門診",
      accessibilityLabel: "教學門診",
      component: C3,
    },
  ];
  const Comp = tabs[selected].component;

  return (
    <AppProvider i18n={enTranslations}>
      <GlobalProvider>
        <Page title="教學門診排班">
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <Comp />
          </Tabs>
        </Page>
      </GlobalProvider>
    </AppProvider>
  );
}

function C2() {
  return <div>C2</div>;
}

function C3() {
  return <div>C3</div>;
}
