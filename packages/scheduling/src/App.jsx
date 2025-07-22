import React, { useState } from "react";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider, Page, BlockStack } from "@shopify/polaris";
import { Inputs } from "./Inputs";
import { Upload } from "./Upload";
import { Schedule } from "./Schedule";
import { GlobalProvider } from "./hooks/GlobalProvider";

import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <GlobalProvider>
        <Page title="教學門診排班">
          <BlockStack gap="300">
            <Inputs />
            <Upload />
            <Schedule />
          </BlockStack>
        </Page>
      </GlobalProvider>
    </AppProvider>
  );
}
