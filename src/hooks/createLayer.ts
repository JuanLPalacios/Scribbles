import { useState, useEffect } from "react";
import { blendModes } from "../types/BlendMode";
import { LayerState } from "../types/LayerState";
import { Point } from "../types/Point";
import { Rect } from "../types/Rect";
import { createDrawable } from "./createDrawable";

export const createLayer = (name:string, rect:Rect):LayerState => {
  const { size} = rect;
  const [ width, height ] = size;
  const canvas = createDrawable({size});
  const buffer = createDrawable({size});
  const thumbnail = createDrawable({size:[40, 40 * (height / width)]}); 
    return {
      key: Date.now(),
      name,
      rect,
      canvas,
      buffer,
      thumbnail,
      visible:true,
      opacity:1,
      mixBlendMode: blendModes[0]
    };
  }