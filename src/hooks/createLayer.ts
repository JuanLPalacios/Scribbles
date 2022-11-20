import { useState, useEffect } from "react";
import { LayerState } from "../types/LayerState";
import { Point } from "../types/Point";
import { createDrawable } from "./createDrawable";

export const createLayer:(initial:LayerState)=> LayerState = (initial) => {
    
  const {rect, canvas: prevCanvas, buffer: prevBuffer, thumbnail: prevThumbnail} = initial;
  const { size} = rect;
  const [ width, height ] = size;
  const canvas = createDrawable(prevCanvas || {size});
  const buffer = createDrawable(prevBuffer || {size});
  const thumbnail = createDrawable(prevThumbnail || {size:[40, 40 * (height / width)]}); 
    return {...initial, canvas, buffer, thumbnail};
  }