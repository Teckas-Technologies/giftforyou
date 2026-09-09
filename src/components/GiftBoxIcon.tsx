import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';

const logoSource = require('../../assets/thoughtfully-logo.png');

interface GiftBoxIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const GiftBoxIcon = ({ size = 70, style }: GiftBoxIconProps) => {
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

export default GiftBoxIcon;
