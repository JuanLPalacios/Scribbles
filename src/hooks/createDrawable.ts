import { useState, useEffect, useRef } from "react";
import { DrawableState } from "../types/DrawableState";
import { RefStateHook } from "../types/RefStateHook";

export const createDrawable = (initial:DrawableState | {size:[number,number]}) => {
  let  {canvas, ctx} = initial as DrawableState;
  const  {size} = initial as {size:[number,number]};
    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.width = size[0];
      canvas.height = size[1];
      ctx = canvas.getContext('2d');
      return {canvas, ctx}
    }
    return initial as DrawableState;
  }