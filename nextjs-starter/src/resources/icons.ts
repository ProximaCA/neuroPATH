import { IconType } from "react-icons";

import {
  HiOutlineRocketLaunch,
} from "react-icons/hi2";

import {
  HiArrowLeft,
  HiPlayCircle,
} from "react-icons/hi2";


export const iconLibrary: Record<string, IconType> = {
  rocket: HiOutlineRocketLaunch,
  "arrow-left": HiArrowLeft,
  "play-circle": HiPlayCircle,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;