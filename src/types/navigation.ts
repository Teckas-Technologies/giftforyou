// A full RootStackParamList (mapping every screen name to its param shape)
// would be a substantial separate typing effort across ~25 screens and the
// navigator itself — out of scope for this pass. `navigation`/`route` stay
// loosely typed; this is a deliberate, acknowledged boundary, not an
// oversight.
export interface ScreenProps {
  navigation: any;
  route?: any;
}

export interface IconProps {
  size?: number;
  color?: string;
}
