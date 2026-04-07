import { View, Text, TextInput, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { registerStyles as styles } from "./registerStyles";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface InputFieldProps {
  label: string;
  required?: boolean;
  icon: FeatherIconName;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: number;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export function InputField({
  label,
  required,
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  focused,
  onFocus,
  onBlur,
  keyboardType,
  maxLength,
  autoCapitalize,
}: InputFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error ? styles.inputWrapError : null,
        ]}
      >
        <Feather
          name={icon}
          size={16}
          color={focused ? colors.primary : colors.gray}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <ErrorMsg msg={error} /> : null}
    </View>
  );
}

export function ErrorMsg({ msg }: { msg: string }) {
  return (
    <View style={styles.errorRow}>
      <Feather name="alert-circle" size={12} color={colors.error} />
      <Text style={styles.errorText}>{msg}</Text>
    </View>
  );
}

export function HintItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.hintRow}>
      <Feather
        name={met ? "check-circle" : "circle"}
        size={14}
        color={met ? colors.success : colors.textMuted}
      />
      <Text style={[styles.hintText, met && styles.hintTextMet]}>{text}</Text>
    </View>
  );
}
