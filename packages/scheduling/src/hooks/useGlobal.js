import { useContext } from "react";
import { GlobalContext } from "./GlobalProvider";

export function useGlobal() {
  return useContext(GlobalContext);
}
