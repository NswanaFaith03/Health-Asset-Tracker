/**
 * @module Consultation Features
 * @file ConsultationActions.tsx
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, ScrollView, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

interface ConsultationAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  allowedRoles: string[];
  requiresReason: boolean;
  availableStatuses: string[];
}

interface ConsultationActionsProps {
  consultationId: number;
  currentStatus: string;
  consultationOwnerId: number;
  onActionComplete?: () => void;
}

// Base consultation actions configuration
const BASE_ACTIONS: ConsultationAction[] = [
  {
    id: "dismiss",
    label: "Dismiss",
    icon: "x-circle" as any,
    color: "#ef4444",
    allowedRoles: ["doctor", "admin"],
    requiresReason: true,
    availableStatuses: ["submitted", "under_review", "assigned"],
  },
  {
    id: "resolve",
    label: "Resolve",
    icon: "check-circle" as any,
    color: "#10b981",
    allowedRoles: ["doctor", "admin"],
    requiresReason: true,
    availableStatuses: ["responded", "assigned"],
  },
  {
    id: "request_info",
    label: "Request Info",
    icon: "message-circle" as any,
    color: "#f59e0b",
    allowedRoles: ["doctor", "nurse", "admin"],
    requiresReason: true,
    availableStatuses: ["submitted", "under_review", "assigned", "responded"],
  },
];

// Polymorphic role-specific action extensions
const ROLE_ACTION_EXTENSIONS: Record<string, ConsultationAction[]> = {
  doctor: [
    {
      id: "assign_to_me",
      label: "Assign to Me",
      icon: "user-check" as any,
      color: "#3b82f6",
      allowedRoles: ["doctor"],
      requiresReason: false,
      availableStatuses: ["submitted"],
    },
  ],
  nurse: [
    {
      id: "request_vitals",
      label: "Request Vitals",
      icon: "activity" as any,
      color: "#8b5cf6",
      allowedRoles: ["nurse"],
      requiresReason: true,
      availableStatuses: ["submitted", "under_review"],
    },
  ],
  admin: BASE_ACTIONS, // Admin has all base actions
};

export function useConsultationActions(role: string, currentStatus: string, consultationOwnerId: number) {
  const currentUser = useAuth();
  
  // Get role-specific actions
  const roleActions = ROLE_ACTION_EXTENSIONS[role] || [];
  
  // Combine base actions with role-specific ones
  const allActions = [...BASE_ACTIONS, ...roleActions];
  
  // Filter actions based on current status and permissions
  const availableActions = allActions.filter(action => {
    const hasPermission = action.allowedRoles.includes(role);
    const statusMatches = action.availableStatuses.includes(currentStatus);
    return hasPermission && statusMatches;
  });
  
  return availableActions;
}

export function ConsultationActions({ consultationId, currentStatus, consultationOwnerId, onActionComplete }: ConsultationActionsProps) {
  const colors = useColors();
  const { currentUser } = useAuth();
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ConsultationAction | null>(null);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const availableActions = useConsultationActions(currentUser?.role || "", currentStatus, consultationOwnerId);

  const handleActionPress = (action: ConsultationAction) => {
    setSelectedAction(action);
    if (action.requiresReason) {
      setShowActionModal(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: ConsultationAction) => {
    setIsProcessing(true);
    try {
      // Get token from storage for the API call
      const token = Platform.OS === "web" 
        ? localStorage.getItem("auth_token")
        : await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/consultations/${consultationId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: action.id,
          reason: action.requiresReason ? reason : undefined,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", `${action.label} completed successfully`);
        setShowActionModal(false);
        setReason("");
        setSelectedAction(null);
        onActionComplete?.();
      } else {
        const error = await response.json();
        Alert.alert("Error", error.error || "Failed to complete action");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to complete action");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <View style={styles.actionsContainer}>
        {availableActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color + "15", borderColor: action.color }]}
            onPress={() => handleActionPress(action)}
          >
            <Feather name={action.icon} size={16} color={action.color} />
            <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={showActionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {selectedAction?.label}
            </Text>
            <TouchableOpacity onPress={() => setShowActionModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalPrompt, { color: colors.mutedForeground }]}>
            Please provide a reason for this action:
          </Text>

          <TextInput
            style={[styles.reasonInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="Enter reason..."
            placeholderTextColor={colors.mutedForeground}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isProcessing ? 0.7 : 1 }]}
            onPress={() => selectedAction && executeAction(selectedAction)}
            disabled={isProcessing || !reason.trim()}
          >
            {isProcessing ? (
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Processing...</Text>
            ) : (
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Complete Action</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  modal: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalPrompt: {
    fontSize: 14,
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
  },
});