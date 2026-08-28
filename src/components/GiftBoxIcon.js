import React from 'react';
import { Image } from 'react-native';

const logoSource = require('../../assets/thoughtfully-logo.png');

const GiftBoxIcon = ({ size = 70, style }) => {
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

export default GiftBoxIcon;
