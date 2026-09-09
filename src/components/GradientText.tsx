import React, { ReactNode } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientTextProps {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientText = ({
  children,
  style,
  colors = ['#ca9ad6', '#70d0dd'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientTextProps) => {
  return (
    <MaskedView
      maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}
    >
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
