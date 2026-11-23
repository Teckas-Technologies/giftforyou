import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
  TextPath,
} from 'react-native-svg';

interface FoundingMemberBadgeProps {
  /** Founding member number, shown at the bottom of the ring (e.g. 116). */
  number: number;
  /** The avatar, drawn in the middle of the ring. */
  children: React.ReactNode;
  /** Diameter of the avatar inside the ring. */
  avatarSize?: number;
}

// Founding member avatar ring (client "teal ring" design):
//   avatar → thin dark outline → gold ring → teal ring with
//   "FOUNDING MEMBER" curved along the top and the member number at the
//   bottom. Replaces the old gold "Founding Member #116 of 5000" pill.
const GOLD_WIDTH = 9;
const TEAL_WIDTH = 24;

const FoundingMemberBadge = ({ number, children, avatarSize = 80 }: FoundingMemberBadgeProps) => {
  const avatarR = avatarSize / 2;
  const goldOuterR = avatarR + GOLD_WIDTH;
  const outerR = goldOuterR + TEAL_WIDTH;
  const size = outerR * 2;
  const c = outerR; // centre
  const textR = goldOuterR + TEAL_WIDTH / 2 - 4; // baseline of the curved text

  // Arc over the top, left → right, for the curved label.
  const topArc = `M ${c - textR},${c} A ${textR},${textR} 0 0 1 ${c + textR},${c}`;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityLabel={`Founding member number ${number}`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="fmGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F6DD8C" />
            <Stop offset="0.45" stopColor="#D4A62A" />
            <Stop offset="0.75" stopColor="#B07D12" />
            <Stop offset="1" stopColor="#F0C95A" />
          </SvgLinearGradient>
          <Path id="fmTopArc" d={topArc} />
        </Defs>

        {/* Teal outer ring */}
        <Circle cx={c} cy={c} r={outerR} fill="#A8E0DA" />
        {/* Gold ring */}
        <Circle cx={c} cy={c} r={goldOuterR} fill="url(#fmGold)" />
        {/* Thin dark outline around the avatar */}
        <Circle cx={c} cy={c} r={avatarR + 0.75} fill="#4A3410" />

        <SvgText
          fill="#1E3A3A"
          fontSize={11}
          fontWeight="700"
          letterSpacing={3}
          textAnchor="middle"
        >
          <TextPath href="#fmTopArc" startOffset="50%">
            FOUNDING MEMBER
          </TextPath>
        </SvgText>

        <SvgText
          x={c}
          y={c + goldOuterR + TEAL_WIDTH / 2 + 4}
          fill="#1E3A3A"
          fontSize={12}
          fontWeight="700"
          letterSpacing={1}
          textAnchor="middle"
        >
          {number}
        </SvgText>
      </Svg>

      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarR,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default FoundingMemberBadge;
