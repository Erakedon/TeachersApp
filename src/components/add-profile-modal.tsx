import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Colors, FontFamily, Radius, Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { type ChildProfile } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddProfileModalProps {
  visible: boolean;
  /** When provided the modal is in edit mode and pre-fills the form. */
  editProfile?: ChildProfile | null;
  onClose: () => void;
  onSave: (draft: { name: string; conditionDescription: string }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddProfileModal({
  visible,
  editProfile,
  onClose,
  onSave,
}: AddProfileModalProps) {
  const insets = useSafeAreaInsets();
  const isEdit = !!editProfile;
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [conditionDescription, setConditionDescription] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    conditionDescription?: string;
  }>({});

  // Pre-fill form when switching to edit mode
  useEffect(() => {
    if (visible && editProfile) {
      setName(editProfile.name);
      setConditionDescription(editProfile.conditionDescription);
      setErrors({});
    } else if (!visible) {
      setName("");
      setConditionDescription("");
      setErrors({});
    }
  }, [visible, editProfile]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t.nameRequired;
    if (!conditionDescription.trim()) {
      next.conditionDescription = t.conditionDescriptionRequired;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      conditionDescription: conditionDescription.trim(),
    });
    handleClose();
  }

  function handleClose() {
    setName("");
    setConditionDescription("");
    setErrors({});
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isEdit ? t.editChildProfile : t.addChildProfile}
            </Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              accessibilityLabel={t.close}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
            >
              <Icon name="close" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t.childName}</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder={t.childNamePlaceholder}
                placeholderTextColor={Colors.outlineVariant}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel={t.childName}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Condition description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t.conditionDescription}</Text>
              <Text style={styles.hint}>{t.conditionDescriptionHint}</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.conditionDescription && styles.inputError,
                ]}
                value={conditionDescription}
                onChangeText={(v) => {
                  setConditionDescription(v);
                  setErrors((e) => ({ ...e, conditionDescription: undefined }));
                }}
                placeholder={t.conditionDescriptionPlaceholder}
                placeholderTextColor={Colors.outlineVariant}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel={t.conditionDescription}
              />
              {errors.conditionDescription && (
                <Text style={styles.errorText}>
                  {errors.conditionDescription}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.btnCancel,
                pressed && styles.btnPressed,
              ]}
              onPress={handleClose}
              accessibilityRole="button"
            >
              <Text style={styles.btnCancelLabel}>{t.cancel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btnSave,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Text style={styles.btnSaveLabel}>
                {isEdit ? t.saveChanges : t.saveProfile}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.two,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
    alignSelf: "center",
    marginBottom: Spacing.three,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    fontFamily: FontFamily.headline,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnPressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  formContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
  hint: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.outlineVariant,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 120,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.error,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: "center",
  },
  btnSave: {
    flex: 2,
    paddingVertical: Spacing.three,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnCancelLabel: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  btnSaveLabel: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onPrimary,
  },
});
