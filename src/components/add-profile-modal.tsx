import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChildProfile, ConditionType } from '@/components/child-profile-card';
import { Icon } from '@/components/icon';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: Omit<ChildProfile, 'id'>) => void;
}

const CONDITIONS: ConditionType[] = ['ASD', 'Severe Allergy', 'ADHD', 'Physical'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddProfileModal({ visible, onClose, onSave }: AddProfileModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState<ConditionType>('ASD');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required.';
    const ageNum = Number(age);
    if (!age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 12) {
      next.age = 'Enter a valid age (1–12).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ name: name.trim(), condition, active: true });
    handleClose();
  }

  function handleClose() {
    setName('');
    setAge('');
    setCondition('ASD');
    setNotes('');
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.four }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add Child Profile</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              accessibilityLabel="Close"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
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
              <Text style={styles.label}>Child's Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
                placeholder="e.g. Leo Anderson"
                placeholderTextColor={Colors.outlineVariant}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Child name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Age */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                value={age}
                onChangeText={(t) => { setAge(t); setErrors((e) => ({ ...e, age: undefined })); }}
                placeholder="e.g. 5"
                placeholderTextColor={Colors.outlineVariant}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={2}
                accessibilityLabel="Child age"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            {/* Condition picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Condition Type</Text>
              <View style={styles.conditionRow}>
                {CONDITIONS.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.conditionChip, condition === c && styles.conditionChipSelected]}
                    onPress={() => setCondition(c)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: condition === c }}
                  >
                    <Text
                      style={[
                        styles.conditionChipLabel,
                        condition === c && styles.conditionChipLabelSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Dietary restrictions, emergency contacts, accommodations…"
                placeholderTextColor={Colors.outlineVariant}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Additional notes"
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btnCancel, pressed && styles.btnPressed]}
              onPress={handleClose}
              accessibilityRole="button"
            >
              <Text style={styles.btnCancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSave, pressed && styles.btnPressed]}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Text style={styles.btnSaveLabel}>Save Profile</Text>
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
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 96,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.error,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  conditionChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  conditionChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  conditionChipLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  conditionChipLabelSelected: {
    color: Colors.onPrimaryContainer,
    fontFamily: FontFamily.bodySemiBold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  btnSave: {
    flex: 2,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onPrimary,
  },
  btnPressed: {
    opacity: 0.75,
  },
});
