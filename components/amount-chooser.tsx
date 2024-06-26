import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputEndEditingEventData,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { amountSeparator, getAmountText } from "./amount";

// Input components allows entry in range $0.01 to $99,999.99
const MAX_DOLLAR_INPUT_EXCLUSIVE = 100_000;

export function AmountChooser({
  dollars,
  onSetDollars,
  showAmountAvailable,
  autoFocus,
  lagAutoFocus,
  disabled,
  innerRef,
  onFocus,
  mt = true,
}: {
  dollars: number;
  onSetDollars: (dollars: number) => void;
  showAmountAvailable: boolean;
  autoFocus: boolean;
  lagAutoFocus: boolean;
  disabled?: boolean;
  innerRef?: React.RefObject<TextInput>;
  onFocus?: () => void;
  mt?: boolean;
}) {
  return (
    <View className={`px-16 ${mt ? "mt-16" : ""}`}>
      <AmountInput
        dollars={dollars}
        onChange={onSetDollars}
        disabled={disabled}
        innerRef={innerRef}
        autoFocus={autoFocus}
        lagAutoFocus={lagAutoFocus}
        onFocus={onFocus}
      />
    </View>
  );
}

function AmountInput({
  dollars,
  onChange,
  innerRef,
  autoFocus,
  lagAutoFocus,
  disabled,
  onFocus,
}: {
  dollars: number;
  onChange: (dollars: number) => void;
  innerRef?: React.RefObject<TextInput>;
  autoFocus?: boolean;
  lagAutoFocus?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
}) {
  if (dollars < 0) throw new Error("AmountPicker value can't be negative");
  const fmt = (dollars: number) => getAmountText({ dollars, symbol: "" });

  const [strVal, setStrVal] = useState(dollars <= 0 ? "" : fmt(dollars));

  // While typing, show whatever the user is typing
  const change = useCallback((text: string) => {
    if (disabled) return;

    // Haptic (tactile) feedback on each keypress
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Validate. Handle negative numbers, NaN, out of range.
    const looksValid = /^(|0|(0?[.,]\d*)|([1-9]\d*[.,]?\d*))$/.test(text);
    const newVal = parseLocalFloat(text);
    if (!looksValid || !(newVal >= 0) || newVal >= MAX_DOLLAR_INPUT_EXCLUSIVE) {
      // reject input
      return;
    }

    // Max two decimals: if necessary, modify entry
    const parts = text.split(/[.,]/);
    if (parts.length >= 2) {
      const roundedStr = `${parts[0]}${amountSeparator}${parts[1].slice(0, 2)}`;
      const roundedVal = parseLocalFloat(`${parts[0]}.${parts[1].slice(0, 2)}`);
      setStrVal(roundedStr);
      onChange(roundedVal);
      return;
    }

    // Accept entry as-is
    setStrVal(text);
    onChange(newVal);
  }, []);

  // Once we're done, round value to 2 decimal places
  const onBlur = (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
    const value = e.nativeEvent.text;

    let newVal = parseLocalFloat(value);
    if (!(newVal >= 0)) {
      newVal = 0;
    }
    const newStrVal = fmt(newVal);
    setStrVal(newVal > 0 ? newStrVal : "");

    const truncated = parseLocalFloat(newStrVal);
    onChange(truncated);
  };

  const otherRef = useRef<TextInput>(null);
  const ref = innerRef || otherRef;

  // Controlled component, but with state to allow typing "0", "0.", etc.
  useEffect(() => {
    if (ref.current?.isFocused()) return;
    setStrVal(dollars <= 0 ? "" : fmt(dollars));
  }, [dollars]);

  const focus = useCallback(() => {
    ref.current?.focus();
    if (onFocus) onFocus();
  }, [ref, onFocus]);

  const isFocused = useIsFocused();
  if (lagAutoFocus && isFocused) focus();
  if (!isFocused) ref.current?.blur();
  /*const nav = useNav();

  useEffect(() => {
    // Re-focus after screen transition animations finish.
    // This is a workaround for a bug in react-navigation where autoFocus
    // doesn't persist across screen animations.
    nav.addListener("transitionEnd", () => {
      if (lagAutoFocus && isFocused) focus();
      if (!isFocused) ref.current?.blur();
    });
  }, [isFocused, lagAutoFocus]);*/

  return (
    <TouchableWithoutFeedback onPress={focus}>
      <View className="flex flex-row items-center">
        <Text
          className={`text-4xl font-semibold text-right text-white leading-[43px] -mb-1.5`}
        >
          $
        </Text>
        <TextInput
          className="flex-grow text-5xl h-16 font-semibold text-white tabular-nums leading-[58px]"
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={"#374151"}
          numberOfLines={1}
          focusable={!disabled}
          editable={!disabled}
          selectTextOnFocus
          autoFocus={lagAutoFocus ? false : autoFocus ?? true}
          value={strVal}
          ref={innerRef || otherRef}
          onChangeText={change}
          onEndEditing={onBlur} /* called on blur, works on Android */
          onTouchEnd={focus}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

// Parse both 1.23 and 1,23
function parseLocalFloat(str?: string) {
  if (str == null || ["", ".", ","].includes(str)) return 0;
  return parseFloat(str.replace(",", "."));
}
