import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const TodoDetailModal = ({
  visible,
  todo,
  onClose,
  onDelete,
  onEdit,
  onStartTimer,
}: any) => {
  if (!todo) return null;

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.detailModal,
            {borderTopColor: todo.subject_color || '#8B4513'},
          ]}>
          <View style={styles.detailHeader}>
            <Text style={styles.subjectIcon}>{todo.subject_icon}</Text>
            <Text style={styles.subjectName}>{todo.subject_name}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.detailTitle}>{todo.title}</Text>

          {todo.priority !== 'no' && (
            <View
              style={[
                styles.detailPriority,
                {
                  backgroundColor:
                    todo.priority === 'high'
                      ? '#ea4343'
                      : todo.priority === 'medium'
                      ? '#e7b250'
                      : '#54ba57',
                },
              ]}>
              <Text style={styles.detailPriorityText}>
                {todo.priority === 'high'
                  ? 'High Priority'
                  : todo.priority === 'medium'
                  ? 'Medium Priority'
                  : 'Low Priority'}
              </Text>
            </View>
          )}

          {todo.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailText}>{todo.description}</Text>
            </View>
          )}

          {todo.due_date && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailText}>
                {new Date(todo.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.timerBtn]}
              onPress={onStartTimer}>
              <Icon name="timer-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={onEdit}>
              <Icon name="create-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={onDelete}>
              <Icon name="trash-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectIcon: {
    fontSize: 28,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderTopWidth: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailPriority: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  detailPriorityText: {
    color: 'white',
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailText: {
    fontSize: 15,
    color: '#1E293B',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  timerBtn: {
    backgroundColor: '#7C3AED',
  },
  editBtn: {
    backgroundColor: '#2563EB',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export {TodoDetailModal};
