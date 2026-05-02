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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectIcon: {
    fontSize: 28,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5c2d0a',
    flex: 1,
    marginLeft: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e8d5b0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#8b4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 22,
    width: '90%',
    maxHeight: '80%',
    borderTopWidth: 5,
    elevation: 6,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#3d1f05',
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
    fontSize: 13,
  },
  detailSection: {
    marginBottom: 14,
    backgroundColor: '#fffdf5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0dbb8',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8b4513',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 15,
    color: '#3d1f05',
    lineHeight: 21,
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
    borderRadius: 12,
    gap: 6,
  },
  timerBtn: {
    backgroundColor: '#a0522d',
  },
  editBtn: {
    backgroundColor: '#8b4513',
  },
  deleteBtn: {
    backgroundColor: '#c0392b',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
});

export {TodoDetailModal};
