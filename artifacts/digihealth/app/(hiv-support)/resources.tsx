import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListHivResources, getListHivResourcesQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { useAuth } from "../../contexts/AuthContext";

const CATEGORIES = ["Education", "Prevention", "Treatment", "Support", "Testing", "Other"];

export default function HivResources() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("Education");

  const { data: resources, isLoading, refetch } = useListHivResources({
    query: { queryKey: getListHivResourcesQueryKey() }
  });

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) { Alert.alert("Required", "Fill all fields"); return; }
    try {
      const res = await fetch(`/api/hiv-support/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getListHivResourcesQueryKey() });
        setShowModal(false); setTitle(""); setContent(""); setCategory("Education");
      }
    } catch { Alert.alert("Error", "Failed to create resource"); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Resources</Text>
        {currentUser?.role === "hiv_professional" && (
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={resources ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{(item as any).category}</Text>
              </View>
              <Text style={[styles.resourceTitle, { color: colors.foreground }]}>{(item as any).title}</Text>
              <Text style={[styles.resourceContent, { color: colors.mutedForeground }]}>{(item as any).content}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="book-open" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No resources yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: colors.foreground }]}>Add Resource</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>Title</Text>
          <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, marginBottom: 16 }]} value={title} onChangeText={setTitle} placeholder="Resource title" placeholderTextColor={colors.mutedForeground} />
          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} style={[styles.catBtn, { backgroundColor: category === c ? colors.primary : colors.card, borderColor: category === c ? colors.primary : colors.border }]} onPress={() => setCategory(c)}>
                <Text style={[styles.catBtnText, { color: category === c ? colors.primaryForeground : colors.foreground }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Content</Text>
          <TextInput style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} value={content} onChangeText={setContent} placeholder="Resource content..." placeholderTextColor={colors.mutedForeground} multiline numberOfLines={6} textAlignVertical="top" />
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]} onPress={handleCreate}>
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Add Resource</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  newBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  categoryText: { fontSize: 12, fontWeight: "700" },
  resourceTitle: { fontSize: 16, fontWeight: "700" },
  resourceContent: { fontSize: 14, lineHeight: 20 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catBtnText: { fontSize: 13, fontWeight: "600" },
  textArea: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, minHeight: 120 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 20 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
