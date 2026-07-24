import { common } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { error, indigo, info, neutral, success, violet, warning } from './colors';

export function createPalette(mode = 'light') {
  if (mode === 'dark') {
    return {
      action: {
        active: neutral[400],
        disabled: alpha(common.white, 0.38),
        disabledBackground: alpha(common.white, 0.12),
        focus: alpha(common.white, 0.16),
        hover: alpha(common.white, 0.06),
        selected: alpha(common.white, 0.12)
      },
      background: {
        default: neutral[900],
        paper: neutral[800]
      },
      divider: neutral[700],
      error,
      info,
      mode: 'dark',
      neutral,
      primary: indigo,
      secondary: violet,
      success,
      text: {
        primary: '#EDF2F7',
        secondary: neutral[400],
        disabled: alpha(common.white, 0.38)
      },
      warning
    };
  }

  return {
    action: {
      active: neutral[500],
      disabled: alpha(neutral[900], 0.38),
      disabledBackground: alpha(neutral[900], 0.12),
      focus: alpha(neutral[900], 0.16),
      hover: alpha(neutral[900], 0.04),
      selected: alpha(neutral[900], 0.12)
    },
    background: {
      default: common.white,
      paper: common.white
    },
    divider: '#F2F4F7',
    error,
    info,
    mode: 'light',
    neutral,
    primary: indigo,
    secondary: violet,
    success,
    text: {
      primary: neutral[900],
      secondary: neutral[500],
      disabled: alpha(neutral[900], 0.38)
    },
    warning
  };
}
