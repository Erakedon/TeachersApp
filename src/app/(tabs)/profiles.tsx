import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddProfileModal } from "@/components/add-profile-modal";
import { ChildProfileCard } from "@/components/child-profile-card";
import { Icon } from "@/components/icon";
import {
    BottomTabInset,
    Colors,
    FontFamily,
    Radius,
    Spacing,
    Typography,
} from "@/constants/theme";
import { ChildProfileRepository } from "@/db/child-profile-repository";
import { type ChildProfile } from "@/types";

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ProfilesScreen() {
  const db = useSQLiteContext();
  const repo = useMemo(() => new ChildProfileRepository(db), [db]);
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(
    null,
  );

  const loadProfiles = useCallback(async () => {
    const all = await repo.getAll();
    setProfiles(all);
  }, [repo]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleToggle(id: string, value: boolean) {
    await repo.setActive(id, value);
    await loadProfiles();
  }

  async function handleSave(draft: {
    name: string;
    conditionDescription: string;
  }) {
    if (editingProfile) {
      await repo.update(editingProfile.id, draft);
    } else {
      await repo.insert({
        id: Date.now().toString(),
        isActive: true,
        ...draft,
      });
    }
    setEditingProfile(null);
    await loadProfiles();
  }

  function handleEdit(profile: ChildProfile) {
    setEditingProfile(profile);
    setModalVisible(true);
  }

  function handleDelete(id: string) {
    const profile = profiles.find((p) => p.id === id);
    Alert.alert(
      "Delete Profile",
      `Remove ${profile?.name ?? "this profile"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await repo.delete(id);
            await loadProfiles();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.overline}>Care Management</Text>
          <Text style={styles.title}>Special Requirements</Text>
        </View>

        {/* GDPR / RODO compliance banner */}
        <View style={styles.gdprBanner}>
          <Icon name="verified-user" size={22} color={Colors.primary} />
          <Text style={styles.gdprText}>
            This view is filtered for specialised care. Data is encrypted and
            compliant with local educational privacy regulations (RODO).
          </Text>
        </View>

        {/* Add profile button */}
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
          ]}
          onPress={() => {
            setEditingProfile(null);
            setModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Add child profile"
        >
          <Icon name="person-add" size={20} color={Colors.onPrimaryContainer} />
          <Text style={styles.addBtnLabel}>Add Child Profile</Text>
        </Pressable>

        {/* Profile list */}
        <View style={styles.list}>
          {profiles.map((profile) => (
            <ChildProfileCard
              key={profile.id}
              profile={profile}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </View>
      </ScrollView>

      <AddProfileModal
        visible={modalVisible}
        editProfile={editingProfile}
        onClose={() => {
          setModalVisible(false);
          setEditingProfile(null);
        }}
        onSave={handleSave}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  pageHeader: {
    gap: Spacing.half,
  },
  overline: {
    ...Typography.overline,
    color: Colors.onSurfaceVariant,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
  },
  gdprBanner: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two + Spacing.one,
  },
  gdprText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primaryFixed,
  },
  addBtnPressed: {
    opacity: 0.75,
  },
  addBtnLabel: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onPrimaryContainer,
  },
  list: {
    gap: Spacing.two,
  },
});
