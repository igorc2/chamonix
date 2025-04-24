/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const brandChamonixOne = '#0d2b3e'; // Luxurious dark cyan
const brandChamonixTwo = '#0077c9'; // Bright blue
const brandChamonixThree = '#005293'; // Darker blue
const brandChamonixFour = '#003359'; // Very dark blue

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandChamonixOne,
    header: brandChamonixFour,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandChamonixTwo,
    header: brandChamonixFour,
  },
};
