import React from "react";
import { RefState } from "./RefState";

export type RefStateHook<T> = (initial:T)=> [RefState<T>, React.Dispatch<React.SetStateAction<T>>]