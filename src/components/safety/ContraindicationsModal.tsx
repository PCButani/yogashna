import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ContraindicationsModalProps = {
  visible: boolean;
  programTitle: string;
  safetyNotes: string[];
  onCancel: () => void;
  onContinue: () => void;
};

export default function ContraindicationsModal({
  visible,
  programTitle,
  safetyNotes,
  onCancel,
  onContinue,
}: ContraindicationsModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleContinue = () => {
    if (!acknowledged) return;
    onContinue();
    // Reset state for next time
    setAcknowledged(false);
  };

  const handleCancel = () => {
    setAcknowledged(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={28} color="#DC2626" />
            </View>
            <Text style={styles.title}>Before you begin</Text>
            <Text style={styles.subtitle}>{programTitle}</Text>
          </View>

          {/* Safety Notes */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning-outline" size={18} color="#DC2626" />
                <Text style={styles.warningTitle}>Important Safety Information</Text>
              </View>

              <Text style={styles.warningIntro}>
                Please read these contraindications carefully before starting this program:
              </Text>

              <View style={styles.notesList}>
                {safetyNotes.map((note, idx) => (
                  <View key={idx} style={styles.noteItem}>
                    <View style={styles.noteBullet} />
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  If you have any of these conditions, please consult with a healthcare
                  professional before starting this program.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Acknowledgment Checkbox */}
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAcknowledged(!acknowledged)}
            hitSlop={10}
          >
            <View style={[styles.checkbox, acknowledged && styles.checkboxActive]}>
              {acknowledged && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I understand and want to continue
            </Text>
          </Pressable>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueBtn, !acknowledged && styles.continueBtnDisabled]}
              onPress={handleContinue}
              disabled={!acknowledged}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 10,
      },
    }),
  },

  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },

  contentScroll: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 12,
  },

  warningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 20,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },

  warningIntro: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },

  notesList: {
    marginBottom: 12,
  },

  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  noteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 10,
    marginTop: 6,
  },

  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '500',
  },

  disclaimerBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  disclaimerText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    lineHeight: 18,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 20,
    marginBottom: 16,
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },

  checkboxActive: {
    backgroundColor: '#2E6B4F',
    borderColor: '#2E6B4F',
  },

  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },

  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#2E6B4F',
  },

  continueBtnDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },

  continueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
